import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as authService from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128),
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      res
        .status(400)
        .json({ success: false, errors: validation.error.issues });
      return;
    }

    const result = await authService.register(validation.data);
    ApiResponse(res, 201, "User registered successfully", result);
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      res
        .status(400)
        .json({ success: false, errors: validation.error.issues });
      return;
    }

    const result = await authService.login(validation.data);
    ApiResponse(res, 200, "Login successful", result);
  } catch (error) {
    next(error);
  }
}
