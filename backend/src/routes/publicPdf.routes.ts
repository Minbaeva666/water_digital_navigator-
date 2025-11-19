import {Router} from "express";
import { authenticate } from "../middlewares/login/authMiddelware";
import { requirePermission } from "../middlewares/requirePermission";
import {deletePublicPdf, getPublicPdf, upsertPublicPdf} from "../controllers/publicPdf.controller";
import fs from "fs";
import {PDF_DIR} from "../config/pdf-dir";
import multer from "multer";

const router = Router();

// Ordner sicherstellen (falls nicht global gemacht)
fs.mkdirSync(PDF_DIR, { recursive: true });

// Variante A: Memory + eigenes Schreiben im Controller (dein aktueller Flow)
export const pdfUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) =>
        file.mimetype === "application/pdf" ? cb(null, true) : cb(new Error("Nur PDF erlaubt")),
});

// Routen
router.get("/", getPublicPdf);
router.post(
    "/",
    authenticate,
    requirePermission("publicPdf.create"),
    pdfUpload.single("file"),
    upsertPublicPdf
);
router.delete(
    "/",
    authenticate,
    requirePermission("publicPdf.delete"),
    deletePublicPdf
);

export default router;