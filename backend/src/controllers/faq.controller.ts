// controllers/faq.controller.ts
import type { Request, Response, RequestHandler } from "express";
import { prisma } from "../prisma/prisma";
import logger from "../config/loggerConfig";


export const getFaq: RequestHandler = async (req: Request, res: Response) => {
    try {
        const id = (req.query.id as string | undefined)?.trim();

        const faq = id
            ? await prisma.faq.findUnique({
                where: { id },
                include: { items: { orderBy: { sort: "asc" } } },
            })
            : await prisma.faq.findFirst({
                orderBy: { updatedAt: "desc" },
                include: { items: { orderBy: { sort: "asc" } } },
            });

        if (!faq) {
            res.status(404).json({ error: "FAQ nicht gefunden." });
            return;
        }

        res.status(200).json(faq);
    } catch (err) {
        logger.error("Fehler beim Laden des FAQ:", err);
        res.status(500).json({ error: "Serverfehler beim FAQ-Abruf." });
    }
};

export const updateFaq: RequestHandler = async (req: Request, res: Response) => {
    try {
        // Optional analog zu deinen anderen Endpoints:
        const { user } = req as Request;
        if (!user) {
            res.status(401).json({ error: "Nicht authentifiziert" });
            return;
        }

        const { id, items } = req.body as {
            id?: string;
            items: Array<{ header?: string; content?: string }>;
        };

        if (!Array.isArray(items)) {
            res.status(400).json({ error: "items muss ein Array sein." });
            return;
        }

        // Minimal-Validierung
        const cleaned = items.map((it) => ({
            header: (it.header ?? "").trim(),
            content: (it.content ?? "").trim(),
        }));
        const invalidIdx = cleaned.findIndex((x) => !x.header || !x.content);
        if (invalidIdx !== -1) {
            res.status(400).json({
                error: `Ungültiges Item an Position ${invalidIdx + 1}: header und content sind erforderlich.`,
            });
            return;
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1) FAQ bestimmen/erzeugen
            let faqId: string;

            if (id) {
                const existing = await tx.faq.findUnique({ where: { id }, select: { id: true } });
                if (!existing) {
                    res.status(404).json({ error: "FAQ nicht gefunden." });
                    throw new Error("ABORT_TX");
                }
                faqId = existing.id;
            } else {
                // falls schon eines existiert, dieses nehmen; sonst neu anlegen
                const first = await tx.faq.findFirst({ select: { id: true } });
                faqId = first ? first.id : (await tx.faq.create({ data: {} })).id;
            }

            // 2) Alte Items löschen (Hard-Replace)
            await tx.faqItem.deleteMany({ where: { faqId } });

            // 3) Neue Items in Reihenfolge anlegen
            await Promise.all(
                cleaned.map((it, idx) =>
                    tx.faqItem.create({
                        data: {
                            faqId,
                            header: it.header,
                            content: it.content,
                            sort: idx,
                        },
                    })
                )
            );

            // 4) Optional: updatedAt der Faq "anticken"
            // Prisma @updatedAt wird nur gesetzt, wenn die Faq-Row geupdatet wird.
            // Falls du zwingend updatedAt bei Item-Änderungen aktualisieren willst,
            // füge der Faq ein Meta-Feld hinzu (z. B. title) und update es hier,
            // oder nutze ein Raw-Query. Vorläufig lassen wir es so.

            // 5) Ergebnis zurückgeben
            const faq = await tx.faq.findUnique({
                where: { id: faqId },
                include: { items: { orderBy: { sort: "asc" } } },
            });

            return faq!;
        });

        res.status(200).json(result);
    } catch (err: any) {
        if (err?.message === "ABORT_TX") return;
        logger.error("Fehler beim Aktualisieren des FAQ:", err);
        res.status(500).json({ error: "Serverfehler beim Aktualisieren des FAQ." });
    }
};
