import fs from 'fs/promises';
import path from 'path';
import logger from '../config/loggerConfig';

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
        logger.info(`Ordner gelöscht: ${folderPath}`);
    } catch (err) {
        logger.error("Fehler beim Löschen des Upload-Ordners:", err);
    }
};