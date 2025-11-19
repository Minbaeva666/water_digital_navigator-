import {prisma} from "../prisma/prisma";

export type IncomingNode = {
    id: string;
    nameDe: string;
    isFav: boolean;
    parentId: string | null;
    color?: string | null;
    maxSelectableNodes?: number | null;
    minSelectableNodes?: number | null;
    sort?: number;
    depth?: number;
    _isNew?: boolean;
    _isUpdated?: boolean;
    _isDeleted?: boolean;
    children?: IncomingNode[];
};

export type ParentCtx = { id: string; path: string; depth: number; type: string; color: string | null };

export const isTemp = (id?: string) => !id || id.startsWith("temp_");

export const mkSlug = (s: string) => slugify(s);


export const slugify = (input: string) =>
    input
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "") // diakritische Zeichen weg
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

export function flattenWithParentCtx(
    tree: IncomingNode[],
    parentCtx: { type: string; color: string | null } | null
): Array<{
    id?: string;
    nameDe: string;
    slug: string;
    type: string;                 // top-level: aus eigenem Namen, sonst: vom Parent
    color: string | null;         // top-level: eigene color, sonst: vom Parent
    isTopLevel: boolean;
}> {
    const out: Array<{
        id?: string;
        nameDe: string;
        slug: string;
        type: string;
        color: string | null;
        isTopLevel: boolean;
    }> = [];

    const walk = (nodes: IncomingNode[], ctx: { type: string; color: string | null } | null) => {
        for (const n of nodes) {
            const isTop = ctx === null;
            const nodeType = isTop ? mkSlug(n.nameDe) : (ctx!.type);
            const nodeColor = isTop ? (n.color ?? null) : (ctx!.color);
            const entry = {
                id: n.id,
                nameDe: n.nameDe,
                slug: mkSlug(n.nameDe),
                type: nodeType,
                color: nodeColor,
                isTopLevel: isTop,
            };
            out.push(entry);
            walk(n.children ?? [], { type: nodeType, color: nodeColor });
        }
    };
    walk(tree, parentCtx);
    return out;
}

export async function preflightRejectDuplicateNames(
    tx: typeof prisma,
    flat: ReturnType<typeof flattenWithParentCtx>
) {
    // 1) Payload-interne Duplicates
    const bySlug = new Map<string, { ids: (string|undefined)[], names: string[] }>();
    for (const n of flat) {
        const key = n.slug;
        const entry = bySlug.get(key) ?? { ids: [], names: [] };
        entry.ids.push(n.id);
        entry.names.push(n.nameDe);
        bySlug.set(key, entry);
    }
    const payloadDupes = [...bySlug.entries()].filter(([, v]) => v.ids.filter(Boolean).length !== 1 || v.ids.length > 1)
        .filter(([_, v]) => new Set(v.names.map(mkSlug)).size < v.names.length); // wirklich gleiche Slugs

    if (payloadDupes.length > 0) {
        const conflicts = payloadDupes.map(([slug, v]) => ({ slug, ids: v.ids }));
        const error = {
            code: "NAME_TAKEN",
            message: "Fehler beim Speichern. Kriterium mit dem Name existiert bereits.",
            conflicts,
            scope: "payload",
        };
        const err = new Error(error.message) as any;
        err.status = 409;
        err.payload = error;
        throw err;
    }

    // 2) Gegen die DB prüfen (alle Slugs, die im Request vorkommen)
    const slugs = [...new Set(flat.map(n => n.slug))];

    if (slugs.length) {
        const existing = await tx.taxonomyNode.findMany({
            where: { slug: { in: slugs } },
            select: { id: true, slug: true, nameDe: true },
        });

        // eigene IDs herausfiltern (Edit-Fall)
        const selfIds = new Set(flat.map(n => n.id).filter(Boolean) as string[]);
        const dbConflicts = existing.filter(e => !selfIds.has(e.id));

        if (dbConflicts.length > 0) {
            const conflicts = dbConflicts.map(e => ({ slug: e.slug, existingId: e.id, existingName: e.nameDe }));
            const error = {
                code: "NAME_TAKEN",
                message: "Name ist bereits vergeben (global, in der Datenbank).",
                conflicts,
                scope: "database",
            };
            const err = new Error(error.message) as any;
            err.status = 409;
            err.payload = error;
            throw err;
        }
    }
}