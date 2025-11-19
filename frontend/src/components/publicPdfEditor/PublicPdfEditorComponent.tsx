import { useEffect, useState } from "react";
import { Upload, Button, Typography, message, Space, Row, Col, Card, Modal } from "antd";
import { InboxOutlined, UploadOutlined, DeleteOutlined, LinkOutlined } from "@ant-design/icons";
import type { PublicPdfDto } from "../../types/dtos/PublicPdfDto";
import { publicPdfService } from "../../services/publicPdfService/publicPdfService";

const { Dragger } = Upload;
const { Title, Text } = Typography;

function absUrl(urlOrPath?: string | null): string | null {
    if (!urlOrPath) return null;
    if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;

    const base = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
    const path = urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;

    // Spezialfall: publicUrl beginnt mit /api/
    // -> VITE_BACKEND_URL endet auch mit /api -> also das doppelte vermeiden
    if (base.endsWith("/api") && path.startsWith("/api/")) {
        return `${base.replace(/\/api$/, "")}${path}`;
    }

    return `${base}${path}`;
}

export default function PublicPdfEditorComponent() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [meta, setMeta] = useState<PublicPdfDto | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const m = await publicPdfService.fetchPublicPdf();
                if (m) setMeta(m);
            } catch {
                // optional: message.warn("Konnte aktuelle PDF nicht laden.");
            }
        })();
    }, []);

    const beforeSelect = (f: File) => {
        const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
        if (!isPdf) {
            message.error("Bitte eine PDF-Datei auswählen.");
            return Upload.LIST_IGNORE;
        }
        const lt20 = f.size / 1024 / 1024 < 20;
        if (!lt20) {
            message.error("Maximale Dateigröße: 20 MB.");
            return Upload.LIST_IGNORE;
        }
        setSelectedFile(f);
        return false; // kein Auto-Upload
    };

    const clearSelection = () => setSelectedFile(null);

    const handleUpload = async () => {
        if (!selectedFile) return;
        try {
            setUploading(true);
            const m = await publicPdfService.uploadPublicPdf({ file: selectedFile });
            setMeta(m);
            setSelectedFile(null);
            message.success("PDF veröffentlicht.");
        } catch (e: any) {
            message.error(e?.message || "Upload fehlgeschlagen.");
        } finally {
            setUploading(false);
        }
    };

    const confirmDelete = () => {
        Modal.confirm({
            title: "PDF wirklich löschen?",
            content: "Die aktuell veröffentlichte PDF wird entfernt und steht nicht mehr zum Download bereit.",
            okText: "Löschen",
            okType: "danger",
            cancelText: "Abbrechen",
            onOk: doDelete,
        });
    };

    const doDelete = async () => {
        try {
            setDeleting(true);
            await publicPdfService.deletePublicPdf();
            setMeta(null);
            message.success("PDF gelöscht.");
        } catch (e: any) {
            message.error(e?.message || "Löschen fehlgeschlagen.");
        } finally {
            setDeleting(false);
        }
    };

    const publicUrl = absUrl(meta?.publicUrl) ?? null;

    // === Fix: PDF erst per HEAD prüfen, dann neuen Tab öffnen ===
    const openPdfSafely = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!publicUrl) return;
        e.preventDefault();
        try {
            const res = await fetch(publicUrl, { method: "HEAD" });
            if (res.ok) {
                window.open(publicUrl, "_blank", "noopener,noreferrer");
            } else {
                message.error("Das PDF konnte nicht geladen werden. Bitte laden Sie die Seite neu.");
            }
        } catch {
            message.error("Das PDF konnte nicht geladen werden. Bitte laden Sie die Seite neu.");
        }
    };

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>
                        Öffentliches PDF
                    </Title>
                </Col>
            </Row>

            <Dragger
                multiple={false}
                accept="application/pdf"
                showUploadList={false}
                beforeUpload={beforeSelect}
                disabled={uploading || deleting}
                style={{ padding: 16 }}
            >
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">PDF hierher ziehen oder klicken, um eine Datei auszuwählen</p>
                <p className="ant-upload-hint">Die Datei wird erst nach Klick auf „Hochladen“ veröffentlicht.</p>
            </Dragger>

            {selectedFile && (
                <Card style={{ marginTop: 16 }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Text>
                                Ausgewählt: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </Text>
                        </Col>
                        <Col>
                            <Space>
                                <Button icon={<DeleteOutlined />} onClick={clearSelection} disabled={uploading || deleting}>
                                    Auswahl verwerfen
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<UploadOutlined />}
                                    onClick={handleUpload}
                                    loading={uploading}
                                    disabled={deleting}
                                >
                                    Hochladen
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )}

            {publicUrl && (
                <Card style={{ marginTop: 16 }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space direction="vertical" size={4}>
                                <Text>Aktuell veröffentlichte Datei:</Text>
                                <a href={publicUrl} target="_blank" rel="noopener noreferrer" onClick={openPdfSafely}>
                                    <LinkOutlined /> PDF öffnen / herunterladen
                                </a>
                            </Space>
                        </Col>
                        <Col>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={confirmDelete}
                                loading={deleting}
                                disabled={uploading}
                            >
                                Datei löschen
                            </Button>
                        </Col>
                    </Row>
                </Card>
            )}
        </div>
    );
}