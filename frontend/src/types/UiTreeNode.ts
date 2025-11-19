import {TaxonomyNodeDto} from "./dtos/TaxonomyNodeDto.ts";

export type UiTreeNode = {
    key: string;
    id: string;
    depth: number;
    type: string;
    title: string;
    raw: any;
    parent?: UiTreeNode;
    children?: UiTreeNode[];
};

export type LocalTaxonomyNode = TaxonomyNodeDto & {
    _isNew?: boolean;
    _isUpdated?: boolean;
    _isDeleted?: boolean;
};

export type TaxonomyIndexRecord = {
    id: string;
    nameDe?: string | null;
    nameEn?: string | null;
    slug: string;
    path: string;
    depth: number;
    color?: string | null;
    type?: string | null;
    parentId?: string | null;
    rootId: string;
    ancestors: string[];
};

export type TaxonomyStructureResponse = {
    tree: TaxonomyNodeDto[];
    index: Record<string, TaxonomyIndexRecord>;
};
