import type { Request, Response, RequestHandler } from "express";
import {prisma} from "../prisma/prisma";

const selectUpdatedByUser = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
};

export const getImprintStatement: RequestHandler = async (req: Request, res: Response) => {
    try {
        const id = (req.query.id as string | undefined)?.trim();

        const imprint = id
            ? await prisma.imprintStatement.findUnique({
                where: { id },
                include: { updatedBy: { select: selectUpdatedByUser } },
            })
            : await prisma.imprintStatement.findFirst({
                orderBy: { updatedAt: "desc" },
                include: { updatedBy: { select: selectUpdatedByUser } },
            });

        if (!imprint) {
            res.status(404).json({ error: "Kein Impressum vorhanden." });
            return;
        }
        res.status(200).json(imprint);
    } catch (err) {
        console.error("Fehler beim Laden des Impressums:", err);
        res.status(500).json({ error: "Serverfehler beim Impressums-Abruf." });
    }
};

export const updateImprintStatement: RequestHandler = async (req: Request, res: Response) => {
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

        const latest = await prisma.imprintStatement.findFirst({
            orderBy: { updatedAt: "desc" },
            select: { id: true, content: true },
        });
        if (latest && latest.content.trim() === cleaned) {
            const same = await prisma.imprintStatement.findUnique({
                where: { id: latest.id },
                include: { updatedBy: { select: selectUpdatedByUser } },
            });
            res.status(200).json(same);
            return;
        }

        const created = await prisma.imprintStatement.create({
            data: {
                content: cleaned,
                updatedBy: { connect: { id: actor.id } }, // Relation "ImprintUpdatedBy"
            },
            include: { updatedBy: { select: selectUpdatedByUser } },
        });

        res.status(201).json(created);
    } catch (err) {
        console.error("Fehler beim Aktualisieren des Impressums:", err);
        res.status(500).json({ error: "Serverfehler beim Aktualisieren des Impressums." });
    }
};