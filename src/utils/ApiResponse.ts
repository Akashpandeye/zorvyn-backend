import { Response } from "express";

export function ApiResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): void {
  res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    ...(data !== undefined && { data }),
  });
}
