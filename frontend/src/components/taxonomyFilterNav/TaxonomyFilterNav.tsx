import React, { useEffect, useMemo, useState } from "react";
import {Card, Empty, Tree} from "antd";
import type { DataNode, TreeProps } from "antd/es/tree";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { taxonomyNodeService } from "../../services/taxonomyNodeService/taxonomyNodeService.ts";
import type { TaxonomyIndexRecord, LocalTaxonomyNode } from "../../types/UiTreeNode.ts";
import "./TaxonomyFilterNav.less";

export type PickedNode = {
    id: string;
    title: string; // nameDe
    path?: string;
    depth?: number;
};

export type TaxonomyFilterNavProps = {
    value?: string | null;
    onPick?: (node: PickedNode | null) => void;
    taxonomyIndex?: Record<string, TaxonomyIndexRecord> | null;
    title?: string;
    pickLeavesOnly?: boolean;
};

// --- helpers ----------------------------------------------------
const findNodeById = (arr: LocalTaxonomyNode[], id: string): LocalTaxonomyNode | null => {
    for (const n of arr) {
        if (n.id === id) return n;
        if (n.children?.length) {
            const c = findNodeById(n.children as LocalTaxonomyNode[], id);
            if (c) return c;
        }
    }
    return null;
};

const findPathToNode = (
    arr: LocalTaxonomyNode[],
    id: string,
    path: string[] = []
): string[] | null => {
    for (const n of arr) {
        const nextPath = [...path, n.id];
        if (n.id === id) return nextPath;
        if (n.children?.length) {
            const p = findPathToNode(n.children as LocalTaxonomyNode[], id, nextPath);
            if (p) return p;
        }
    }
    return null;
};

const toTreeData = (nodes: LocalTaxonomyNode[]): DataNode[] =>
    nodes.map((n) => {
        const label = (
            <span
                style={{
                    borderLeft: n.color ? `4px solid ${n.color}` : undefined,
                    paddingLeft: n.color ? 4 : 0,
                }}
            >
        {n.nameDe ?? ""}
      </span>
        );

        return {
            key: n.id,
            title: label,
            children: (n.children?.length ? toTreeData(n.children as LocalTaxonomyNode[]) : undefined) as
                | DataNode[]
                | undefined,
            selectable: true,
            isLeaf: !n.children || n.children.length === 0,
        } as DataNode;
    });

const TaxonomyFilterNav: React.FC<TaxonomyFilterNavProps> = ({
                                                                 value,
                                                                 onPick,
                                                                 title = "Kategorien",
                                                                 pickLeavesOnly = false,
                                                             }) => {
    const [tree, setTree] = useState<LocalTaxonomyNode[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>(value ? [value] : []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const structure = await taxonomyNodeService.fetchTaxonomyStructure();
                setTree((structure?.tree ?? []) as LocalTaxonomyNode[]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (value) setSelectedKeys([value]);
        else setSelectedKeys([]);
    }, [value]);

    const treeData: DataNode[] = useMemo(() => toTreeData(tree), [tree]);

    const handleSelect: TreeProps["onSelect"] = (_keys, info) => {
        const k = String(info?.node?.key || "");
        if (!k) {
            setSelectedKeys([]);
            onPick?.(null);
            return;
        }

        if (selectedKeys[0] === k) {
            setSelectedKeys([]);
            onPick?.(null);
            setExpandedKeys([]);
            return;
        }

        const n = findNodeById(tree, k);
        if (!n) {
            setSelectedKeys([]);
            onPick?.(null);
            setExpandedKeys([]);
            return;
        }
        if (pickLeavesOnly && n.children?.length) return;

        setSelectedKeys([k]);
        onPick?.({ id: n.id, title: n.nameDe ?? "", path: n.path, depth: n.depth });

        const path = findPathToNode(tree, k) ?? [];
        setExpandedKeys(path);
    };


    const handleExpand: TreeProps["onExpand"] = (_keys, info) => {
        const k = String(info?.node?.key || "");
        const path = findPathToNode(tree, k) ?? [];

        if (info.expanded) {
            // expand: exakt den Pfad dieses Nodes öffnen (alle anderen Äste schließen)
            setExpandedKeys(path);
        } else {
            // collapse: eine Ebene hoch (Pfad ohne den letzten)
            setExpandedKeys(path.slice(0, -1));
        }
    };

    if (loading) return null;

    return (
        <Card
            variant="outlined"
            size="small"
            style={{ position: "sticky", top: 16 }}
            styles={{
                header: { padding: 8 },
                body: { padding: 8 },
            }}
            title={title}
        >
            {tree.length === 0 ? (
                <Empty description="Keine Kriterien" />
            ) : (
                <div className="taxonomy-simple-tree">
                    <Tree
                        treeData={treeData}
                        expandedKeys={expandedKeys}
                        selectedKeys={selectedKeys}
                        onSelect={handleSelect}
                        onExpand={handleExpand}
                        showIcon={false}
                        showLine={false}
                        blockNode={false}
                        switcherIcon={({ expanded, isLeaf }) =>
                            isLeaf ? null : expanded ? (
                                <DownOutlined style={{ fontSize: 10, opacity: 0.8, transition: "transform 0.2s" }} />
                            ) : (
                                <RightOutlined style={{ fontSize: 10, opacity: 0.8, transition: "transform 0.2s" }} />
                            )
                        }
                    />
                </div>
            )}
        </Card>
    );
};

export default TaxonomyFilterNav;
