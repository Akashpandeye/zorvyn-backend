import { Router } from "express";
import * as transactionController from "./transaction.controller.js";
import { requireRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.post("/", requireRole("ADMIN"), transactionController.create);
router.get("/", transactionController.getAll);
router.get("/:id", transactionController.getById);
router.patch("/:id", requireRole("ADMIN"), transactionController.update);
router.delete("/:id", requireRole("ADMIN"), transactionController.remove);

export default router;
