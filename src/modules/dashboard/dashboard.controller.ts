import { Request, Response, NextFunction } from "express";
import * as dashboardService from "./dashboard.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export async function getSummary(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const summary = await dashboardService.getSummary();
    ApiResponse(res, 200, "Dashboard summary retrieved", summary);
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBreakdown(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const breakdown = await dashboardService.getCategoryBreakdown();
    ApiResponse(res, 200, "Category breakdown retrieved", breakdown);
  } catch (error) {
    next(error);
  }
}

export async function getMonthlyTrends(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const trends = await dashboardService.getMonthlyTrends(year);
    ApiResponse(res, 200, "Monthly trends retrieved", trends);
  } catch (error) {
    next(error);
  }
}

export async function getRecentActivity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.max(
      1,
      Math.min(50, parseInt(req.query.limit as string) || 5)
    );
    const activity = await dashboardService.getRecentActivity(limit);
    ApiResponse(res, 200, "Recent activity retrieved", activity);
  } catch (error) {
    next(error);
  }
}
