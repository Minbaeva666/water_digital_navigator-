// middleware/requestLogger.ts
import { Request, Response, NextFunction } from 'express';
import { logService } from '../../services/logger/loggerService';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        };

        if (res.statusCode >= 400) {
            logService.warn(`HTTP ${req.method} ${req.path} ${res.statusCode}`, log);
        } else {
            logService.info(`HTTP ${req.method} ${req.path} ${res.statusCode}`, log);
        }
    });

    next();
};