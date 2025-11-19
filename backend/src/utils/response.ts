import { Response } from 'express';

export function sendSuccess(res: Response, statusCode: number, data: any, message?: string) {
    return res.status(statusCode).json({
        success: true,
        message: message ?? 'Request successful',
        data,
    });
}

export function sendError(res: Response, statusCode: number, error: string, reason?: string) {
    return res.status(statusCode).json({
        success: false,
        error,
        reason,
    });
}