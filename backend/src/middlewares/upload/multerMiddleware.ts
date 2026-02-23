import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import logger from '../../config/loggerConfig';

const uploadBaseDir = path.join(process.cwd(), 'public', 'uploads');

const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        const digitalSolutionId = req.params.id;
        if (!digitalSolutionId || typeof digitalSolutionId !== 'string') {
            return cb(new Error('digitalSolutionId fehlt oder ist ungültig.'), '');
        }

        const folderPath = path.join(
            uploadBaseDir,
            'digitalSolutions',
            digitalSolutionId,
            'images'
        );

        // Ordner anlegen (rekursiv)
        try {
            fs.mkdirSync(folderPath, { recursive: true });
            cb(null, folderPath);
        } catch (err) {
            logger.error('Fehler beim Erstellen des Upload-Verzeichnisses:', err);
            cb(err as Error, '');
        }
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${randomUUID()}${ext}`;
        cb(null, uniqueName);
    },
});

export const multerMiddleware = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // max. 5 MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/png', 'image/jpeg'];
        allowedTypes.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error('Nur PNG und JPEG sind erlaubt.'));
    },
});

export const multerMemory = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Nur PNG und JPEG sind erlaubt.'));
        }
        cb(null, true);
    },
});