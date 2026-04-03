import { Router } from "express";
import * as userController from "./user.controller.js";

const router = Router();

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id/role", userController.updateRole);
router.patch("/:id/status", userController.updateStatus);
router.delete("/:id", userController.deleteUser);

export default router;
