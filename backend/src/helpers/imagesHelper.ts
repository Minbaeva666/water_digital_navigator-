import {mkdir, rm, unlink} from "fs/promises";
import path from "path";
import {createHash} from "node:crypto";

export const PUBLIC_DIR = path.join(process.cwd(), "public");
export const DS_BASE_DIR = (...parts: string[]) =>
    path.join(PUBLIC_DIR, "uploads", "digitalSolutions", ...parts);

/** Typ-Helfer für Node-Fehler (mit .code) */
type Errno = NodeJS.ErrnoException & { code?: string };

/** ENOENT (= Datei/Ordner nicht gefunden) ignorieren, alles andere weiterwerfen */
const ignoreENOENT = (err: unknown) => {
    const e = err as Errno;
    if (e?.code !== "ENOENT") throw err;
};

/** Ordner (rekursiv) sicherstellen */
export async function ensureDir(dir: string): Promise<void> {
    await mkdir(dir, { recursive: true });
}

/** Datei löschen, falls vorhanden (ENOENT wird ignoriert) */
export async function unlinkIfExists(absPath: string): Promise<void> {
    try {
        await unlink(absPath);
    } catch (err) {
        ignoreENOENT(err);
    }
}

/** Datei/Ordner rekursiv löschen, falls vorhanden (ENOENT wird ignoriert) */
export async function rmIfExists(targetPath: string): Promise<void> {
    try {
        await rm(targetPath, { recursive: true, force: false });
    } catch (err) {
        ignoreENOENT(err);
    }
}

/** Mehrere Dateien „best effort“ löschen (ENOENT ignorieren) */
export async function unlinkManyIfExists(paths: string[]): Promise<void> {
    const results = await Promise.allSettled(paths.map(p => unlink(p)));
    for (const r of results) {
        if (r.status === "rejected") ignoreENOENT(r.reason);
    }
}

 /** Web-Pfad (/uploads/...) zuverlässig in absoluten Pfad unter `public/` auflösen */
 export function resolveWebToAbs(webPath: string): string {
     // optional: absolute URLs zu Relativpfaden machen
     const noHost = webPath.replace(/^https?:\/\/[^/]+/i, "");
     // führende Slashes entfernen → relatives Segment
     const rel = noHost.replace(/^\/+/, "");

     const abs = path.normalize(path.join(PUBLIC_DIR, rel));

     // Guard: result muss innerhalb von PUBLIC_DIR liegen
     if (!abs.startsWith(PUBLIC_DIR + path.sep) && abs !== PUBLIC_DIR) {
         throw new Error("Invalid path outside of public directory");
     }

     return abs;
 }

export const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");
 export const DS_DIR = (...p: string[]) => path.join(PUBLIC_DIR, "uploads", "digitalSolutions", ...p);
