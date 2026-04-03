import { Request, Response, NextFunction } from "express";
import type { Role } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Insufficient permissions"));
    }

    next();
  };
}
