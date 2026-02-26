import {NextFunction, Request, RequestHandler, Response} from "express";
import path from "path";
import { mkdir } from "fs/promises";
import fs from "fs";
import {
    MaturityDegree,
    DigitalSolutionState,
    ImageType,
    OfferingCategory,
    Prisma, PublishedByType,
} from "@prisma/client";
import {prisma} from "../prisma/prisma";
import {DigitalSolutionImageDto} from "../shared/dtos/DigitalSolutionImageDto";
import {cleanupUploadFolder} from "../utils/cleanupUploadFolder";
import {randomUUID} from "crypto";
import { toSet } from "../utils/mapper";
import {
    DS_DIR,
    ensureDir,
    PUBLIC_DIR,
    sha256,
    unlinkIfExists
} from "../helpers/imagesHelper";
import {readFile, rename, writeFile} from "node:fs/promises";
import { parseOrToday } from "../utils/date";
import { sendDigitalSolutionCreatedNotification } from "../services/email/sendMail";
import logger from "../config/loggerConfig";

interface MulterErrorRequest extends Request {
    multerError?: Error;
}

const logError = (...args: unknown[]) => {
    logger.error("digitalSolution.controller error", {
        details: args,
    });
};

const slugifyTaxonomy = (input: string) =>
    input
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/&/g, "und")
        .replace(/\//g, "-")
        .replace(/[^a-zA-Z0-9\- ]+/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

const ensureUniqueSlug = async (
    tx: Prisma.TransactionClient,
    baseSlug: string,
    parentId: string
) => {
    const suffix = parentId.slice(-6);
    let attempt = 0;
    while (attempt < 1000) {
        const candidate = attempt === 0
            ? `${baseSlug}-${suffix}`
            : `${baseSlug}-${suffix}-${attempt}`;
        const exists = await tx.taxonomyNode.findUnique({
            where: { slug: candidate },
            select: { id: true },
        });
        if (!exists) return candidate;
        attempt++;
    }
    throw new Error("Kein eindeutiger Slug für Taxonomie-Knoten gefunden.");
};

const ensureTaxonomyOtherNodes = async (
    tx: Prisma.TransactionClient,
    taxonomyOther: Record<string, string> | undefined,
    taxonomyIdSet: Set<string>
) => {
    if (!taxonomyOther) return;

    for (const [parentId, rawText] of Object.entries(taxonomyOther)) {
        const text = (rawText ?? "").trim();
        if (!parentId || !text) continue;

        const parent = await tx.taxonomyNode.findUnique({
            where: { id: parentId },
            select: {
                id: true,
                path: true,
                depth: true,
                type: true,
                color: true,
            },
        });
        if (!parent) continue;

        const siblings = await tx.taxonomyNode.findMany({
            where: { parentId },
            select: { id: true, nameDe: true, sort: true },
        });

        const existing = siblings.find(
            (node) => node.nameDe.trim().toLowerCase() === text.toLowerCase()
        );
        if (existing) {
            taxonomyIdSet.add(existing.id);
            continue;
        }

        const baseSlug = slugifyTaxonomy(text) || "kategorie";
        const slug = await ensureUniqueSlug(tx, baseSlug, parent.id);
        const path = `${parent.path}/${slug}`;
        const nextSort = siblings.length
            ? Math.max(...siblings.map((s) => s.sort ?? 0)) + 1
            : 1;

        const created = await tx.taxonomyNode.create({
            data: {
                parentId: parent.id,
                type: parent.type,
                slug,
                nameDe: text,
                path,
                depth: parent.depth + 1,
                sort: nextSort,
                color: parent.color ?? undefined,
            },
            select: { id: true },
        });

        taxonomyIdSet.add(created.id);
    }
};

// ---------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------
export const createDigitalSolution: RequestHandler = async (req, res, next) => {
    try {
        const { user } = req as Request & { user?: { id: string; role: string } };
        if (!user) {
            res.status(401).json({ error: "Nicht authentifiziert" });
            return;
        }

        const {
            state,
            presentedByUserId,
            name,
            link,
            readyForOperation,
            maturityDegree,
            offeringCategory,
            shortDescription,
            longDescription,
            goalDescription,
            technicalDescription,
            efficiencyDescription,
            processDescription,
            socialRelevanceDescription,
            targetGroupOther,
            hasAcceptedTerms,
            hasAcceptedPrivacyPolicy,
            projectPartnerIds,
            solutionUserIds,
            solutionPresentedByUser,
            taxonomyNodeIds,
            taxonomyOther,
            publishedBy,
            publishedSource
        } = req.body as {
            presentedByUserId?: string;
            name: string;
            link: string;
            readyForOperation: string;
            maturityDegree: string;
            offeringCategory: string;
            state: string;
            publishedBy: string;
            publishedSource: string;
            shortDescription: string;
            longDescription: string;
            goalDescription: string;
            technicalDescription: string;
            efficiencyDescription?: string;
            processDescription?: string;
            socialRelevanceDescription?: string;
            targetGroupOther?: string;
            hasAcceptedTerms: string | boolean;
            hasAcceptedPrivacyPolicy: string | boolean;
            projectPartnerIds: string[] | string;
            solutionUserIds: string[] | string;
            solutionPresentedByUser?: boolean;
            taxonomyNodeIds?: string[] | string;
            taxonomyOther?: Record<string, string>;
        };

        const isUser = user.role === "USER";
        const effectivePresenterId = isUser ? user.id : presentedByUserId ?? null;

        const normalizedState: DigitalSolutionState =
            isUser ? DigitalSolutionState.REQUESTED : (state as DigitalSolutionState);

        // Datum parsen
        let readyDate: Date | null = null;
        if (typeof readyForOperation === "string" && !readyForOperation.startsWith("Invalid Date")) {
            const d = new Date(readyForOperation);
            if (!isNaN(d.getTime())) readyDate = d;
        }

        const toConnect = (input?: string[] | string) => {
            const ids = Array.isArray(input) ? input : input ? [input] : [];
            return ids.length > 0 ? { connect: ids.map((id) => ({ id: `${id}` })) } : undefined;
        };

        // Taxonomie-IDs flach & dedupliziert
        const flatTaxIds = Array.isArray(taxonomyNodeIds)
            ? taxonomyNodeIds
            : taxonomyNodeIds
                ? [taxonomyNodeIds]
                : [];
        const taxonomyIds = [...new Set(flatTaxIds.filter(Boolean))];
        const taxonomyIdSet = new Set<string>(taxonomyIds);

        // (Optional) Validierung: existieren alle TaxonomyNode-IDs?
        if (taxonomyIds.length > 0) {
            const existing = await prisma.taxonomyNode.findMany({
                where: { id: { in: taxonomyIds } },
                select: { id: true },
            });
            const existingSet = new Set(existing.map((n) => n.id));
            const missing = taxonomyIds.filter((id) => !existingSet.has(id));
            if (missing.length) {
                res.status(400).json({
                    error: {
                        code: "INVALID_TAXONOMY_NODES",
                        message: "Einige Taxonomie-IDs existieren nicht.",
                        missing,
                    },
                });
                return;
            }
        }

        // Presenter-Relationen vorbereiten
        // Presenter-Relationen vorbereiten (optional)
let presenterConnect: Record<string, any> = {};
if (effectivePresenterId) {                        // ← use it
    const dbUser = await prisma.user.findUnique({
        where: { id: effectivePresenterId },
        select: { organizationId: true },
    });
    if (!dbUser) {
        res.status(404).json({ error: "Presenter-User nicht gefunden." });
        return;
    }
    presenterConnect = dbUser.organizationId
        ? { organization: { connect: { id: dbUser.organizationId } } }
        : { user: { connect: { id: effectivePresenterId } } };
    presenterConnect = {
        ...presenterConnect,
        presentedByUser: { connect: { id: effectivePresenterId } },
    };
}


        // Alles in einer Transaktion
        const result = await prisma.$transaction(async (tx) => {
            await ensureTaxonomyOtherNodes(tx, taxonomyOther, taxonomyIdSet);
            const taxonomyIdsFinal = [...taxonomyIdSet];

            const solution = await tx.digitalSolution.create({
                data: {
                    name,
                    link,
                    readyForOperation: readyDate,
                    maturityDegree: maturityDegree as MaturityDegree,
                    offeringCategory: offeringCategory as OfferingCategory,
                    publishedBy: publishedBy as PublishedByType,
                    publishedSource,
                    shortDescription,
                    longDescription,
                    goalDescription,
                    technicalDescription,
                    solutionPresentedByUser,
                    hasAcceptedTerms:
                        typeof hasAcceptedTerms === "string" ? hasAcceptedTerms === "true" : !!hasAcceptedTerms,
                    hasAcceptedPrivacyPolicy:
                        typeof hasAcceptedPrivacyPolicy === "string" ? hasAcceptedPrivacyPolicy === "true" : !!hasAcceptedPrivacyPolicy,
                    state: normalizedState,
                    ...(efficiencyDescription ? { efficiencyDescription } : {}),
                    ...(socialRelevanceDescription ? { socialRelevanceDescription } : {}),
                    ...(processDescription ? { processDescription } : {}),
                    ...(targetGroupOther?.trim() ? { targetGroupOther: targetGroupOther.trim() } : {}),
                    ...(toConnect(projectPartnerIds) ? { projectPartners: toConnect(projectPartnerIds) } : {}),
                    ...(toConnect(solutionUserIds) ? { solutionUsers: toConnect(solutionUserIds) } : {}),
                    ...presenterConnect,
                },
                select: { id: true},
            });

            // Taxonomie-Relationen anlegen
            if (taxonomyIdsFinal.length > 0) {
                await tx.digitalSolutionTaxonomy.createMany({
                    data: taxonomyIdsFinal.map((taxonomyNodeId) => ({
                        digitalSolutionId: solution.id,
                        taxonomyNodeId,
                    })),
                    skipDuplicates: true,
                });
            }

            return solution;
        });

        if (isUser) {
      const creator = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (creator) {
        try {
          await sendDigitalSolutionCreatedNotification({
            digitalSolutionId: result.id,
            digitalSolutionName: name,
            creatorEmail: creator.email,
            creatorName: creator.firstName && creator.lastName ? `${creator.firstName} ${creator.lastName}` : undefined,
            state: normalizedState,
          });
                } catch (e) {
                    logError("EMAIL SEND FAILED (digitalSolutionCreated)", {
            ctx: "sendDigitalSolutionCreatedNotification",
            error: e,
          });
        }
      }
    }
    res.status(201).json({
      digitalSolutionId: result.id,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------
export const updateDigitalSolution: RequestHandler = async (req, res, next) => {
    try {
        const { user } = req as Request & { user?: { id: string; role: string } };
        if (!user) {
            res.status(401).json({ error: "Nicht authentifiziert" });
            return;
        }

        const { id } = req.params as { id?: string };
        if (!id) {
            res.status(400).json({ error: "digitalSolutionId fehlt." });
            return;
        }

        const {
            presentedByUserId,
            name,
            link,
            readyForOperation,
            createdAtOverride,
            maturityDegree,
            offeringCategory,
            shortDescription,
            longDescription,
            goalDescription,
            technicalDescription,
            efficiencyDescription,
            processDescription,
            socialRelevanceDescription,
            targetGroupOther,
            hasAcceptedTerms,
            hasAcceptedPrivacyPolicy,
            projectPartnerIds,
            solutionUserIds,
            solutionPresentedByUser,
            state,
            taxonomyNodeIds,
            taxonomyOther,
            publishedBy,
            publishedSource
        } = req.body as any;

        const isUser = user.role === "USER";
        const presenterIdToUse = isUser ? user.id : presentedByUserId;

        // Datum parsen
        let readyDate: Date | null = null;
        if (typeof readyForOperation === "string" && !readyForOperation.startsWith("Invalid Date")) {
            const d = new Date(readyForOperation);
            if (!isNaN(d.getTime())) readyDate = d;
        }

        let createdAtOverrideDate: Date | null = null;
        if (typeof createdAtOverride === "string" && !createdAtOverride.startsWith("Invalid Date")) {
            const d = new Date(createdAtOverride);
            if (!isNaN(d.getTime())) createdAtOverrideDate = d;
        }

        // taxonomyNodeIds normalisieren + deduplizieren
        const flatTaxIds = Array.isArray(taxonomyNodeIds)
            ? taxonomyNodeIds
            : taxonomyNodeIds
                ? [taxonomyNodeIds]
                : [];
        const taxonomyIds = [...new Set(flatTaxIds.filter(Boolean))];
        const taxonomyIdSet = new Set<string>(taxonomyIds);

        // Optional validieren, ob die Nodes existieren
        if (taxonomyIds.length > 0) {
            const existing = await prisma.taxonomyNode.findMany({
                where: { id: { in: taxonomyIds } },
                select: { id: true },
            });
            const existingSet = new Set(existing.map(n => n.id));
            const missing = taxonomyIds.filter(id => !existingSet.has(id));
            if (missing.length) {
                res.status(400).json({
                    error: {
                        code: "INVALID_TAXONOMY_NODES",
                        message: "Einige Taxonomie-IDs existieren nicht.",
                        missing,
                    },
                });
                return;
            }
        }

        await prisma.$transaction(async (tx) => {
            await ensureTaxonomyOtherNodes(tx, taxonomyOther, taxonomyIdSet);
            const taxonomyIdsFinal = [...taxonomyIdSet];

            await tx.digitalSolution.update({
                where: { id },
                data: {
                    name,
                    link,
                    readyForOperation: readyDate ?? undefined,
                    createdAtOverride: parseOrToday(createdAtOverride).toISOString(),
                    maturityDegree: maturityDegree as MaturityDegree,
                    offeringCategory: offeringCategory as OfferingCategory,
                    publishedBy: publishedBy as PublishedByType,
                    publishedSource,
                    shortDescription,
                    longDescription,
                    goalDescription,
                    technicalDescription,
                    solutionPresentedByUser,
                    ...(toSet(projectPartnerIds) ? { projectPartners: toSet(projectPartnerIds)! } : {}),
                    ...(toSet(solutionUserIds)   ? { solutionUsers:   toSet(solutionUserIds)!   } : {}),
                    hasAcceptedTerms: typeof hasAcceptedTerms === "string"
                        ? hasAcceptedTerms === "true"
                        : hasAcceptedTerms,
                    hasAcceptedPrivacyPolicy: typeof hasAcceptedPrivacyPolicy === "string"
                        ? hasAcceptedPrivacyPolicy === "true"
                        : hasAcceptedPrivacyPolicy,

                    // User cannot change the state — leave as stored in DB
                    ...(isUser ? {} : { state: state as DigitalSolutionState }),

                    ...(efficiencyDescription ? { efficiencyDescription } : {}),
                    ...(socialRelevanceDescription ? { socialRelevanceDescription } : {}),
                    ...(processDescription ? { processDescription } : {}),
                    ...(typeof targetGroupOther === "string" && targetGroupOther.trim() ? { targetGroupOther: targetGroupOther.trim() } : {}),

                    // Presenter-Relationen
                    ...(await (async () => {
                        if (presenterIdToUse) {
                            const dbUser = await prisma.user.findUnique({
                                where: { id: presenterIdToUse },
                                select: { organizationId: true },
                            });
                            if (!dbUser) throw new Error("Presenter-User nicht gefunden.");

                            if (dbUser.organizationId) {
                                return {
                                    organization: { connect: { id: dbUser.organizationId } },
                                    user: { disconnect: true },
                                    presentedByUser: { connect: { id: presenterIdToUse } },
                                };
                            }
                            return {
                                user: { connect: { id: presenterIdToUse } },
                                organization: { disconnect: true },
                                presentedByUser: { connect: { id: presenterIdToUse } },
                            };
                        }

                        // If user is USER, they cannot "unlink" the presenter
                        if (isUser) {
                            return {};
                        }

                        // Admin can nullify links
                        return {
                            presentedByUser: { disconnect: true },
                            organization: { disconnect: true },
                            user: { disconnect: true },
                        };
                    })()),
                },
            });

            // Taxonomie löschen + neu setzen
            await tx.digitalSolutionTaxonomy.deleteMany({
                where: { digitalSolutionId: id },
            });

            if (taxonomyIdsFinal.length > 0) {
                await tx.digitalSolutionTaxonomy.createMany({
                    data: taxonomyIdsFinal.map(taxonomyNodeId => ({
                        digitalSolutionId: id,
                        taxonomyNodeId,
                    })),
                    skipDuplicates: true,
                });
            }
        });

        res.json({ id });
    } catch (error) {
        logError("Error updating digital solution:", error);
        next(error);
    }
};

// ---------------------------------------------------------------------
// Other methods (images, delete, active ones, coordinates) — unchanged
// ---------------------------------------------------------------------
// Below I keep your existing code, it does not depend on presentedByUserId.

export const updateDigitalSolutionTitleImage: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params as { id?: string };
        if (!id) {
            res.status(400).json({ error: "digitalSolutionId fehlt." });
            return;
        }
        const digitalSolutionId = id;
        const file = req.file;

        const old = await prisma.image.findMany({
            where: { digitalSolutionId, type: ImageType.TITLE },
        });
        for (const img of old) {
            try {
                fs.unlinkSync(path.join(process.cwd(), "public", img.path.replace(/^\/+/, "")));
            } catch { /* ignore */ }
        }
        if (old.length) {
            await prisma.image.deleteMany({
                where: { digitalSolutionId, type: ImageType.TITLE },
            });
        }

        if (!file) {
            res.status(200).json({ message: "Titelbild entfernt" });
            return;
        }

        const publicDir = path.join(process.cwd(), "public");
        const webPath = "/" + path.relative(publicDir, file.path).split(path.sep).join("/");

        const created = await prisma.image.create({
            data: {
                filename: file.originalname,
                path: webPath,
                mimeType: file.mimetype,
                size: file.size,
                type: ImageType.TITLE,
                digitalSolution: { connect: { id: digitalSolutionId } },
            },
        });

        res.status(200).json(created);
    } catch (error) {
        logError("Fehler beim Aktualisieren des Titelbildes:", error);
        next(error);
    }
};

export const updateDigitalSolutionDetailImages: RequestHandler = async (req, res, next) => {
    try {
        const { id: digitalSolutionId } = req.params as { id?: string };
        if (!digitalSolutionId) { res.status(400).json({ error: "digitalSolutionId fehlt." }); return; }

        const files = (req.files as Express.Multer.File[]) ?? [];

        let keepImageIds: string[] = [];
        const raw = (req.body as any)?.keepImageIds;
        if (Array.isArray(raw)) keepImageIds = raw.map(String);
        else if (typeof raw === "string" && raw.trim()) { try { keepImageIds = JSON.parse(raw); } catch {} }
        const keep = new Set(keepImageIds);

        const existing = await prisma.image.findMany({ where: { digitalSolutionId, type: ImageType.DETAIL } });
        const toDelete = existing.filter(img => !keep.has(img.id));
        if (toDelete.length) {
            await Promise.all(toDelete.map(img => unlinkIfExists(path.join(PUBLIC_DIR, img.path.replace(/^\/+/, "")))));
            await prisma.image.deleteMany({ where: { id: { in: toDelete.map(x => x.id) }, digitalSolutionId, type: ImageType.DETAIL } });
        }

        if (files.length) {
            const targetDir = DS_DIR(digitalSolutionId, "images");
            await ensureDir(targetDir);

            const seenInRequest = new Set<string>();

            await Promise.all(files.map(async (file) => {
                if (!file.path) return;
                const tmpPath = file.path;
                const buf = await readFile(tmpPath);
                const hash = sha256(buf);

                const exists = await prisma.image.findFirst({
                    where: { digitalSolutionId, type: ImageType.DETAIL, contentHash: hash },
                    select: { id: true },
                });
                if (exists) { await unlinkIfExists(tmpPath); return; }

                if (seenInRequest.has(hash)) { await unlinkIfExists(tmpPath); return; }
                seenInRequest.add(hash);

                const ext = path.extname(file.originalname || "").toLowerCase() || ".bin";
                const filename = `${randomUUID()}${ext}`;
                const finalPath = path.join(targetDir, filename);

                await rename(tmpPath, finalPath);

                const webPath = "/" + path.relative(PUBLIC_DIR, finalPath).split(path.sep).join("/");
                await prisma.image.create({
                    data: {
                        filename: file.originalname || filename,
                        path: webPath,
                        mimeType: file.mimetype,
                        size: file.size,
                        type: ImageType.DETAIL,
                        digitalSolution: { connect: { id: digitalSolutionId } },
                    },
                });
            }));
        }

        const images = await prisma.image.findMany({
            where: { digitalSolutionId, type: ImageType.DETAIL },
            orderBy: { uploadedAt: "asc" },
        });
        res.status(200).json({ images });
    } catch (e) { next(e); }
};

export const deleteDigitalSolution: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {id} = req.params as { id?: string };

    if (!id) {
        res.status(400).json({error: "digitalSolutionId fehlt."});
        return;
    }

    try {
        const existing = await prisma.digitalSolution.findUnique({
            where: {id: id},
            select: {id: true},
        });
        if (!existing) {
            res.status(404).json({error: "DigitalSolution nicht gefunden."});
            return;
        }

        const uploadDir = path.join(
            process.cwd(),
            "public",
            "uploads",
            "digitalSolutions",
            id
        );
        if (fs.existsSync(uploadDir)) {
            try {
                fs.rmSync(uploadDir, {recursive: true, force: true});
            } catch (err) {
                logger.warn(
                    `Ordner ${uploadDir} konnte nicht gelöscht werden:`,
                    err
                );
            }
        }

        await prisma.image.deleteMany({
            where: {id},
        });

        await prisma.digitalSolution.delete({
            where: {id: id},
        });

        res.status(200).json({
            success: true,
            message: `DigitalSolution ${id} erfolgreich gelöscht.`
        });
    } catch (error) {
        logError(
            `Fehler beim Löschen der DigitalSolution ${id}:`,
            error
        );
        next(error);
    }
};

export const getActiveDigitalSolutionsWithTitleImage = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Math.max(
      parseInt(String(req.query.page ?? "1"), 10) || 1,
      1
    );
    const pageSize = Math.min(
      Math.max(parseInt(String(req.query.pageSize ?? "12"), 10) || 12, 1),
      50
    );
    const skip = (page - 1) * pageSize;

    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo   = req.query.dateTo   as string | undefined;

    const q = (req.query.q as string | undefined)?.trim() || "";
    const taxonomyNodeId = req.query.taxonomyNodeId as string | undefined;
    const taxonomyPath   = req.query.taxonomyPath   as string | undefined;
    const sortParam =
      (req.query.sort as "newest" | "oldest" | "az" | "za") || "newest";

    const organizationId = req.query.organizationId as string | undefined;

    const where: Prisma.DigitalSolutionWhereInput = {
      state: "ACTIVATED",

      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo   ? { lte: new Date(dateTo) }   : {}),
            },
          }
        : {}),

      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { shortDescription: { contains: q } },
              { longDescription: { contains: q } },
              { goalDescription: { contains: q } },
              { technicalDescription: { contains: q } },
              { efficiencyDescription: { contains: q } },
              { processDescription: { contains: q } },
              { socialRelevanceDescription: { contains: q } },
              { organization: { is: { name: { contains: q } } } },
            ],
          }
        : {}),

      ...(taxonomyPath
        ? {
            taxonomyNodes: {
              some: {
                taxonomyNode: {
                  is: {
                    path: { startsWith: taxonomyPath },
                  },
                },
              },
            },
          }
        : taxonomyNodeId
        ? {
            taxonomyNodes: {
              some: { taxonomyNodeId },
            },
          }
        : {}),

      ...(organizationId
        ? {
            organizationId,
          }
        : {}),
    };

    const orderBy: Prisma.DigitalSolutionOrderByWithRelationInput =
      sortParam === "oldest"
        ? { createdAt: "asc" }
        : sortParam === "az"
        ? { name: "asc" }
        : sortParam === "za"
        ? { name: "desc" }
        : { createdAt: "desc" };

    const [total, solutions] = await Promise.all([
      prisma.digitalSolution.count({ where }),
      prisma.digitalSolution.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          images: {
            where: { type: "TITLE" },
            take: 1,
            select: {
              id: true,
              filename: true,
              path: true,
              mimeType: true,
              type: true,
            },
          },
          taxonomyNodes: {
            select: {
              taxonomyNode: {
                select: {
                  id: true,
                  nameDe: true,
                  color: true,
                  parent: {
                    select: { id: true, nameDe: true, color: true },
                  },
                },
              },
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              email: true,
              website: true,
            },
          },
          presentedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const enriched = await Promise.all(
      solutions.map(async (s) => {
        const image = s.images[0];
        if (!image) return { ...s, titleImage: null };

        const imagePath = path.join(process.cwd(), "public", image.path);
        if (!fs.existsSync(imagePath)) {
          return { ...s, titleImage: null };
        }

        const buf = fs.readFileSync(imagePath);
        const dataUri = `data:${image.mimeType};base64,${buf.toString(
          "base64"
        )}`;

        return { ...s, titleImage: { ...image, dataUri } };
      })
    );

    res.json({ items: enriched, total, page, pageSize });
    } catch (err) {
        logError("Fehler beim Laden der DigitalSolutions:", err);
    res.status(500).json({ error: "Serverfehler." });
  }
};

// ---------------------------------------------------------------------
// UPLOAD IMAGES WITH ROLLBACK ON ERROR
// ---------------------------------------------------------------------

export const uploadDigitalSolutionTitleImage: RequestHandler = async (
    req: MulterErrorRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const {id} = req.params as { id?: string };
        const file = req.file;

        if (!id) {
            res.status(400).json({error: "digitalSolutionId fehlt."});
            return;
        }

        if (req.multerError) {
            await prisma.digitalSolution.delete({where: {id}}).catch(() => {});
            await cleanupUploadFolder(id);
            res
                .status(400)
                .json({error: `Upload fehlgeschlagen: ${req.multerError.message}`, rollback: true});
            return;
        }

        if (!file) {
            res.status(400).json({error: "Kein Titelbild hochgeladen."});
            return;
        }

        const folder = path.join(
            process.cwd(),
            "public",
            "uploads",
            "digitalSolutions",
            id,
            "images"
        );

        await mkdir(folder, {recursive: true});

        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${randomUUID()}${ext}`;
        const absolutePath = path.join(folder, filename);

        try {
            await writeFile(absolutePath, file.buffer!);

            const publicDir = path.join(process.cwd(), "public");
            const webPath =
                "/" + path.relative(publicDir, absolutePath).split(path.sep).join("/");

            const image = await prisma.image.create({
                data: {
                    filename: file.originalname,
                    path: webPath,
                    mimeType: file.mimetype,
                    size: file.size,
                    type: ImageType.TITLE,
                    digitalSolution: {connect: {id}},
                },
            });

            res.status(201).json(image);
            return;
        } catch (err) {
            await prisma.digitalSolution.delete({where: {id}}).catch(() => {});
            await cleanupUploadFolder(id);
            res
                .status(500)
                .json({error: "Upload fehlgeschlagen, Rollback durchgeführt."});
            return;
        }
    } catch (error) {
        logError("Error uploading title image:", error);
        next(error);
    }
};

export const uploadDigitalSolutionDetailImages: RequestHandler = async (
    req: MulterErrorRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const {id} = req.params as { id?: string };
        const files = req.files as Express.Multer.File[] | undefined;

        if (!id) {
            res.status(400).json({error: "digitalSolutionId fehlt."});
            return;
        }

        if (req.multerError) {
            await prisma.digitalSolution.delete({where: {id}}).catch(() => {});
            await cleanupUploadFolder(id);
            res
                .status(400)
                .json({error: `Upload fehlgeschlagen: ${req.multerError.message}`, rollback: true});
            return;
        }

        if (!files || files.length === 0) {
            res.status(400).json({error: "Keine Detailbilder hochgeladen."});
            return;
        }

        const folder = path.join(
            process.cwd(),
            "public",
            "uploads",
            "digitalSolutions",
            id,
            "images"
        );

        await mkdir(folder, {recursive: true});

        const savedPaths: string[] = [];

        try {
            for (const file of files) {
                const ext = path.extname(file.originalname).toLowerCase();
                const name = `${randomUUID()}${ext}`;
                const absolutePath = path.join(folder, name);
                await writeFile(absolutePath, file.buffer!);
                savedPaths.push(absolutePath);
            }

            const publicDir = path.join(process.cwd(), "public");
            const created = await Promise.all(
                savedPaths.map((absPath, idx) => {
                    const webPath =
                        "/" +
                        path
                            .relative(publicDir, absPath)
                            .split(path.sep)
                            .join("/");
                    const file = files[idx];

                    return prisma.image.create({
                        data: {
                            filename: file.originalname,
                            path: webPath,
                            mimeType: file.mimetype,
                            size: file.size,
                            type: ImageType.DETAIL,
                            digitalSolution: {connect: {id}},
                        },
                    });
                })
            );

            res.status(201).json(created);
            return;
        } catch (err) {
            await prisma.digitalSolution
                .delete({where: {id}})
                .catch(() => {});
            await cleanupUploadFolder(id);
            res
                .status(500)
                .json({error: "Upload fehlgeschlagen, Rollback durchgeführt."});
            return;
        }
    } catch (error) {
        logError("Error uploading detail images:", error);
        next(error);
    }
};


export const getDigitalSolutionById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const {id} = req.params as { id?: string };
    if (!id) {
        res.status(400).json({error: "digitalSolutionId ist erforderlich."});
        return;
    }

    try {
        const ds = await prisma.digitalSolution.findUnique({
            where: {id: id},
            include: {
                taxonomyNodes: {
                    select: { taxonomyNodeId: true },
                },
                presentedByUser: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        salutationType: true,
                        title: true,
                        phonenumber: true,
                        role: true,
                        accountState: true,
                        emailVerifiedAt: true,
                        hasAcceptedTerms: true,
                        hasAcceptedPrivacyPolicy: true,
                        organization: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                street: true,
                                zip: true,
                                city: true,
                                region: true,
                                country: true,
                                organizationType: true,
                                website: true,
                                lat: true,
                                lon: true,
                                logoBase64: true,
                                logoMimeType: true,
                                logoFilename: true,
                            }
                        }
                    }
                },
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        id: true,
                        organization: {select: {id: true}},
                    },
                },
                projectPartners: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        street: true,
                        zip: true,
                        city: true,
                        country: true,
                        region: true,
                        organizationType: true,
                        website: true,
                        lat: true,
                        lon: true,
                        logoBase64: true,
                        logoMimeType: true,
                        logoFilename: true,
                    },
                },
                solutionUsers: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        street: true,
                        zip: true,
                        city: true,
                        country: true,
                        region: true,
                        organizationType: true,
                        website: true,
                        lat: true,
                        lon: true,
                        logoBase64: true,
                        logoMimeType: true,
                        logoFilename: true,
                    },
                },
                images: {
                    select: {
                        id: true,
                        filename: true,
                        path: true,
                        mimeType: true,
                        size: true,
                        type: true,
                        uploadedAt: true,
                    },
                },
                organization: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        street: true,
                        zip: true,
                        city: true,
                        country: true,
                        region: true,
                        organizationType: true,
                        website: true,
                        lat: true,
                        lon: true,
                        logoBase64: true,
                        logoMimeType: true,
                        logoFilename: true,
                    }
                }
            },
        });

        if (!ds) {
            res.status(404).json({error: "Digitale Lösung nicht gefunden."});
            return;
        }
        res.status(200).json(ds);
    } catch (error) {
        logError(
            `Fehler beim Abrufen der digitalen Lösung ${id}:`,
            error
        );
        res.status(500).json({error: "Serverfehler beim Abruf der digitalen Lösung."});
    }
};

export const getDigitalSolutions = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const state = req.query.state as DigitalSolutionState | undefined;
        const currentUser = (req as any).user as { id: string; role: string } | undefined;

        const where: Prisma.DigitalSolutionWhereInput = {
            ...(state ? { state } : {}),
            ...(currentUser?.role === "USER"
                ? { presentedByUserId: currentUser.id }
                : {}),
        };

        const list = await prisma.digitalSolution.findMany({
            where,
            include: {
                user: {
                    include: {organization: true},
                },
                presentedByUser: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phonenumber: true,
                    },
                },
                organization: {
                    select: {
                        name: true,
                        email: true,
                        website: true,
                    },
                },
            },
            orderBy: {createdAt: "desc"},
        });

        res.status(200).json(list);
    } catch (error) {
        logError("Fehler beim Abrufen aller digitalen Lösungen:", error);
        res.status(500).json({error: "Fehler beim Laden der digitalen Lösungen"});
    }
};

export const getTitleImageByDigitalSolution = async (
    req: Request,
    res: Response
) => {
    const {digitalSolutionId} = req.query as { digitalSolutionId?: string };
    if (!digitalSolutionId) {
        res.status(400).json({error: "digitalSolutionId ist erforderlich."});
        return;
    }

    try {
        const image = await prisma.image.findFirst({
            where: {digitalSolutionId, type: ImageType.TITLE},
        });
        if (!image) {
            res.status(404).json({error: "Bild nicht gefunden."});
            return;
        }

        const p = path.join(process.cwd(), "public", image.path);
        if (!fs.existsSync(p)) {
            res.status(404).json({error: "Datei nicht vorhanden."});
            return;
        }

        const buf = fs.readFileSync(p);
        const dataUri = `data:${image.mimeType};base64,${buf.toString("base64")}`;
        res.json({...image, dataUri});
    } catch (err) {
        logError("Fehler beim Laden des Bildes:", err);
        res.status(500).json({error: "Serverfehler beim Bildabruf."});
    }
};

export const getMyDigitalSolutions: RequestHandler = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      res.status(401).json({ error: "Nicht authentifiziert" });
      return;
    }

    const state = req.query.state as DigitalSolutionState | undefined;

    const where: Prisma.DigitalSolutionWhereInput = {
      presentedByUserId: user.id,
      ...(state ? { state } : {}),
    };

    const list = await prisma.digitalSolution.findMany({
      where,
      include: {
        user: {
          include: { organization: true },
        },
        presentedByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phonenumber: true,
          },
        },
        organization: {
          select: {
            name: true,
            email: true,
            website: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(list);
    } catch (error) {
        logError("Fehler beim Abrufen meiner digitalen Lösungen:", error);
    res
      .status(500)
      .json({ error: "Fehler beim Laden der digitalen Lösungen des Users." });
  }
};

export const getDetailImagesByDigitalSolution = async (req: Request, res: Response): Promise<void> => {
    const {digitalSolutionId} = req.query as { digitalSolutionId?: string };
    if (!digitalSolutionId) {
        res.status(400).json({error: "digitalSolutionId ist erforderlich."});
        return;
    }

    try {
        const images = await prisma.image.findMany({
            where: {
                digitalSolutionId,
                type: "DETAIL",
            },
        });

        const mapped = images.map(img => {
            const imagePath = path.join(process.cwd(), "public", img.path);
            if (!fs.existsSync(imagePath)) {
                return null;
            }

            const buffer = fs.readFileSync(imagePath);
            const base64 = buffer.toString("base64");
            const dataUri = `data:${img.mimeType};base64,${base64}`;

            return {
                id: img.id,
                digitalSolutionId: img.digitalSolutionId,
                filename: img.filename ?? "",
                path: img.path ?? null,
                mimeType: img.mimeType ?? "",
                size: img.size ?? 0,
                uploadedAt: img.uploadedAt ? img.uploadedAt.toISOString() : null,
                type: img.type,
                solutionId: img.digitalSolutionId,
                dataUri,
            } as DigitalSolutionImageDto;
        });

        const result: DigitalSolutionImageDto[] = (mapped as Array<DigitalSolutionImageDto | null>).filter(
            (dto): dto is DigitalSolutionImageDto => dto !== null
        );

        res.json(result);
    } catch (err) {
        logError("Fehler beim Laden der Detailbilder:", err);
        res.status(500).json({error: "Serverfehler beim Detailbilder-Abruf."});
    }
};

export const getActiveDigitalSolutions = async (req: Request, res: Response) => {
    try {
        const solutions = await prisma.digitalSolution.findMany({
            where: {
                state: 'ACTIVATED',
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        website: true,
                    }
                },
                presentedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                images: {
                    select: {
                        id: true,
                        filename: true,
                        path: true,
                        type: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json(solutions);
    } catch (error) {
        logError("Fehler beim Laden aktiver Lösungen mit Organisation:", error);
        res.status(500).json({ error: "Fehler beim Abrufen der digitalen Lösungen" });
    }
};

export const getAllCoordinates = async (req: Request, res: Response) => {
    try {
        const includeTaxonomyPath =
            typeof req.query.includeTaxonomyPath === "string" && req.query.includeTaxonomyPath.trim().length > 0
                ? req.query.includeTaxonomyPath.trim()
                : undefined;
        const excludeTaxonomyPath =
            typeof req.query.excludeTaxonomyPath === "string" && req.query.excludeTaxonomyPath.trim().length > 0
                ? req.query.excludeTaxonomyPath.trim()
                : undefined;

        const where: Prisma.DigitalSolutionWhereInput = {
            state: "ACTIVATED",
            ...(includeTaxonomyPath
                ? {
                    taxonomyNodes: {
                        some: {
                            taxonomyNode: {
                                is: {
                                    path: { startsWith: includeTaxonomyPath },
                                },
                            },
                        },
                    },
                }
                : {}),
            ...(excludeTaxonomyPath
                ? {
                    NOT: {
                        taxonomyNodes: {
                            some: {
                                taxonomyNode: {
                                    is: {
                                        path: { startsWith: excludeTaxonomyPath },
                                    },
                                },
                            },
                        },
                    },
                }
                : {}),
        };

        const solutions = await prisma.digitalSolution.findMany({
            where,
            select: {
                id: true,
                name: true,
                link: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                        zip: true,
                        city: true,
                        website: true,
                        lat: true,
                        lon: true,
                    },
                },
                presentedByUser: {
                    select: {
                        organization: {
                            select: {
                                id: true,
                                name: true,
                                zip: true,
                                city: true,
                                website: true,
                                lat: true,
                                lon: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(200).json(solutions);
    } catch (error) {
        logError("Fehler beim Laden aller Koordinaten:", error);
        res.status(500).json({ error: "Fehler beim Abrufen aller Koordinaten" });
    }
};
