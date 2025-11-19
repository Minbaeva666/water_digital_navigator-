import React, {useMemo} from "react";
import {Tree, Button, Space, Tooltip, Tag} from "antd";
import type {EventDataNode} from "antd/es/tree";
import {EditOutlined, PlusOutlined, StarFilled} from "@ant-design/icons";
import {TaxonomyNodeDto} from "../../types/dtos/TaxonomyNodeDto";
import {UiTreeNode} from "../../types/UiTreeNode";
import "./TaxonomyTree.less";
import {mapDtoToUi} from "../../utils/mapper/taxonomyNodes.mapper.ts";
import {collectKeysDeep} from "../../utils/taxonomyTree.ts";

type Props = {
    maxDepth: number;
    data: TaxonomyNodeDto[];
    expandedKeys: React.Key[];
    setExpandedKeys: React.Dispatch<React.SetStateAction<React.Key[]>>;
    loading?: boolean;
    onEdit: (node: TaxonomyNodeDto) => void;
    onAdd: (parent: TaxonomyNodeDto | null) => void; // null = Root hinzufügen
    searchValue?: string;
};


export const TaxonomyTree: React.FC<Props> = ({
                                                  maxDepth,
                                                  data,
                                                  onEdit,
                                                  onAdd,
                                                  expandedKeys,
                                                  setExpandedKeys,
                                                  searchValue = ""
                                              }) => {
    const treeData = useMemo(() => mapDtoToUi(data), [data]);

    const handleToggle = (node: EventDataNode<UiTreeNode>) => {
        setExpandedKeys((prev) =>
            prev.includes(node.key)
                ? prev.filter((k) => !collectKeysDeep(node as UiTreeNode).includes(String(k)))
                : [...prev, node.key]
        );
    };

    return (
        <Tree<UiTreeNode>
            className="taxonomy-tree"
            blockNode
            selectable={false}
            treeData={treeData}
            showLine={true}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys)}
            onClick={(_, node) => handleToggle(node)}
            titleRender={(node) => {
                const name = node.title as string;
                const index = name.toLowerCase().indexOf(searchValue.toLowerCase());
                let displayName: React.ReactNode = name;

                if (index > -1 && searchValue) {
                    const before = name.substring(0, index);
                    const match = name.substring(index, index + searchValue.length);
                    const after = name.substring(index + searchValue.length);
                    displayName = (
                        <>
                            {before}
                            <span style={{backgroundColor: "yellow"}}>{match}</span>
                            {after}
                        </>
                    );
                }

                return (
                    <div>
                        <Space>
                            {/* Stern + Farbkreis nur bei Root */}
                            {node.depth === 0 && (
                                <span style={{display: "inline-flex", alignItems: "center", gap: 6}}>
                                    {/* Farbiger Kreis */}
                                    <span
                                        style={{
                                            display: "inline-block",
                                            width: 12,
                                            height: 12,
                                            borderRadius: "50%",
                                            backgroundColor: node.raw?.color || "#ccc",
                                        }}
                                    />
                                    {/* Gelber Stern, wenn Root-Favorit */}
                                    {node.raw?.isFav === true && (
                                        <StarFilled style={{color: "#fadb14", fontSize: 14}}/>
                                    )}
                            </span>
                            )}

                            <span
                                style={{cursor: "pointer"}}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggle(node as EventDataNode<UiTreeNode>);
                                }}
                            >
                            {displayName}
                                {node.raw._isNew && (
                                    <Tag color="green" style={{marginLeft: 4}}>
                                        Neu
                                    </Tag>
                                )}
                                {node.raw._isUpdated && !node.raw._isNew && (
                                    <Tag color="blue" style={{marginLeft: 4}}>
                                        Geändert
                                    </Tag>
                                )}
                            </span>

                            <Tooltip title="Editieren">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined/>}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(node.raw);
                                    }}
                                />
                            </Tooltip>

                            {node.depth < maxDepth - 1 && (
                                <Tooltip title="Unterkriterium hinzufügen">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<PlusOutlined/>}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAdd(node.raw);
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </Space>
                    </div>
                );
            }}
        />
    );
};

export default TaxonomyTree;