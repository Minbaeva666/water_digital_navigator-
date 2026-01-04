import React, { useEffect, useState } from "react";
import {
    Row,
    Col,
    Typography,
    Card,
    Spin,
    Alert,
    Space,
    Button,
    message,
} from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { Link as RouterLink } from "react-router-dom";
import type { PublicPdfDto } from "../../types/dtos/PublicPdfDto";
import { publicPdfService } from "../../services/publicPdfService/publicPdfService";

const { Title, Paragraph } = Typography;

function absUrl(urlOrPath?: string | null): string | null {
  if (!urlOrPath) return null;
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;

  const rawBase = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
  const base = rawBase.replace(/\/api$/, "");

  const path = urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;

  return `${base}${path}`;
}


const DigitalSolutionPdf: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState<PublicPdfDto | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await publicPdfService.fetchPublicPdf();
                if (!alive) return;
                console.log("PublicPdf from backend:", data);
                setMeta(data ?? null);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message ?? "PDF-Metadaten konnten nicht geladen werden.");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const pdfUrl = absUrl(meta?.publicUrl) ?? undefined;

    const openPdfSafely = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!pdfUrl) {
            message.error("Kein PDF verfügbar.");
            return;
        }
        try {
            const res = await fetch(pdfUrl, { method: "HEAD" });
            if (res.ok) {
                window.open(pdfUrl, "_blank", "noopener,noreferrer");
            } else {
                message.error("Das PDF konnte nicht geladen werden. Bitte laden Sie die Seite neu.");
            }
        } catch {
            message.error("Das PDF konnte nicht geladen werden. Bitte laden Sie die Seite neu.");
        }
    };


    return (
        <div>
            <Row justify="center" style={{ padding: "40px 16px" }}>
                <Col xs={24} sm={20} md={16} lg={12} xl={10}>
                    <Card style={{ padding: 24 }}>
                        <Title level={2}>Digitale Lösung als PDF einreichen</Title>

                        <Paragraph>
                            Wir bieten auch Beratung und Unterstützung beim Ausfüllen des Steckbriefs an. Auf Wunsch
                            können wir eine erste Version für Sie vorbereiten und zur Prüfung sowie Unterzeichnung
                            zusenden. Falls diese Option für Sie in Frage kommt, kontaktieren Sie uns bitte.
                        </Paragraph>

                        <Paragraph>
                            Um Ihre digitale Lösung per PDF einzureichen, sind nur wenige einfache Schritte notwendig:
                        </Paragraph>

                        <Title level={3}>1. Datenschutz und Nutzungsbedingungen</Title>
                        <Paragraph>
                            Bitte beachten Sie die{" "}
                            <RouterLink to="/datenschutz">Datenschutzerklärung</RouterLink>{" "}
                            und die{" "}
                            <RouterLink to="/nutzungsbedingungen">Nutzungsbedingungen</RouterLink>.
                        </Paragraph>

                        <Title level={3}>2. PDF-Steckbrief herunterladen</Title>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: 12 }}>
                                <Spin />
                            </div>
                        ) : error ? (
                            <Alert type="error" showIcon message="Fehler" description={error} />
                        ) : pdfUrl ? (
                            <>
                                <Paragraph>
                                    <Space>
                                        <FilePdfOutlined />
                                        <Button type="link" onClick={openPdfSafely}>
                                            PDF-Formular öffnen / herunterladen
                                        </Button>
                                    </Space>
                                </Paragraph>
                            </>
                        ) : (
                            <Alert
                                type="info"
                                showIcon
                                message="Kein PDF verfügbar"
                                description="Aktuell ist kein öffentliches PDF hinterlegt."
                            />
                        )}

                        <Title level={3}>3. Unterschreiben und senden</Title>
                        <Paragraph>
                            Die unterschriebene Version des Steckbriefs (z. B. eingescannte Kopie der Signaturseite)
                            bitte per E-Mail oder Post an uns senden.
                        </Paragraph>

                        <Title level={3}>4. Das Firmenlogo, Fotos und Bilder, die in der Beschreibung Ihrer digitalen Lösung enthalten sein sollen, sollten beigefügt werden</Title>
                        <Paragraph>
                            Wir bieten auch Beratung und Unterstützung beim Ausfüllen des Steckbriefs an.  Wir können auch eine erste Version vorbereiten und den Steckbrief ausfüllen und ihn Ihnen dann zur Prüfung und Unterzeichnung zusenden. Falls diese Option für Sie am besten geeignet ist, bitten wir Sie ebenfalls, sich mit uns in Verbindung zu setzen.
                            Stehen Sie uns  bitte im Kontakt.
                        </Paragraph>

                        <Paragraph>
                            E-Mail:{" "}
                            <a href="mailto:diginax.portal@hof-university.de" style={{ color: "#1677ff" }}>
                                diginax.portal@hof-university.de
                            </a>
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DigitalSolutionPdf;