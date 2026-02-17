import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Col,
  Input,
  message,
  Modal,
  Row,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import "./TaxonomyAdminPage.less";
import {
  PlusOutlined,
  SaveOutlined,
  UndoOutlined,
  ShrinkOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { taxonomyNodeService } from "../../../services/taxonomyNodeService/taxonomyNodeService.ts";
import { TaxonomyNodeDto } from "../../../types/dtos/TaxonomyNodeDto.ts";
import { TaxonomyTree } from "../../../components/taxonomyTree/TaxonomyTree.tsx";
import TaxonomyNodeModal from "../../../components/Modals/taxonomyNodeModal/TaxonomyNodeModal.tsx";
import { mapDtoToLocal } from "../../../utils/mapper/taxonomyNodes.mapper.ts";
import { LocalTaxonomyNode } from "../../../types/UiTreeNode.ts";
import {
  deleteLocalNodeRecursive,
  flattenNodesForSearch,
  getParentKeyFromTree,
  slugify,
  sortByName,
  updateNodeRecursive,
} from "../../../utils/taxonomyTree.ts";
import isEqual from "lodash.isequal";

const { Title } = Typography;
const { Search } = Input;

const tempId = () =>
  crypto?.randomUUID
    ? crypto.randomUUID()
    : `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const TaxonomyAdminPage = () => {
  const MAX_DEPTH = 3;
  const [taxonomyNodes, setTaxonomyNodes] = useState<TaxonomyNodeDto[]>([]);
  const [initialTaxonomyNodes, setInitialTaxonomyNodes] = useState<
    TaxonomyNodeDto[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editNode, setEditNode] = useState<TaxonomyNodeDto | null>(null);
  const [addParent, setAddParent] = useState<TaxonomyNodeDto | null>(null);

  const hasChanges = !isEqual(taxonomyNodes, initialTaxonomyNodes);

  const loadNodes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await taxonomyNodeService.fetchTaxonomyNodes();
      const mapped = mapDtoToLocal(result);
      setTaxonomyNodes(mapped);
      setInitialTaxonomyNodes(mapped);
    } catch {
      message.error("Kriterien konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);

    if (!value) {
      setExpandedKeys([]);
      return;
    }

    const flatList = flattenNodesForSearch(taxonomyNodes);

    const matchedKeys = flatList
      .filter((item) => item.title.toLowerCase().includes(value.toLowerCase()))
      .map((item) => item.key);

    const keysToExpand = new Set<React.Key>();

    matchedKeys.forEach((key) => {
      keysToExpand.add(key);
      let parent = getParentKeyFromTree(key, taxonomyNodes);
      while (parent) {
        keysToExpand.add(parent);
        parent = getParentKeyFromTree(parent, taxonomyNodes);
      }
    });

    setExpandedKeys(Array.from(keysToExpand));
  };

  const handleSaveNode = (values: Partial<TaxonomyNodeDto>) => {
    if (editNode) {
      setTaxonomyNodes((prev) =>
        updateNodeRecursive(prev, editNode.id, values),
      );
    } else if (!editNode && !addParent) {
      addLocalRootNode(values);
    } else if (!editNode && addParent) {
      addLocalChildNode(addParent as LocalTaxonomyNode, values);
    }

    setModalOpen(false);
    setEditNode(null);
    setAddParent(null);
  };

  const addLocalRootNode = (values: Partial<TaxonomyNodeDto>) => {
    const newRoot: LocalTaxonomyNode = {
      id: tempId(),
      nameDe: values.nameDe || "Neues Root-Kriterium",
      slug: "",
      type: String(values.type || ""),
      parentId: null,
      isFav: values.isFav,
      path: "",
      depth: 0,
      sort: (taxonomyNodes?.length || 0) + 1,
      color: values.color || "#2962FA",
      maxSelectableNodes: values.maxSelectableNodes,
      minSelectableNodes: values.minSelectableNodes,
      children: [],
      _isNew: true,
      _isUpdated: false,
    };
    setTaxonomyNodes((prev) => sortByName([...prev, newRoot]));
  };

  const addLocalChildNode = (
    parent: LocalTaxonomyNode,
    values: Partial<TaxonomyNodeDto>,
  ) => {
    const newChild: LocalTaxonomyNode = {
      id: tempId(),
      nameDe: values.nameDe || "Neues Kriterium",
      slug: "",
      type: parent.type,
      parentId: parent.id,
      path: "",
      depth: parent.depth + 1,
      sort: (parent.children?.length || 0) + 1,
      color: parent.color,
      children: [],
      _isNew: true,
      _isUpdated: false,
    };

    const insertChildRecursive = (
      nodes: LocalTaxonomyNode[],
    ): LocalTaxonomyNode[] => {
      return nodes.map((node) => {
        if (node.id === parent.id) {
          return {
            ...node,
            children: sortByName([...(node.children || []), newChild]),
          };
        }
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: insertChildRecursive(node.children),
          };
        }
        return node;
      });
    };

    setTaxonomyNodes((prev) => insertChildRecursive(prev));

    // Parent automatisch expandieren
    setExpandedKeys((prev) =>
      prev.includes(parent.id) ? prev : [...prev, parent.id],
    );
  };

  const saveCriteria = async () => {
    try {
      await taxonomyNodeService.saveFullTree(taxonomyNodes);
      message.success("Alle Änderungen gespeichert.");
      await loadNodes();
    } catch (err: any) {
      message.error(err.message || "Fehler beim Speichern.");
    }
  };

  const handleDeleteNode = (node: LocalTaxonomyNode) => {
    Modal.confirm({
      title: "Knoten löschen?",
      content: `Möchten Sie den Knoten "${node.nameDe}" wirklich löschen? Alle Unterknoten werden ebenfalls entfernt.`,
      okText: "Löschen",
      okType: "danger",
      cancelText: "Abbrechen",
      onOk: () => {
        setTaxonomyNodes((prev) => deleteLocalNodeRecursive(prev, node.id));
        setAddParent(null);
        setEditNode(null);
        setModalOpen(false);
      },
    });
  };

  const handleResetTree = () => {
    Modal.confirm({
      title: "Alle Änderungen verwerfen?",
      content:
        "Möchten Sie wirklich alle Änderungen verwerfen? Der Baum wird auf den zuletzt gespeicherten Stand zurückgesetzt.",
      okText: "Ja, verwerfen",
      okType: "danger",
      cancelText: "Abbrechen",
      onOk: () => {
        setTaxonomyNodes(initialTaxonomyNodes);
        message.info("Änderungen wurden zurückgesetzt.");
      },
    });
  };

  // alle Nodes flach herausziehen (global)
  const flattenNodes = useCallback(
    (nodes: LocalTaxonomyNode[]): LocalTaxonomyNode[] => {
      const out: LocalTaxonomyNode[] = [];
      const walk = (arr: LocalTaxonomyNode[]) => {
        for (const n of arr) {
          out.push(n);
          if (n.children?.length) walk(n.children as LocalTaxonomyNode[]);
        }
      };
      walk(nodes);
      return out;
    },
    [],
  );

  // globaler Name-Check (per slug) – selfId ausklammern (falls Edit)
  const isNameTakenGlobal = useCallback(
    (name: string, selfId?: string) => {
      const v = (name ?? "").trim();
      if (!v) return false;
      const target = slugify(v);
      const all = flattenNodes(taxonomyNodes as unknown as LocalTaxonomyNode[]);
      return all.some(
        (n) => n.id !== selfId && slugify(n.nameDe || "") === target,
      );
    },
    [taxonomyNodes, flattenNodes],
  );

  const confirmSave = () => {
    Modal.confirm({
      title: "Kriterien speichern?",
      icon: <ExclamationCircleOutlined />,
      content:
        "Wollen Sie wirklich den Baum mit den überarbeiteten Kriterien speichern? Diese Aktion kann nicht rückgängig gemacht werden.",
      okText: "Ja, speichern",
      cancelText: "Abbrechen",
      onOk: saveCriteria,
    });
  };

  const collapseAll = () => setExpandedKeys([]);

  return (
    <div className="create-edit-view-taxonomy">
      {/* Header */}
      <div className="create-edit-header-taxonomy">
        <Row justify="space-between" align="middle">
          <Col flex="auto">
            <Title level={3} style={{ margin: 0 }}>
              Kriterien Editor
            </Title>
          </Col>
          <Col>
            <Row gutter={8} wrap={false}>
              <Col>
                <Tooltip title="Kriterien speichern">
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={confirmSave}
                    disabled={!hasChanges}
                  />
                </Tooltip>
              </Col>
              <Col>
                <Tooltip title="Änderungen Rückgängig machen">
                  <Button
                    danger
                    icon={<UndoOutlined />}
                    onClick={handleResetTree}
                    disabled={!hasChanges}
                  />
                </Tooltip>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>

      {/* Add Root + Collapse All */}
      <div className="add-root-button-taxonomy" style={{ marginBottom: 12 }}>
        <Row gutter={8} wrap={false} align="middle">
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setAddParent(null);
                setEditNode(null);
                setModalOpen(true);
              }}
            >
              Root-Kriterium hinzufügen
            </Button>
          </Col>
          <Col>
            <Tooltip title="Gesamten Baum einklappen">
              <Button
                icon={<ShrinkOutlined />}
                onClick={collapseAll}
                disabled={expandedKeys.length === 0}
              />
            </Tooltip>
          </Col>
          <Col style={{ maxWidth: 300, flex: "0 0 auto" }}>
            <Search
              placeholder="Kriterium suchen"
              value={searchValue}
              onChange={handleSearchChange}
              allowClear
            />
          </Col>
        </Row>
      </div>

      {/* Tree */}
      <div className="create-edit-body-taxonomy">
        {loading ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <Spin tip="Lade Kriterien..." size="large" />
          </div>
        ) : taxonomyNodes.length === 0 ? (
          <div
            style={{
              padding: 16,
              textAlign: "center",
              color: "#888",
            }}
          >
            Noch keine Kriterien angelegt, fügen Sie das erste Root-Kriterium
            hinzu.
          </div>
        ) : (
          <TaxonomyTree
            maxDepth={MAX_DEPTH}
            data={taxonomyNodes}
            expandedKeys={expandedKeys}
            setExpandedKeys={setExpandedKeys}
            loading={loading}
            searchValue={searchValue}
            onEdit={(node) => {
              setEditNode(node);
              setAddParent(null);
              setModalOpen(true);
            }}
            onAdd={(parent) => {
              setEditNode(null);
              setAddParent(parent);
              setModalOpen(true);
            }}
          />
        )}
      </div>
      {/* Modal für Add/Edit */}
      <TaxonomyNodeModal
        open={modalOpen}
        node={editNode}
        parent={addParent}
        onCancel={() => {
          setModalOpen(false);
          setEditNode(null);
          setAddParent(null);
        }}
        onSave={handleSaveNode}
        onDelete={handleDeleteNode}
        isNameTaken={(name) => isNameTakenGlobal(name, editNode?.id)}
      />
    </div>
  );
};

export default TaxonomyAdminPage;
