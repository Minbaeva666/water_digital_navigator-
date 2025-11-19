export interface TaxonomyNodeDto {
    id: string;
    nameDe: string;
    slug: string;
    type: string;
    parentId?: string | null;
    path: string;
    isFav?: boolean;
    depth: number;
    sort: number;
    color?: string | null;
    maxSelectableNodes?: number | null;
    minSelectableNodes?: number | null;
    children: TaxonomyNodeDto[];
}