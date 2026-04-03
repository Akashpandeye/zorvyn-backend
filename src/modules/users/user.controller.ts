import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as userService from "./user.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const updateRoleSchema = z.object({
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]),
});

const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));

    const result = await userService.getUsers({ page, limit });
    ApiResponse(res, 200, "Users retrieved successfully", result);
  } catch (error) {
    next(error);
  }
}

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const user = await userService.getUserById(id);
    ApiResponse(res, 200, "User retrieved successfully", user);
  } catch (error) {
    next(error);
  }
}

export async function updateRole(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = updateRoleSchema.safeParse(req.body);

    if (!validation.success) {
      res
        .status(400)
        .json({ success: false, errors: validation.error.issues });
      return;
    }

    const user = await userService.updateRole(
      req.params.id as string,
      validation.data.role
    );
    ApiResponse(res, 200, "User role updated successfully", user);
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = updateStatusSchema.safeParse(req.body);

    if (!validation.success) {
      res
        .status(400)
        .json({ success: false, errors: validation.error.issues });
      return;
    }

    const user = await userService.updateStatus(
      req.params.id as string,
      validation.data.isActive
    );
    ApiResponse(res, 200, "User status updated successfully", user);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await userService.deleteUser(req.params.id as string);
    ApiResponse(res, 200, "User deleted successfully");
  } catch (error) {
    next(error);
  }
}
