import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

export const uploadLogo = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            // Datei überspringen, aber keinen LIMIT_UNEXPECTED_FILE-Error werfen
            return cb(null, false);
        }
        cb(null, true);
    },
});