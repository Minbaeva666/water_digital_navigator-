// components/faq/FaqEditorComponent.tsx
import { useEffect, useMemo, useState } from "react";
import {
    Collapse,
    Typography,
    Spin,
    Alert,
    Empty,
    Row,
    Col,
    Button,
    Tooltip,
    Modal,
    message,
    Space,
    Divider,
} from "antd";
import {
    PlusOutlined,
    SaveOutlined,
    UndoOutlined,
    ExclamationCircleOutlined,
    DeleteOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    EditOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import isEqual from "lodash.isequal";
import { faqService } from "../../services/appOptionService/appOptionService";
import type { FaqDto } from "../../types/dtos/FaqDto";
import FaqItemModal from "../Modals/faqItemModal/FaqItemModal";
import GenericModal from "../Modals/genericModal/GenericModal";

// Markdown-Rendering
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link as RouterLink } from "react-router-dom";

import "./FaqEditorComponent.less";

type UiItem = { id?: string; tmpId?: string; header: string; content: string };

// Fallback für Umgebungen ohne crypto.randomUUID
const tempId = () =>
    (crypto?.randomUUID
        ? crypto.randomUUID()
        : `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** Hinweis-Box für Admins: kurze Markdown-Cheat-Sheet + Link-Beispiele */
function FormattingHelp({ onClose }: { onClose: () => void }) {
    return (
        <Alert
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            message="Hinweise zur Formatierung (Markdown)"
            description={
                <div>
                    <Typography.Paragraph style={{ marginBottom: 8 }}>
                        Du kannst die Inhalte der FAQ-Einträge mit <strong>Markdown</strong> formatieren. Nützliche Beispiele:
                    </Typography.Paragraph>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li>
                            <Typography.Text>Fett/Kursiv:</Typography.Text>{" "}
                            <Typography.Text code>**fett**</Typography.Text>,{" "}
                            <Typography.Text code>*kursiv*</Typography.Text>
                        </li>
                        <li>
                            <Typography.Text>Überschriften:</Typography.Text>{" "}
                            <Typography.Text code># H1</Typography.Text>{" "}
                            <Typography.Text code>## H2</Typography.Text>{" "}
                            <Typography.Text code>### H3</Typography.Text>
                        </li>
                        <li>
                            <Typography.Text>Listen:</Typography.Text>{" "}
                            <Typography.Text code>- Punkt A</Typography.Text>,{" "}
                            <Typography.Text code>1. Erster Punkt</Typography.Text>
                        </li>
                        <li>
                            <Typography.Text>Zeilenumbruch:</Typography.Text>{" "}
                            <Typography.Text code>{"Z.1  ⏎  Z.2"}</Typography.Text> (Leerzeile dazwischen)
                        </li>
                        <li>
                            <Typography.Text>Interne Links (Router):</Typography.Text>{" "}
                            <Typography.Text code>[Datenschutzerklärung](/datenschutz)</Typography.Text>
                        </li>
                        <li>
                            <Typography.Text>Externe Links (neuer Tab):</Typography.Text>{" "}
                            <Typography.Text code>[Website](https://example.com)</Typography.Text>
                        </li>
                    </ul>
                    <Divider style={{ margin: "8px 0" }} />
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        Tipp: Du kannst die Formatierung sofort in der Vorschau des geöffneten Panels prüfen.
                    </Typography.Paragraph>
                </div>
            }
            closable
            onClose={onClose}
            style={{ marginBottom: 12 }}
        />
    );
}

export default function FaqEditorComponent() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [faqId, setFaqId] = useState<string | undefined>(undefined);
    const [items, setItems] = useState<UiItem[]>([]);
    const [initialItems, setInitialItems] = useState<UiItem[]>([]);

    // Hinweis-Box: default sichtbar; NICHT persistent
    const [showHelp, setShowHelp] = useState(true);

    // Modal: Add
    const [addModalOpen, setAddModalOpen] = useState(false);

    // Modal: Edit
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    // GenericModal: Save
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [saveModalText, setSaveModalText] = useState<string>("");

    // GenericModal: Delete
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ key: string; header: string } | null>(
        null
    );

    const hasChanges = useMemo(
        () =>
            !isEqual(
                items.map(({ header, content }) => ({ header, content })),
                initialItems.map(({ header, content }) => ({ header, content }))
            ),
        [items, initialItems]
    );

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await faqService.fetchFaq();
                if (!alive) return;

                if (data) {
                    setFaqId(data.id);
                    const mapped: UiItem[] = (data.items ?? [])
                        .sort((a, b) => a.sort - b.sort)
                        .map((it) => ({ id: it.id, header: it.header, content: it.content }));
                    setItems(mapped);
                    setInitialItems(mapped);
                } else {
                    setFaqId(undefined);
                    setItems([]);
                    setInitialItems([]);
                }
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message ?? "Unbekannter Fehler beim Laden des FAQ.");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    // --- Hinzufügen ---
    const openAddModal = () => setAddModalOpen(true);
    const handleAddSave = ({ header, content }: { header: string; content: string }) => {
        const h = header.trim();
        const c = content.trim();
        if (!h || !c) {
            message.warning("Bitte Überschrift und Text angeben.");
            return;
        }
        setItems((prev) => [...prev, { tmpId: tempId(), header: h, content: c }]);
        setAddModalOpen(false);
    };

    // --- Bearbeiten ---
    const openEditModal = (idx: number) => {
        setEditIndex(idx);
        setEditModalOpen(true);
    };
    const handleEditSave = ({ header, content }: { header: string; content: string }) => {
        if (editIndex === null) return;
        const h = header.trim();
        const c = content.trim();
        if (!h || !c) {
            message.warning("Bitte Überschrift und Text angeben.");
            return;
        }
        setItems((prev) => {
            const next = prev.slice();
            next[editIndex] = { ...next[editIndex], header: h, content: c };
            return next;
        });
        setEditModalOpen(false);
        setEditIndex(null);
    };

    // --- Löschen (vor dem Speichern) ---
    const openDeleteModal = (key: string, header: string) => {
        setDeleteTarget({ key, header });
        setDeleteModalOpen(true);
    };
    const confirmDelete = () => {
        if (deleteTarget) {
            setItems((prev) => prev.filter((it) => (it.id ?? it.tmpId) !== deleteTarget.key));
        }
        setDeleteModalOpen(false);
        setDeleteTarget(null);
    };
    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setDeleteTarget(null);
    };

    // --- Reihenfolge ändern ---
    const moveItem = (idx: number, dir: "up" | "down") => {
        setItems((prev) => {
            const next = prev.slice();
            const target = dir === "up" ? idx - 1 : idx + 1;
            if (target < 0 || target >= next.length) return prev;
            const tmp = next[idx];
            next[idx] = next[target];
            next[target] = tmp;
            return next;
        });
    };

    // --- Reset & Save ---
    const handleReset = () => {
        Modal.confirm({
            title: "Änderungen verwerfen?",
            icon: <ExclamationCircleOutlined />,
            okText: "Ja, verwerfen",
            cancelText: "Abbrechen",
            okType: "danger",
            onOk: () => {
                setItems(initialItems);
                message.info("Änderungen verworfen.");
            },
        });
    };

    const openSaveModal = () => {
        setSaveModalText(
            items.length === 0
                ? "Es sind keine Einträge vorhanden. FAQ ohne Einträge speichern?"
                : "Möchtest du die Änderungen am FAQ speichern?"
        );
        setSaveModalOpen(true);
    };
    const confirmSave = async () => {
        setSaveModalOpen(false);
        await doSave();
    };
    const cancelSave = () => setSaveModalOpen(false);

    const doSave = async () => {
        try {
            setSaving(true);
            const payload = {
                id: faqId,
                items: items.map(({ header, content }) => ({ header, content })),
            };
            const updated: FaqDto = await faqService.updateFaq(payload);
            setFaqId(updated.id);
            const mapped: UiItem[] = (updated.items ?? [])
                .sort((a, b) => a.sort - b.sort)
                .map((it) => ({ id: it.id, header: it.header, content: it.content }));
            setItems(mapped);
            setInitialItems(mapped);
            message.success("FAQ gespeichert.");
        } catch (e: any) {
            message.error(e?.message ?? "Speichern fehlgeschlagen.");
        } finally {
            setSaving(false);
        }
    };

    const keyOf = (it: UiItem, idx: number) => it.id ?? it.tmpId ?? String(idx);

    return (
        <div className="faqEditorContainer">
            {/* Toolbar */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                {/* Links: nur "Eintrag hinzufügen" */}
                <Col>
                    <Tooltip title="Neuen FAQ-Eintrag hinzufügen">
                        <Button icon={<PlusOutlined />} type="primary" onClick={openAddModal}>
                            Eintrag hinzufügen
                        </Button>
                    </Tooltip>
                </Col>

                {/* Rechtsbündig: Hilfe-Toggle, Speichern, Zurücksetzen */}
                <Col>
                    <Row gutter={8} wrap={false}>
                        <Col>
                            <Tooltip title={showHelp ? "Hilfe ausblenden" : "Hilfe einblenden"}>
                                <Button
                                    icon={<InfoCircleOutlined />}
                                    onClick={() => setShowHelp((v) => !v)}
                                >
                                    {showHelp ? "Formatierungshilfe ausblenden" : "Formatierungshilfe einblenden"}
                                </Button>
                            </Tooltip>
                        </Col>
                        <Col>
                            <Tooltip title="FAQ speichern">
                <span style={{ display: "inline-block" }}>
                  <Button
                      icon={<SaveOutlined />}
                      type="primary"
                      onClick={openSaveModal}
                      loading={saving}
                      disabled={!hasChanges && items.length === initialItems.length}
                  >
                    Speichern
                  </Button>
                </span>
                            </Tooltip>
                        </Col>
                        <Col>
                            <Tooltip title="Änderungen verwerfen">
                                <Button icon={<UndoOutlined />} onClick={handleReset} disabled={!hasChanges}>
                                    Zurücksetzen
                                </Button>
                            </Tooltip>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* Hinweise (standardmäßig sichtbar, beim Schließen ausgeblendet; nach Reload wieder sichtbar) */}
            {showHelp && <FormattingHelp onClose={() => setShowHelp(false)} />}

            {/* Inhalt */}
            {loading && <Spin />}

            {!loading && error && (
                <Alert type="error" showIcon message="Fehler" description={error} />
            )}

            {!loading && !error && items.length === 0 && (
                <Empty
                    description="Noch keine FAQ-Einträge vorhanden"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}

            {!loading && !error && items.length > 0 && (
                <Collapse>
                    {items.map((it, idx) => {
                        const k = keyOf(it, idx);
                        const isFirst = idx === 0;
                        const isLast = idx === items.length - 1;

                        return (
                            <Collapse.Panel
                                key={k}
                                header={it.header}
                                extra={
                                    <Space size={4} onClick={(e) => e.stopPropagation()}>
                                        <Tooltip title="Nach oben">
                                            <Button
                                                size="small"
                                                icon={<ArrowUpOutlined />}
                                                disabled={isFirst}
                                                onClick={() => moveItem(idx, "up")}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Nach unten">
                                            <Button
                                                size="small"
                                                icon={<ArrowDownOutlined />}
                                                disabled={isLast}
                                                onClick={() => moveItem(idx, "down")}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Eintrag bearbeiten">
                                            <Button
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => openEditModal(idx)}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Eintrag entfernen">
                                            <Button
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => openDeleteModal(k, it.header)}
                                            />
                                        </Tooltip>
                                    </Space>
                                }
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ node, ...props }) => (
                                            <Typography.Paragraph style={{ marginBottom: 8 }} {...props} />
                                        ),
                                        h1: ({ node, ...props }) => <Typography.Title level={2} {...props} />,
                                        h2: ({ node, ...props }) => <Typography.Title level={3} {...props} />,
                                        h3: ({ node, ...props }) => <Typography.Title level={4} {...props} />,
                                        ul: ({ node, ...props }) => (
                                            <ul style={{ marginBottom: 8, paddingLeft: 22 }} {...props} />
                                        ),
                                        ol: ({ node, ...props }) => (
                                            <ol style={{ marginBottom: 8, paddingLeft: 22 }} {...props} />
                                        ),
                                        li: ({ node, ...props }) => <li style={{ marginBottom: 4 }} {...props} />,
                                        a: ({ href = "", children, ...props }) => {
                                            const isExternal = /^https?:\/\//i.test(href);
                                            if (!isExternal && href.startsWith("/")) {
                                                return <RouterLink to={href}>{children}</RouterLink>;
                                            }
                                            return (
                                                <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                                                    {children}
                                                </a>
                                            );
                                        },
                                    }}
                                >
                                    {it.content}
                                </ReactMarkdown>
                            </Collapse.Panel>
                        );
                    })}
                </Collapse>
            )}

            {/* Modal: Eintrag hinzufügen */}
            <FaqItemModal
                open={addModalOpen}
                onCancel={() => setAddModalOpen(false)}
                onSave={handleAddSave}
                mode="add"
            />

            {/* Modal: Eintrag bearbeiten */}
            <FaqItemModal
                open={editModalOpen}
                onCancel={() => {
                    setEditModalOpen(false);
                    setEditIndex(null);
                }}
                onSave={handleEditSave}
                mode="edit"
                initial={
                    editIndex !== null
                        ? {
                            header: items[editIndex]?.header ?? "",
                            content: items[editIndex]?.content ?? "",
                        }
                        : undefined
                }
            />

            {/* GenericModal: Speichern bestätigen */}
            <GenericModal
                open={saveModalOpen}
                title="FAQ speichern?"
                text={saveModalText}
                onCancel={cancelSave}
                onConfirm={confirmSave}
                cancelText="Abbrechen"
                confirmText="Speichern"
            />

            {/* GenericModal: Löschen bestätigen */}
            <GenericModal
                open={deleteModalOpen}
                title="Eintrag wirklich löschen?"
                text={
                    deleteTarget
                        ? `Möchtest du den Eintrag „${deleteTarget.header}“ wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.`
                        : "Möchtest du den Eintrag wirklich löschen?"
                }
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
                cancelText="Abbrechen"
                confirmText="Löschen"
                confirmButtonProps={{ danger: true }}
            />
        </div>
    );
}
