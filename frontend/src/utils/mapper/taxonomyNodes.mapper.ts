import {TaxonomyNodeDto} from "../../types/dtos/TaxonomyNodeDto.ts";
import {LocalTaxonomyNode, UiTreeNode} from "../../types/UiTreeNode.ts";

export const mapDtoToLocal = (nodes: TaxonomyNodeDto[]): LocalTaxonomyNode[] =>
    nodes.map((n) => ({
        ...n,
        _isNew: false,
        _isUpdated: false,
        _isDeleted: false,
        children: n.children ? mapDtoToLocal(n.children) : [],
    }));

export const mapDtoToUi = (
    nodes: TaxonomyNodeDto[],
    parent?: UiTreeNode
): UiTreeNode[] =>
    nodes.map((n) => {
        const uiNode: UiTreeNode = {
            key: String(n.id),
            id: n.id,
            depth: n.depth,
            type: n.type,
            title: n.nameDe,
            raw: n,
            parent,
        };
        uiNode.children = n.children?.length
            ? mapDtoToUi(n.children, uiNode)
            : undefined;
        return uiNode;
    });