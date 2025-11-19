import express from "express";
import {authenticate} from "../middlewares/login/authMiddelware";
import {requirePermission} from "../middlewares/requirePermission";
import {multerMiddleware} from "../middlewares/upload/multerMiddleware";
import {
  getUnverifiedUsers,
  getRegisteredUsers,
  getModerators,
} from "../controllers/admin.controller";


const router = express.Router();

router.get("/users/unverified",authenticate, requirePermission("users.read"), getUnverifiedUsers);
router.get("/users/registered",authenticate, requirePermission("users.read"), getRegisteredUsers);
router.get("/users/moderators",authenticate, requirePermission("users.read"), getModerators);

export default router;