import express from "express";
const router = express.Router();
import { validate } from '../middlewares/validate/validate';
import {registerAsRepresentativeSchema} from "../prisma/schemas/user/registerUserSchema";
import {registerAsPrivateSchema} from "../prisma/schemas/user/registerUserSchema";
import { uploadLogo } from '../middlewares/uploadLogo/uploadLogo';
import {
  registerAsRepresentative,
  registerAsPrivate,
  verifyEmail,
  revokeRegistration,
} from "../controllers/registration.controller";

router.post("/register-as-representative", uploadLogo.single('logo'), validate(registerAsRepresentativeSchema), registerAsRepresentative);
router.post("/register-as-private", validate(registerAsPrivateSchema), registerAsPrivate);
router.get("/verify-email", verifyEmail);
router.get("/revoke-registration", revokeRegistration);

export default router;