import path from "node:path";
import fs from "node:fs";

export const PDF_DIR = path.resolve(
    process.env.PUBLIC_PDF_DIR ?? "/var/www/html/dilowa_backend/public/assets/pdf"
);

if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });