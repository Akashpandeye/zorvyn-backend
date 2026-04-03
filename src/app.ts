import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import transactionRoutes from "./modules/transactions/transaction.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

import { verifyToken } from "./middlewares/auth.middleware.js";
import { requireRole } from "./middlewares/role.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors());
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
