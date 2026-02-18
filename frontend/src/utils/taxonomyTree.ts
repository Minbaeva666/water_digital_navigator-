// Holt alle Keys eines Knotens inkl. Kinder
import {LocalTaxonomyNode, UiTreeNode} from "../types/UiTreeNode.ts";
import {TaxonomyNodeDto} from "../types/dtos/TaxonomyNodeDto.ts";

export const getAllKeys = (node: any): string[] => {
    let keys: string[] = [node.key as string];
    if (node.children && node.children.length) {
        for (const child of node.children) {
            keys = keys.concat(getAllKeys(child));
        }
    }
    return keys;
};

export const collectKeysDeep = (node: UiTreeNode): string[] => {
    let keys = [String(node.key)];
    if (node.children) for (const c of node.children) keys = keys.concat(collectKeysDeep(c));
    return keys;
};

export const updateNodeRecursive = (
    nodes: LocalTaxonomyNode[],
    nodeId: string,
    values: Partial<TaxonomyNodeDto>
): LocalTaxonomyNode[] => {
    return nodes.map((node) => {
        if (node.id === nodeId) {
            return {
                ...node,
                ...values,
                _isUpdated: !node._isNew,
            };
        }
        if (node.children && node.children.length > 0) {
            return {
                ...node,
                children: updateNodeRecursive(node.children, nodeId, values),
            };
        }
        return node;
    });
};


export const sortByName = <T extends { nameDe: string }>(nodes: T[]) =>
    [...nodes].sort((a, b) => a.nameDe.localeCompare(b.nameDe, "de", { sensitivity: "base" }));


export const deleteLocalNodeRecursive = (nodes: LocalTaxonomyNode[], nodeId: string): LocalTaxonomyNode[] => {
    return nodes
        .filter(n => n.id !== nodeId) // aktuellen Node rausfiltern
        .map(n => ({
            ...n,
            children: n.children ? deleteLocalNodeRecursive(n.children, nodeId) : []
        }));
};

export const slugify = (input: string) =>
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


export type TaxonomySelectionsMap = Record<string, string[]>;

export const buildGroupedSelections = (
    selectedIds: readonly string[],
    allNodes: readonly TaxonomyNodeDto[],
): TaxonomySelectionsMap => {
    const grouped: TaxonomySelectionsMap = {};
    if (!selectedIds?.length || !allNodes?.length) return grouped;

    // Type Guard für optionale children
    const hasChildren = (n: TaxonomyNodeDto): n is TaxonomyNodeDto & { children: TaxonomyNodeDto[] } =>
        Array.isArray((n as any).children) && (n as any).children.length > 0;

    // Baum (oder flache Liste) flatten – iterativ
    const flat: TaxonomyNodeDto[] = [];
    const stack: TaxonomyNodeDto[] = [...allNodes];
    while (stack.length) {
        const n = stack.pop()!;
        flat.push(n);
        if (hasChildren(n)) stack.push(...n.children);
    }

    const byId = new Map(flat.map(n => [n.id, n] as const));

    // Auswahlreihenfolge merken, Duplikate vermeiden
    const order = new Map<string, number>();
    selectedIds.forEach((id, i) => { if (!order.has(id)) order.set(id, i); });

    // Zum obersten bekannten Vorfahren hochlaufen (typisch depth 0)
    const topAncestor = (id: string): string | null => {
        let cur = byId.get(id);
        if (!cur) return null;
        while (cur.parentId && byId.has(cur.parentId)) {
            cur = byId.get(cur.parentId)!;
        }
        return cur.id;
    };

    // Gruppieren
    for (const id of new Set(selectedIds)) {
        const rootId = topAncestor(id);
        if (!rootId) continue;
        (grouped[rootId] ??= []).push(id);
    }

    // Reihenfolge innerhalb der Gruppen gemäß ursprünglicher Auswahl
    for (const key of Object.keys(grouped)) {
        grouped[key].sort((a, b) => (order.get(a)! - order.get(b)!));
    }

    return grouped;
};


export const flattenNodesForSearch = (nodes: TaxonomyNodeDto[]) => {
    const list: { key: string; title: string }[] = [];
    const walk = (arr: TaxonomyNodeDto[]) => {
        for (const n of arr) {
            list.push({ key: n.id, title: n.nameDe });
            if (n.children?.length) walk(n.children);
        }
    };
    walk(nodes);
    return list;
};

export const getParentKeyFromTree = (key: string, tree: TaxonomyNodeDto[]): string | null => {
    for (const node of tree) {
        if (node.children?.some((child) => child.id === key)) {
            return node.id;
        }
        const parentKey = getParentKeyFromTree(key, node.children || []);
        if (parentKey) return parentKey;
    }
    return null;
};

const TARGET_GROUP_PARENT_LABEL = "Zielgruppe / Nutzerkreis";
const OTHER_TARGET_GROUP_LABEL = "Andere Zielgruppe";

const normalizeLabel = (value: string) => value.trim().toLowerCase();

const flattenTaxonomyNodes = (nodes: TaxonomyNodeDto[]): TaxonomyNodeDto[] => {
    const flat: TaxonomyNodeDto[] = [];
    const stack = [...nodes];
    while (stack.length) {
        const node = stack.pop()!;
        flat.push(node);
        if (node.children?.length) {
            stack.push(...node.children);
        }
    }
    return flat;
};

export const findOtherTargetGroupNodeId = (nodes: TaxonomyNodeDto[]): string | null => {
    if (!nodes.length) return null;

    const flat = flattenTaxonomyNodes(nodes);
    const byId = new Map(flat.map((n) => [n.id, n] as const));

    const candidates = flat.filter(
        (n) => normalizeLabel(n.nameDe) === normalizeLabel(OTHER_TARGET_GROUP_LABEL)
    );
    if (!candidates.length) return null;

    const topAncestor = (id: string): TaxonomyNodeDto | null => {
        let cur = byId.get(id);
        if (!cur) return null;
        while (cur.parentId && byId.has(cur.parentId)) {
            cur = byId.get(cur.parentId)!;
        }
        return cur;
    };

    for (const candidate of candidates) {
        const root = topAncestor(candidate.id);
        if (root && normalizeLabel(root.nameDe) === normalizeLabel(TARGET_GROUP_PARENT_LABEL)) {
            return candidate.id;
        }
    }

    return candidates[0]?.id ?? null;
};

export const isOtherTargetGroupSelected = (
    selections: TaxonomySelectionsMap | undefined,
    nodes: TaxonomyNodeDto[]
): boolean => {
    const otherId = findOtherTargetGroupNodeId(nodes);
    if (!otherId) return false;
    const allSelected = Object.values(selections ?? {}).flat();
    return allSelected.includes(otherId);
};