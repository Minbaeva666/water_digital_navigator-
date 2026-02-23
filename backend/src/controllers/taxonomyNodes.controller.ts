import {Request, Response} from "express";
import {prisma} from "../prisma/prisma";
import logger from "../config/loggerConfig";
import {
    flattenWithParentCtx,
    IncomingNode,
    isTemp,
    mkSlug,
    preflightRejectDuplicateNames,
} from "../types/taxonomyNodes.types";

export const getTaxonomyNodes = async (req: Request, res: Response) => {
    try {
        const nodes = await prisma.taxonomyNode.findMany({
            orderBy: [{ sort: "asc" }, { nameDe: "asc" }],
        });

        // Map für schnellen Zugriff
        const nodeMap: Record<string, any> = {};
        const roots: any[] = [];

        // Erst Map füllen
        nodes.forEach(n => {
            nodeMap[n.id] = { ...n, children: [] };
        });

        // Hierarchie aufbauen
        nodes.forEach(n => {
            if (n.parentId && nodeMap[n.parentId]) {
                nodeMap[n.parentId].children.push(nodeMap[n.id]);
            } else {
                roots.push(nodeMap[n.id]);
            }
        });

        res.json(roots);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: "Fehler beim Laden der TaxonomyNodes" });
    }
};

export const updateTaxonomyNodes = async (req: Request, res: Response) => {
    const tree = req.body as IncomingNode[];
    if (!Array.isArray(tree)) {
        res.status(400).json({ error: { code: "BAD_PAYLOAD", message: "Payload muss ein Array von Nodes sein." } });
        return;
    }

    // ---- Preflight: globaler Name/Slug-Check (ohne DB-Schreibungen)
    const flat = flattenWithParentCtx(tree, null);

    try {
        // in einer eigenständigen (kurzen) DB-Session prüfen, ob es DB-Kollisionen gibt
        await preflightRejectDuplicateNames(prisma, flat);
    } catch (e: any) {
        const status = e.status ?? 400;
        res.status(status).json({ error: e.payload ?? { code: "VALIDATION_ERROR", message: e.message } });
        return
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // existierende IDs holen (für Delete)
            const existing = await tx.taxonomyNode.findMany({ select: { id: true, depth: true } });
            const existingIds = new Set(existing.map(n => n.id));
            const seenIds = new Set<string>();

            type ParentCtx = { id: string; path: string; depth: number; type: string; color: string | null };

            const process = async (nodes: IncomingNode[], parent: ParentCtx | null) => {
                for (let i = 0; i < nodes.length; i++) {
                    const n = nodes[i];
                    const nodeType = parent ? parent.type : mkSlug(n.nameDe);     // type aus Parent, Top-Level aus eigenem Namen
                    const colorCtx = parent ? parent.color : (n.color ?? null);   // color erben
                    const slug = mkSlug(n.nameDe);
                    const path = parent
                        ? `${parent.path}/${slug}`
                        : `/${nodeType}`;
                    const depth = parent ? parent.depth + 1 : 0;


                    let saved;
                    if (isTemp(n.id)) {
                        saved = await tx.taxonomyNode.create({
                            data: {
                                nameDe: n.nameDe,
                                type: nodeType,
                                isFav: n.isFav,
                                slug,
                                path,
                                depth,
                                sort: i,
                                parentId: parent?.id ?? null,
                                color: colorCtx,
                                maxSelectableNodes: n.maxSelectableNodes ?? null,
                                minSelectableNodes: n.minSelectableNodes ?? null,
                            },
                        });
                    } else {
                        saved = await tx.taxonomyNode.upsert({
                            where: { id: n.id! },
                            update: {
                                nameDe: n.nameDe,
                                type: nodeType,
                                isFav: n.isFav,
                                slug,
                                path,
                                depth,
                                sort: i,
                                parentId: parent?.id ?? null,
                                color: colorCtx,
                                maxSelectableNodes: n.maxSelectableNodes ?? null,
                                minSelectableNodes: n.minSelectableNodes ?? null,
                            },
                            create: {
                                nameDe: n.nameDe,
                                type: nodeType,
                                isFav: n.isFav,
                                slug,
                                path,
                                depth,
                                sort: i,
                                parentId: parent?.id ?? null,
                                color: colorCtx,
                                maxSelectableNodes: n.maxSelectableNodes ?? null,
                                minSelectableNodes: n.minSelectableNodes ?? null,
                            },
                        });
                    }

                    seenIds.add(saved.id);
                    await process(n.children ?? [], { id: saved.id, path, depth, type: nodeType, color: colorCtx });
                }
            };

            await process(tree, null);

            // Deletes (global, bottom-up)
            const idsToDelete = [...existingIds].filter((id) => !seenIds.has(id));
            if (idsToDelete.length) {
                const toDel = await tx.taxonomyNode.findMany({
                    where: { id: { in: idsToDelete } },
                    select: { id: true, depth: true, nameDe: true },
                });
                toDel.sort((a, b) => b.depth - a.depth);

                // Strict guard: forbid delete when taxonomy nodes are used in any digital atlas
                const usage = await tx.digitalSolutionTaxonomy.groupBy({
                    by: ["taxonomyNodeId"],
                    where: { taxonomyNodeId: { in: idsToDelete } },
                    _count: { _all: true },
                });

                if (usage.length > 0) {
                    const usageMap = new Map(usage.map((row) => [row.taxonomyNodeId, row._count._all]));
                    const blocked = toDel
                        .filter((node) => usageMap.has(node.id))
                        .map((node) => `${node.nameDe} (${usageMap.get(node.id)} Atlas-Zuordnung(en))`)
                        .join(", ");

                    throw new Error(
                        `TAXONOMY_NODE_IN_USE: Löschen nicht möglich. Folgende Kategorien werden in Atlassen verwendet: ${blocked}`
                    );
                }
                
                // All nodes passed reference check - safe to delete
                for (const { id } of toDel) {
                    await tx.taxonomyNode.delete({ where: { id } });
                }
            }

            // Baum zurückgeben
            const nodes = await tx.taxonomyNode.findMany({
                orderBy: [{ sort: "asc" }, { nameDe: "asc" }],
            });
            const byId: Record<string, any> = {};
            const roots: any[] = [];
            nodes.forEach((n) => (byId[n.id] = { ...n, children: [] }));
            nodes.forEach((n) => {
                if (n.parentId && byId[n.parentId]) byId[n.parentId].children.push(byId[n.id]);
                else roots.push(byId[n.id]);
            });
            return roots;
        });

        res.json(result);
    } catch (err: any) {
        // Check for taxonomy node in-use error
        if (err?.message?.includes("TAXONOMY_NODE_IN_USE")) {
            const message = err.message.replace("TAXONOMY_NODE_IN_USE: ", "");
            res.status(409).json({
                error: {
                    code: "TAXONOMY_NODE_IN_USE",
                    message: "Löschen nicht möglich, dieser Knoten ist bereits in Gebrauch.",
                    details: message,
                },
            });
            return;
        }

        // Prisma-Fehler hübsch mappen
        if (err?.code === "P2002") {
            // Unique-Constraint verletzt (z. B. path oder slug)
            const target = Array.isArray(err.meta?.target) ? err.meta.target.join(",") : String(err.meta?.target ?? "");
            res.status(409).json({
                error: {
                    code: "NAME_TAKEN",
                    message: "Name ist bereits vergeben (Unique-Constraint).",
                    target, // z. B. "TaxonomyNode_slug_key" oder "[path]"
                },
            });
            return
        }
        logger.error("Fehler beim Speichern des Taxonomie-Baums:", err);
        res.status(500).json({ error: { code: "SERVER_ERROR", message: "Serverfehler beim Speichern des Taxonomie-Baums" } });
        return
    }
};

export const getTaxonomyNodeStructure = async (req: Request, res: Response) => {
    try {
        const nodes = await prisma.taxonomyNode.findMany({
            orderBy: [{ sort: "asc" }, { nameDe: "asc" }],
            select: {
                id: true,
                nameDe: true,
                nameEn: true,
                slug: true,
                path: true,
                depth: true,
                color: true,
                type: true,
                isFav: true,
                parentId: true,
            },
        });

        // ----- Flat-Index vorbereiten -----
        const byId: Record<string, any> = {};
        nodes.forEach(n => (byId[n.id] = { ...n, children: [] }));

        // Root-Cache zur Memoization
        const rootCache = new Map<string, string>();
        const ancestorsCache = new Map<string, string[]>();

        const computeRootId = (id: string): string => {
            if (rootCache.has(id)) return rootCache.get(id)!;
            let cur = byId[id];
            const seen = new Set<string>();
            while (cur?.parentId && !seen.has(cur.id)) {
                seen.add(cur.id);
                cur = byId[cur.parentId];
            }
            const rootId = cur?.id ?? id;
            rootCache.set(id, rootId);
            return rootId;
        };

        const computeAncestors = (id: string): string[] => {
            if (ancestorsCache.has(id)) return ancestorsCache.get(id)!;
            const arr: string[] = [];
            let cur = byId[id];
            const seen = new Set<string>();
            while (cur?.parentId && !seen.has(cur.id)) {
                seen.add(cur.id);
                arr.unshift(cur.parentId); // von oben nach unten
                cur = byId[cur.parentId];
            }
            ancestorsCache.set(id, arr);
            return arr;
        };

        // Flat-Index mit rootId/ancestors anreichern
        const index: Record<string, any> = {};
        nodes.forEach(n => {
            index[n.id] = {
                ...n,
                rootId: computeRootId(n.id),
                ancestors: computeAncestors(n.id), // [rootId, ..., parentId]
            };
        });

        // ----- Baum (roots + children) aufbauen -----
        const roots: any[] = [];
        nodes.forEach(n => {
            if (n.parentId && byId[n.parentId]) {
                byId[n.parentId].children.push(byId[n.id]);
            } else {
                roots.push(byId[n.id]);
            }
        });

        res.json({ tree: roots, index });
    } catch (e) {
        logger.error(e);
        res.status(500).json({ error: "Fehler beim Laden der Taxonomy-Struktur" });
    }
};