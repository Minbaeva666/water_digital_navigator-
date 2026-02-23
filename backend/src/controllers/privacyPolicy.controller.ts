import type { Request, Response, RequestHandler } from "express";
import { prisma } from "../prisma/prisma";
import logger from "../config/loggerConfig";

const selectUpdatedByUser = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
};

export const getPrivacyPolicy: RequestHandler = async (req: Request, res: Response) => {
    try {
        const id = (req.query.id as string | undefined)?.trim();

        const policy = id
            ? await prisma.privacyPolicy.findUnique({
                where: { id },
                include: { updatedBy: { select: selectUpdatedByUser } },
            })
            : await prisma.privacyPolicy.findFirst({
                orderBy: { updatedAt: "desc" },
                include: { updatedBy: { select: selectUpdatedByUser } },
            });

        if (!policy) {
            res.status(404).json({ error: "Keine Datenschutzerklärung vorhanden." });
            return;
        }
        res.status(200).json(policy);
    } catch (err) {
        logger.error("Fehler beim Laden der Datenschutzerklärung:", err);
        res.status(500).json({ error: "Serverfehler beim Datenschutzerklärungs-Abruf." });
    }
};

/** POST /privacy-policy  Body: { content: string }  (Versionierung, Dedupe) */
export const updatePrivacyPolicy: RequestHandler = async (req: Request, res: Response) => {
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

        // Dedupe gegen neueste Version
        const latest = await prisma.privacyPolicy.findFirst({
            orderBy: { updatedAt: "desc" },
            select: { id: true, content: true },
        });
        if (latest && latest.content.trim() === cleaned) {
            const same = await prisma.privacyPolicy.findUnique({
                where: { id: latest.id },
                include: { updatedBy: { select: selectUpdatedByUser } },
            });
            res.status(200).json(same);
            return;
        }

        const created = await prisma.privacyPolicy.create({
            data: {
                content: cleaned,
                updatedBy: { connect: { id: actor.id } }, // Relation "PrivacyPolicyUpdatedBy"
            },
            include: { updatedBy: { select: selectUpdatedByUser } },
        });

        res.status(201).json(created);
    } catch (err) {
        logger.error("Fehler beim Aktualisieren der Datenschutzerklärung:", err);
        res.status(500).json({ error: "Serverfehler beim Aktualisieren der Datenschutzerklärung." });
    }
};