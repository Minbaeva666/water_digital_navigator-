import type { Request, Response } from "express";
import path from "node:path";
import { promises as fs } from "node:fs";
import type { Stats } from "node:fs";
import { PDF_DIR } from "../config/pdf-dir"

function getPublicOrigin(req: Request): string {
    const env = process.env.PUBLIC_ORIGIN?.replace(/\/+$/, "");
    if (env) return env;
    const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
    const host  = (req.headers["x-forwarded-host"]  as string) || req.get("host");
    return `${proto}://${host}`;
}

async function findSinglePdf(): Promise<{ filename: string; stat: Stats } | null> {
    try {
        await fs.mkdir(PDF_DIR, { recursive: true });
        const files = await fs.readdir(PDF_DIR);
        const pdfs = files.filter((f) => /\.pdf$/i.test(f));
        if (pdfs.length === 0) return null;

        const stats = await Promise.all(
            pdfs.map(async (f) => ({
                filename: f,
                stat: await fs.stat(path.join(PDF_DIR, f)),
            }))
        );
        stats.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
        return stats[0];
    } catch {
        return null;
    }
}

/** GET /api/public-pdf (Admin-Meta) */
export async function getPublicPdf(req: Request, res: Response) {
  try {
    const info = await findSinglePdf();
    if (!info) {
      res.json({ exists: false });
      return;
    }

    const publicUrl = `${getPublicOrigin(req)}/api/pdf/${encodeURIComponent(
      info.filename
    )}?t=${Date.now()}`;

    res.json({
      exists: true,
      filename: info.filename,
      publicUrl,
      size: info.stat.size,
      updatedAt: info.stat.mtime.toISOString(),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Fehler beim Lesen der PDF." });
  }
}


/** POST /api/public-pdf (Admin-Upload, exakt 1 PDF zulassen) */
export async function upsertPublicPdf(req: Request, res: Response) {
    try {
        const file = (req as any).file as Express.Multer.File | undefined;
        if (!file) {
            res.status(400).json({ error: "Keine Datei übermittelt." });
            return;
        }
        if (file.mimetype !== "application/pdf") {
            res.status(400).json({ error: "Nur PDF-Dateien sind erlaubt." });
            return;
        }

        await fs.mkdir(PDF_DIR, { recursive: true });

        // vorhandene PDFs löschen
        const existing = await fs.readdir(PDF_DIR);
        await Promise.all(
            existing.filter((f) => /\.pdf$/i.test(f)).map((f) => fs.rm(path.join(PDF_DIR, f), { force: true }))
        );

        // Dateinamen entschärfen + Traversal verhindern
        const safeName =
            path.basename(file.originalname).replace(/[^\w.\-]+/g, "_") || "upload.pdf";
        const dest = path.join(PDF_DIR, safeName);
        const absDest = path.resolve(dest);
        if (!absDest.startsWith(PDF_DIR + path.sep) && absDest !== PDF_DIR) {
            res.status(400).json({ error: "Ungültiger Dateiname." });
            return;
        }

        // Bei memoryStorage: file.buffer schreiben
        await fs.writeFile(absDest, file.buffer);

        const stat = await fs.stat(absDest);
        const publicUrl = `${getPublicOrigin(req)}/api/pdf/${encodeURIComponent(safeName)}?t=${Date.now()}`;

        res.json({
            exists: true,
            filename: safeName,
            publicUrl,
            size: stat.size,
            updatedAt: stat.mtime.toISOString(),
            message: "PDF erfolgreich hochgeladen.",
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Upload fehlgeschlagen." });
    }
}

/** DELETE /api/public-pdf (Admin-Löschen) */
export async function deletePublicPdf(req: Request, res: Response) {
    try {
        await fs.mkdir(PDF_DIR, { recursive: true });
        const files = await fs.readdir(PDF_DIR);
        let deleted = 0;
        await Promise.all(
            files
                .filter((f) => /\.pdf$/i.test(f))
                .map(async (f) => {
                    await fs.rm(path.join(PDF_DIR, f), { force: true });
                    deleted++;
                })
        );

        res.json({
            ok: true,
            message: deleted > 0 ? "PDF gelöscht." : "Keine PDF vorhanden.",
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Löschen fehlgeschlagen." });
    }
}