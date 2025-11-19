import express from "express";
import {login, logout, me, refresh} from "../controllers/auth.controller";
import {authenticate} from "../middlewares/login/authMiddelware";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", authenticate, me);

export default router;
