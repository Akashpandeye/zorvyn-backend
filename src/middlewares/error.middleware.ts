import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  const prismaError = err as unknown as Record<string, unknown>;

  if (prismaError.code === "P2002") {
    res.status(409).json({
      success: false,
      message: "Already exists",
    });
    return;
  }

  if (prismaError.code === "P2025") {
    res.status(404).json({
      success: false,
      message: "Record not found",
    });
    return;
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
