import fs from 'fs/promises';
import handlebars from 'handlebars';
import path from 'path';
import {Response} from "express";
import {sendSuccess} from "./response";
import logger from '../config/loggerConfig';

export async function loadEmailTemplate(templateRelativePath: string, data: Record<string, any>): Promise<string> {
    const fullPath = path.resolve(__dirname, templateRelativePath);
    const source = await fs.readFile(fullPath, 'utf8');
    const template = handlebars.compile(source);
    return template(data);
}

export async function safeEmailRun<T>(
    emailFn: () => Promise<any>,
    res: Response,
    successStatus: number,
    successData: T,
    successMessage: string,
    errorMessage = 'Email sending failed'
): Promise<void> {
    try {
        await emailFn();
        sendSuccess(res, successStatus, successData, successMessage);
    } catch (error) {
        logger.error(`[safeEmailRun] ${errorMessage}:`, error);
        res.status(500).json({ error: errorMessage });
    }
}