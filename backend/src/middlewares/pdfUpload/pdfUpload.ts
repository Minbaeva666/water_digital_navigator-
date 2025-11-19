import multer from "multer";
import path from "path";
import fs from "fs";

const PDF_DIR = path.join(process.cwd(), "src", "assets", "pdf");
if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });

export const pdfUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});