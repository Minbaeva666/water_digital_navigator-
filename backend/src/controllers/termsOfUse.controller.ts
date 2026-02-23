import type { Request, Response, RequestHandler } from "express";
import { prisma } from "../prisma/prisma";
import logger from "../config/loggerConfig";

/**
 * GET /terms-of-use
 *  - Ohne Query: neueste Fassung (updatedAt desc)
 *  - Mit ?id=: spezifische Fassung
 */
export const getTermsOfUse: RequestHandler = async (req: Request, res: Response) => {
    try {
        const id = (req.query.id as string | undefined)?.trim();

        const selectUser = {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        };

        const terms = id
            ? await prisma.termsOfUse.findUnique({
                where: { id },
                include: { updatedBy: { select: selectUser } },
            })
            : await prisma.termsOfUse.findFirst({
                orderBy: { updatedAt: "desc" },
                include: { updatedBy: { select: selectUser } },
            });

        if (!terms) {
            res.status(404).json({ error: "Keine Nutzungsbedingungen vorhanden." });
            return;
        }

        res.status(200).json(terms);
    } catch (err) {
        logger.error("Fehler beim Laden der Terms of Use:", err);
        res.status(500).json({ error: "Serverfehler beim Terms-of-Use-Abruf." });
    }
};

/**
 * POST /terms-of-use
 * Body:
 *  { content: string }
 *
 * Verhalten:
 *  - Erzeugt IMMER eine neue Version (neue Zeile) – Versionierung bleibt erhalten
 *  - Optional: dedupliziert, wenn Inhalt identisch zur neuesten Fassung ist
 *  - setzt updatedById = req.user.id (via authenticate Middleware)
 */
export const updateTermsOfUse: RequestHandler = async (req: Request, res: Response) => {
    try {
        const actor = (req as any)?.user as { id?: string } | undefined;
        if (!actor?.id) {
            res.status(401).json({ error: "Nicht authentifiziert" });
            return;
        }

        const { content } = req.body as { content?: string };
        if (typeof content !== "string" || !content.trim()) {
            res.status(400).json({ error: "content (String) ist erforderlich." });
            return;
        }
        const cleaned = content.trim();

        // Optional: Dedupe – wenn identisch zur neuesten Fassung, keine neue Zeile erzeugen
        const latest = await prisma.termsOfUse.findFirst({
            orderBy: { updatedAt: "desc" },
            select: { id: true, content: true },
        });
        if (latest && latest.content.trim() === cleaned) {
            const same = await prisma.termsOfUse.findUnique({
                where: { id: latest.id },
                include: { updatedBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
            });
            res.status(200).json(same);
            return;
        }

        // Neue Version anlegen
        const created = await prisma.termsOfUse.create({
            data: {
                content: cleaned,
                updatedBy: { connect: { id: actor.id } },
            },
            include: { updatedBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
        });

        res.status(201).json(created);
    } catch (err) {
        logger.error("Fehler beim Aktualisieren der Terms of Use:", err);
        res.status(500).json({ error: "Serverfehler beim Aktualisieren der Terms of Use." });
    }
};
