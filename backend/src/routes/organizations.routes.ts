import express from "express";
import {
    createOrganization,
    getOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizations,
    getOrganizationsBase,
    getOrganizationsMinimalWithoutPresenter,
    getOrganizationsForRegistration

} from "../controllers/organization.controller";
import {uploadLogo} from "../middlewares/uploadLogo/uploadLogo";
import {authenticate} from "../middlewares/login/authMiddelware";

const router = express.Router();

router.get("/for-registration", getOrganizationsForRegistration);
router.get("/minimal-organizations-without-presenter", authenticate, getOrganizationsMinimalWithoutPresenter);
router.get("/base", getOrganizationsBase);
router.get("/:id", getOrganization);
router.put("/:id",uploadLogo.single('logoBase64'),  updateOrganization);
router.delete("/:id", deleteOrganization);
router.get("/", getOrganizations);
router.post("/", uploadLogo.single('logoBase64'), createOrganization);


export default router;
