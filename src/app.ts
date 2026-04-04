import express from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import transactionRoutes from "./modules/transactions/transaction.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

import { verifyToken } from "./middlewares/auth.middleware.js";
import { requireRole } from "./middlewares/role.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.set("trust proxy", 1);

const corsOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
  : undefined;

if (env.NODE_ENV === "production" && !corsOrigins?.length) {
  console.warn(
    "[config] CORS_ORIGIN is unset — browsers on other origins may be blocked. Set CORS_ORIGIN to your frontend URL(s), comma-separated."
  );
}

app.use(helmet());
app.use(
  cors({
    origin: corsOrigins?.length ? corsOrigins : true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", verifyToken, requireRole("ADMIN"), userRoutes);
app.use("/api/transactions", verifyToken, transactionRoutes);
app.use("/api/dashboard", verifyToken, dashboardRoutes);

app.use(errorHandler);

export { app };
