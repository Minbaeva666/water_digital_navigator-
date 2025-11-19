import { useEffect, useMemo, useState } from "react";
import {
    Typography,
    Row,
    Col,
    Button,
    Tooltip,
    Spin,
    Alert,
    message,
    Divider,
    Input,
} from "antd";
import {
    SaveOutlined,
    UndoOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import isEqual from "lodash.isequal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link as RouterLink } from "react-router-dom";

import GenericModal from "../Modals/genericModal/GenericModal";

// import "./AccessibilityStatementEditorComponent.less";
import type { AccessibilityStatementDto } from "../../types/dtos/AccessibilityStatementDto";
import { accessibilityService } from "../../services/appOptionService/appOptionService";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

/** Kurze Markdown-Hilfe (ein-/ausblendbar, NICHT persistent) */
function FormattingHelp({ onClose }: { onClose: () => void }) {
    return (
        <Alert
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            message="Hinweise zur Formatierung (Markdown)"
            description={
                <div>
                    <Paragraph style={{ marginBottom: 8 }}>
                        Du kannst die Barrierefreiheitserklärung mit <strong>Markdown</strong> formatieren.
                    </Paragraph>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li>
                            <Text>Fett/Kursiv:</Text> <Text code>**fett**</Text>,{" "}
                            <Text code>*kursiv*</Text>
                        </li>
                        <li>
                            <Text>Überschriften:</Text>{" "}
                            <Text code># H1</Text> <Text code>## H2</Text> <Text code>### H3</Text>
                        </li>
                        <li>
                            <Text>Listen:</Text> <Text code>- Punkt</Text>,{" "}
                            <Text code>1. Erster Punkt</Text>
                        </li>
                        <li>
                            <Text>Zeilenumbruch:</Text>{" "}
                            <Text code>{"Zeile 1  ⏎  (Leerzeile)  ⏎  Zeile 2"}</Text>
                        </li>
                        <li>
                            <Text>Interne Links (Router):</Text>{" "}
                            <Text code>[Datenschutzerklärung](/datenschutz)</Text>
                        </li>
                        <li>
                            <Text>Externe Links (neuer Tab):</Text>{" "}
                            <Text code>[Website](https://example.com)</Text>
                        </li>
                    </ul>
                    <Divider style={{ margin: "8px 0" }} />
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        Tipp: Rechts siehst du die Live-Vorschau.
                    </Paragraph>
                </div>
            }
            closable
            onClose={onClose}
            style={{ marginBottom: 12 }}
        />
    );
}

export default function AccessibilityStatementEditorComponent() {
    // Lade-/Fehler-/Save-Status
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Daten
    const [entryId, setEntryId] = useState<string | undefined>(undefined);
    const [content, setContent] = useState<string>("");
    const [initialContent, setInitialContent] = useState<string>("");

    // Save-Bestätigung
    const [saveModalOpen, setSaveModalOpen] = useState(false);

    // Markdown-Hilfe: NICHT persistent – bei Reload wieder sichtbar
    const [showHelp, setShowHelp] = useState<boolean>(true);

    const hasChanges = useMemo(
        () => !isEqual(content, initialContent),
        [content, initialContent]
    );

    // Laden beim Mount
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);

                const data: AccessibilityStatementDto | undefined =
                    await accessibilityService.fetchAccessibilityStatement();
                if (!alive) return;

                if (data) {
                    setEntryId(data.id);
                    setContent(data.content ?? "");
                    setInitialContent(data.content ?? "");
                } else {
                    setEntryId(undefined);
                    setContent("");
                    setInitialContent("");
                }
            } catch (e: any) {
                if (!alive) return;
                setError(
                    e?.message ?? "Barrierefreiheitserklärung konnte nicht geladen werden."
                );
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    // Reset
    const handleReset = () => {
        setContent(initialContent);
        message.info("Änderungen verworfen.");
    };

    // Speichern
    const openSaveModal = () => setSaveModalOpen(true);
    const cancelSave = () => setSaveModalOpen(false);

    const confirmSave = async () => {
        try {
            setSaveModalOpen(false);
            setSaving(true);
            const payload = { id: entryId, content };
            const updated = await accessibilityService.updateAccessibilityStatement(payload);
            setEntryId(updated.id);
            setContent(updated.content ?? "");
            setInitialContent(updated.content ?? "");
            message.success("Barrierefreiheitserklärung gespeichert.");
        } catch (e: any) {
            message.error(e?.message ?? "Speichern fehlgeschlagen.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="accessibilityEditorContainer">
            <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        Barrierefreiheit (Editor)
                    </Title>
                </Col>
                <Col>
                    <Row gutter={8} wrap={false}>
                        <Col>
                            <Tooltip title={showHelp ? "Hilfe ausblenden" : "Hilfe einblenden"}>
                                <Button
                                    icon={<InfoCircleOutlined />}
                                    onClick={() => setShowHelp((v) => !v)}
                                >
                                    {showHelp
                                        ? "Formatierungshilfe ausblenden"
                                        : "Formatierungshilfe einblenden"}
                                </Button>
                            </Tooltip>
                        </Col>
                        <Col>
                            <Tooltip title="Barrierefreiheitserklärung speichern">
                <span style={{ display: "inline-block" }}>
                  <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={openSaveModal}
                      loading={saving}
                      disabled={!hasChanges}
                  >
                    Speichern
                  </Button>
                </span>
                            </Tooltip>
                        </Col>
                        <Col>
                            <Tooltip title="Änderungen verwerfen">
                                <Button
                                    icon={<UndoOutlined />}
                                    onClick={handleReset}
                                    disabled={!hasChanges}
                                >
                                    Zurücksetzen
                                </Button>
                            </Tooltip>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {showHelp && <FormattingHelp onClose={() => setShowHelp(false)} />}

            {loading && (
                <div style={{ textAlign: "center", padding: 24 }}>
                    <Spin size="large" />
                </div>
            )}

            {!loading && error && (
                <Alert type="error" showIcon message="Fehler" description={error} />
            )}

            {!loading && !error && (
                <Row gutter={[16, 16]}>
                    {/* Editor */}
                    <Col xs={24} lg={12}>
                        <Title level={5}>Editor</Title>
                        <TextArea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Hier die Barrierefreiheitserklärung in Markdown schreiben…"
                            autoSize={{ minRows: 16 }}
                            allowClear
                        />
                    </Col>

                    {/* Live-Vorschau */}
                    <Col xs={24} lg={12}>
                        <Title level={5}>Vorschau</Title>
                        <div className="accessibility-preview">
                            {content?.trim() ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ node, ...props }) => (
                                            <Paragraph style={{ marginBottom: 8 }} {...props} />
                                        ),
                                        h1: ({ node, ...props }) => (
                                            <Typography.Title level={2} {...props} />
                                        ),
                                        h2: ({ node, ...props }) => (
                                            <Typography.Title level={3} {...props} />
                                        ),
                                        h3: ({ node, ...props }) => (
                                            <Typography.Title level={4} {...props} />
                                        ),
                                        ul: ({ node, ...props }) => (
                                            <ul style={{ marginBottom: 8, paddingLeft: 22 }} {...props} />
                                        ),
                                        ol: ({ node, ...props }) => (
                                            <ol style={{ marginBottom: 8, paddingLeft: 22 }} {...props} />
                                        ),
                                        li: ({ node, ...props }) => (
                                            <li style={{ marginBottom: 4 }} {...props} />
                                        ),
                                        a: ({ href = "", children, ...props }) => {
                                            const isExternal = /^https?:\/\//i.test(href);
                                            if (!isExternal && href.startsWith("/")) {
                                                // Interne Route via SPA
                                                return <RouterLink to={href}>{children}</RouterLink>;
                                            }
                                            // Externe Links in neuem Tab
                                            return (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    {...props}
                                                >
                                                    {children}
                                                </a>
                                            );
                                        },
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            ) : (
                                <Alert
                                    type="info"
                                    showIcon
                                    message="Noch kein Inhalt"
                                    description="Sobald du im Editor Text eingibst, erscheint hier die Vorschau."
                                />
                            )}
                        </div>
                    </Col>
                </Row>
            )}

            {/* Bestätigungsdialog Speichern */}
            <GenericModal
                open={saveModalOpen}
                title="Barrierefreiheitserklärung speichern?"
                text="Möchtest du die Änderungen an der Barrierefreiheitserklärung speichern?"
                onCancel={cancelSave}
                onConfirm={confirmSave}
                cancelText="Abbrechen"
                confirmText="Speichern"
            />
        </div>
    );
}