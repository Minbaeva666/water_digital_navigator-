import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

function normalizeMultipartBody(body: any): any {
    const normalized: any = {};

    for (const key in body) {
        if (key.includes('[') && key.includes(']')) {
            // z.B "organization[name]" → { organization: { name: "..." } }
            const [obj, prop] = key.split(/\[|\]/).filter(Boolean);
            if (!normalized[obj]) normalized[obj] = {};
            normalized[obj][prop] = body[key];
        } else {
            normalized[key] = body[key];
        }
    }

    return normalized;
}

export const validate =
    (schema: ZodSchema) =>
        (req: Request, res: Response, next: NextFunction) => {
            const normalizedBody = normalizeMultipartBody(req.body);
            const result = schema.safeParse(normalizedBody);

            if (!result.success) {
                res.status(400).json({
                    error: 'Validierungsfehler',
                    details: result.error.flatten(),
                });
                return;
            }

            req.body = result.data;
            next();
        };