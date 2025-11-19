import { NextFunction } from 'express';
import { mapPrismaError } from './prismaErrorMapper';

export function handleError(error: unknown, next: NextFunction): void {
    const mapped = mapPrismaError(error);
    next(mapped || error);
}