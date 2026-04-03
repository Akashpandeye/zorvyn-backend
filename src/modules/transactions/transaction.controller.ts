import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as transactionService from "./transaction.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

const createTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required").max(100),
  date: z.string().datetime({ message: "Invalid ISO date string" }),
  notes: z.string().max(500).optional(),
});

const updateTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().min(1).max(100).optional(),
  date: z.string().datetime({ message: "Invalid ISO date string" }).optional(),
  notes: z.string().max(500).optional(),
});

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = createTransactionSchema.safeParse(req.body);

    if (!validation.success) {
      res
        .status(400)
        .json({ success: false, errors: validation.error.issues });
      return;
    }

    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const transaction = await transactionService.create(
      validation.data,
      req.user.userId
    );
    ApiResponse(res, 201, "Transaction created successfully", transaction);
  } catch (error) {
    next(error);
  }
}

export async function getAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit as string) || 10)
    );

    const filters = {
      type: req.query.type as "INCOME" | "EXPENSE" | undefined,
      category: req.query.category as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      page,
      limit,
    };

    const result = await transactionService.getAll(filters);
    ApiResponse(res, 200, "Transactions retrieved successfully", result);
  } catch (error) {
    next(error);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const transaction = await transactionService.getById(req.params.id as string);
    ApiResponse(res, 200, "Transaction retrieved successfully", transaction);
  } catch (error) {
    next(error);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = updateTransactionSchema.safeParse(req.body);

    if (!validation.success) {
      res
        .status(400)
        .json({ success: false, errors: validation.error.issues });
      return;
    }

    const transaction = await transactionService.update(
      req.params.id as string,
      validation.data
    );
    ApiResponse(res, 200, "Transaction updated successfully", transaction);
  } catch (error) {
    next(error);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await transactionService.softDelete(req.params.id as string);
    ApiResponse(res, 200, "Transaction deleted successfully");
  } catch (error) {
    next(error);
  }
}
