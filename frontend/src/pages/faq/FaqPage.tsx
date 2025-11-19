import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Collapse, Spin, Alert, Empty } from "antd";
import "./FaqPage.less";

// Service & Types
import { faqService } from "../../services/appOptionService/appOptionService";
import type { FaqDto } from "../../types/dtos/FaqDto";

// Markdown Rendering
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link as RouterLink } from "react-router-dom";

const { Title, Paragraph } = Typography;

type UiItem = { id: string; header: string; content: string; sort: number };

const FaqPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<UiItem[]>([]);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data: FaqDto | undefined = await faqService.fetchFaq();

                if (!alive) return;

                if (data?.items?.length) {
                    const mapped = [...data.items]
                        .sort((a, b) => a.sort - b.sort)
                        .map((it) => ({
                            id: it.id,
                            header: it.header,
                            content: it.content,
                            sort: it.sort,
                        }));
                    setItems(mapped);
                } else {
                    setItems([]);
                }
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message ?? "FAQ konnte nicht geladen werden.");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    return (
        <div className="faq-page">
            <Row justify="center">
                <Col xs={24} sm={22} md={20} lg={16} xl={14}>
                    <Title level={2} style={{ marginTop: 8 }}>
                        Häufige Fragen (FAQ)
                    </Title>
                    <Paragraph type="secondary" style={{ marginTop: -8, marginBottom: 16 }}>
                        Antworten rund um das Portal Digital.Lotse.Wasser.
                    </Paragraph>

                    {loading && (
                        <div style={{ textAlign: "center", padding: 24 }}>
                            <Spin size="large" />
                        </div>
                    )}

                    {!loading && error && (
                        <Alert type="error" showIcon message="Fehler" description={error} />
                    )}

                    {!loading && !error && items.length === 0 && (
                        <Empty
                            description="Aktuell sind keine FAQ-Einträge verfügbar."
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            style={{ marginTop: 24 }}
                        />
                    )}

                    {!loading && !error && items.length > 0 && (
                        <Collapse>
                            {items.map((it) => (
                                <Collapse.Panel key={it.id} header={it.header}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ node, ...props }) => (
                                                <Paragraph style={{ marginBottom: 8 }} {...props} />
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
                                                    // interne Route via SPA
                                                    return <RouterLink to={href}>{children}</RouterLink>;
                                                }
                                                // externe Links in neuem Tab
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
                            ))}
                        </Collapse>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default FaqPage;
