import fs from 'fs/promises';
import path from 'path';

export const cleanupUploadFolder = async (digitalSolutionId: string) => {
    const folderPath = path.join(
        process.cwd(),
        'public',
        'uploads',
        'digitalSolutions',
        digitalSolutionId
    );

    try {
        await fs.rm(folderPath, { recursive: true, force: true });
        console.log(`Ordner gelöscht: ${folderPath}`);
    } catch (err) {
        console.error("Fehler beim Löschen des Upload-Ordners:", err);
    }
};