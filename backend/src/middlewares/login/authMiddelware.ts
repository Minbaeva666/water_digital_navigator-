import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../../prisma/prisma";

export interface AuthUser {
    id: string;
    role: Role;
    organizationId: string | null;
}

const ACCESS_SECRET = process.env.ACCESS_SECRET as jwt.Secret;

function getBearerToken(authHeader?: string | null): string | null {
    if (!authHeader) return null;
    const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
    const token = match?.[1]?.trim();
    if (!token || token.toLowerCase() === "null" || token.toLowerCase() === "undefined") {
        return null;
    }
    return token;
}

// Payload-Typ
interface TokenPayload extends jwt.JwtPayload {
    id: string;
    role: Role;
    organizationId?: string | null; // kann im Token fehlen
}

export const authenticate: RequestHandler = async (req, res, _next) => {
    try {
        const token = getBearerToken(req.headers.authorization);
        if (!token) {
            res.status(401).json({ error: "Unauthorized", reason: "no_token" });
            return;
        }

        let decoded: TokenPayload;
        try {
            decoded = jwt.verify(token, ACCESS_SECRET) as TokenPayload;
        } catch (e) {
            if (e instanceof TokenExpiredError) {
                res.status(401).json({ error: "Access token expired", reason: "access_token_expired" });
                return;
            }
            if (e instanceof JsonWebTokenError) {
                res.status(401).json({ error: "Invalid access token", reason: "access_token_invalid" });
                return;
            }
            res.status(500).json({ error: "Something went wrong", reason: "jwt_verify_failed" });
            return;
        }

        if (!decoded?.id || !decoded?.role) {
            res.status(401).json({ error: "Invalid token payload", reason: "access_token_invalid_payload" });
            return;
        }

        // organizationId normalisieren/auffüllen
        let organizationId: string | null;
        if (decoded.organizationId === undefined) {
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { organizationId: true },
            });
            if (!user) {
                res.status(401).json({ error: "User not found", reason: "user_not_found" });
                return;
            }
            organizationId = user.organizationId ?? null;
        } else {
            organizationId = decoded.organizationId ?? null;
        }

        (req as any).user = {
            id: decoded.id,
            role: decoded.role,
            organizationId,
        } as AuthUser;

        // Erfolgreich authentifiziert
        _next();
    } catch (_err) {
        // Nur echte Serverfehler landen hier (nicht Token-Probleme)
        res.status(500).json({ error: "Something went wrong", reason: "internal_server_error" });
    }
};
