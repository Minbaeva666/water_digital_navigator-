import {Request, Response, NextFunction} from 'express';
import {ApiError} from '../errors/ApiError';
import {mapPrismaError} from "../utils/prismaErrorMapper";
import logger from "../config/loggerConfig";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (process.env.NODE_ENV !== 'production') {
        logger.error('[Error]', err);
    }

    // Eigene definierte Fehlerklasse
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({error: err.message});
        return;
    }

    // Prisma-Fehler
    const prismaMapped = mapPrismaError(err);
    if (prismaMapped) {
        res.status(prismaMapped.statusCode).json({error: prismaMapped.message});
        return
    }

    // Fallback
    res.status(500).json({
        error: 'Something went wrong',
        reason: 'internal_server_error',
    });
};
