import express from "express";
import { getFaq, updateFaq } from "../controllers/faq.controller";
import { getTermsOfUse, updateTermsOfUse } from "../controllers/termsOfUse.controller";

import { authenticate } from "../middlewares/login/authMiddelware";
import { requirePermission } from "../middlewares/requirePermission";
import {getPrivacyPolicy, updatePrivacyPolicy} from "../controllers/privacyPolicy.controller";
import {getImprintStatement, updateImprintStatement} from "../controllers/imprint.controller";
import {getAccessibilityStatement, updateAccessibilityStatement} from "../controllers/accessibility.controller";

const router = express.Router();

/**
 * FAQ
 */
router.get("/faq", getFaq);
router.post("/faq", authenticate, requirePermission("faq.create"), updateFaq);

/**
 * Terms of Use (Nutzungsbedingungen)
 */
router.get("/terms-of-use", getTermsOfUse);
router.post(
    "/terms-of-use",
    authenticate,
    requirePermission("termsOfUse.create"),
    updateTermsOfUse
);

/**
 * Privacy Policy (Datenschutz)
 */
router.get("/privacy-policy", getPrivacyPolicy);
router.post(
    "/privacy-policy",
    authenticate,
    requirePermission("privacyPolicy.create"),
    updatePrivacyPolicy
);

/**
 * Imprint (Impressum)
 */
router.get("/imprint", getImprintStatement);
router.post(
    "/imprint",
    authenticate,
    requirePermission("imprintStatement.create"),
    updateImprintStatement
);

/**
 * Accessibility (Barrierefreiheit)
 */
router.get("/accessibility", getAccessibilityStatement);
router.post(
    "/accessibility",
    authenticate,
    requirePermission("accessibilityStatement.create"),
    updateAccessibilityStatement
);

export default router;
