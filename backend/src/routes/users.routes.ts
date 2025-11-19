import express from "express";
import {
    createUser, createUserWithOrganization, deleteUser, getUser, getUserMinimal,
    getUsersByRoles,
    getUsersByState, getUsersMinimal,
    getUsersWithOrganizations,
    updateUser, updateUserWithCreateOrganization,
} from "../controllers/user.controller";
import {authenticate} from "../middlewares/login/authMiddelware";
import {requirePermission} from "../middlewares/requirePermission";
import {uploadLogo} from "../middlewares/uploadLogo/uploadLogo";
import {
  resetPasswordRequest,
  resetPassword,
} from "../controllers/user.controller";


const router = express.Router();

router.post("/reset-password-request", resetPasswordRequest);
router.post("/reset-password", resetPassword);
router.get("/by-state",authenticate, requirePermission("user.read"), getUsersByState);
router.get("/by-role",authenticate, requirePermission("user.read"), getUsersByRoles);
router.get("/with-organization",authenticate, requirePermission("user.read"), getUsersWithOrganizations);
router.get("/minimal-users", getUsersMinimal);
router.get("/minimal-user",authenticate, requirePermission("user.read"), getUserMinimal);

router.post('/create-user-with-organization',uploadLogo.single('logo'), authenticate, requirePermission("user.create"), createUserWithOrganization);
router.get("/:id",authenticate, requirePermission("user.read"), getUser);
router.put("/:id", authenticate, requirePermission("user.edit"), updateUser);
router.delete("/:id",authenticate, requirePermission("user.delete"), deleteUser);
router.put("/:id/organization", authenticate, requirePermission("user.edit"), uploadLogo.single('logo'), updateUserWithCreateOrganization);
router.post('/', authenticate, requirePermission("user.create"), createUser);


export default router;



