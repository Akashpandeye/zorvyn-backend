import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, Role } from "../../config/db.js";
import { ApiError } from "../../utils/ApiError.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

interface LoginInput {
  email: string;
  password: string;
}

function generateToken(userId: string, role: Role): string {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
}

export async function register(input: RegisterInput) {
  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role ?? "VIEWER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const token = generateToken(user.id, user.role);

  return { user, token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}
