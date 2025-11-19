import express from "express";
import {authenticate} from "../middlewares/login/authMiddelware";
import {requirePermission} from "../middlewares/requirePermission";
import {
    getAccountStateTypes,
    getAllOrganizations,
    getMaturityDegrees,
    getDigitalSolutionStateTypes,
    getOfferingCategories,
    getOrganizationTypes,
    getPresentedByTypes,
    getRoleTypes,
    getSalutationTypes,
    getCountries,
    getRegions, getPublishedBy,
} from "../controllers/inputController";


const router = express.Router();

router.get("/countries", getCountries);
router.get("/regions", getRegions);
router.get("/organization-types", getOrganizationTypes);
router.get("/published-by-types", getPublishedBy);
router.get("/salutation-types", getSalutationTypes);
router.get("/account-state-types", getAccountStateTypes);
router.get("/role-types", getRoleTypes);
router.get("/digital-solution-state-types", getDigitalSolutionStateTypes);
router.get("/maturity-degrees", getMaturityDegrees);
router.get("/offering-category-types", getOfferingCategories);
router.get("/presented-by-types",authenticate, requirePermission("digital_solution.create"), getPresentedByTypes);
router.get("/all-organizations",authenticate, requirePermission("digital_solution.create"), getAllOrganizations);


export default router;
