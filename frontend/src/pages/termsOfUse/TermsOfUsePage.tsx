// components/terms/TermsOfUsePage.tsx
import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Spin, Alert } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link as RouterLink } from "react-router-dom";

import "./TermsOfUsePage.less";
import type { TermsOfUseDto } from "../../types/dtos/TermsOfUseDto";
import { termsService } from "../../services/appOptionService/appOptionService";

const { Title, Paragraph, Text } = Typography;

const TermsOfUsePage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [terms, setTerms] = useState<TermsOfUseDto | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await termsService.fetchTermsOfUse();
                if (!alive) return;
                setTerms(data ?? null);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.message ?? "Nutzungsbedingungen konnten nicht geladen werden.");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const updatedAt =
        terms?.updatedAt ? new Date(terms.updatedAt).toLocaleDateString() : undefined;

    return (
        <div className="terms-of-use-page">
            <Row justify="center">
                <Col xs={24} md={22} lg={16} xl={14}>
                    <Title level={2} style={{ marginTop: 8 }}>
                        Nutzungsbedingungen
                    </Title>
                    {updatedAt && (
                        <Paragraph type="secondary" style={{ marginTop: -8 }}>
                            <Text>Letzte Aktualisierung: {updatedAt}</Text>
                        </Paragraph>
                    )}

                    {loading && (
                        <div style={{ textAlign: "center", padding: 24 }}>
                            <Spin size="large" />
                        </div>
                    )}

                    {!loading && error && (
                        <Alert type="error" showIcon message="Fehler" description={error} />
                    )}

                    {!loading && !error && (!terms || !terms.content?.trim()) && (
                        <Alert
                            type="info"
                            showIcon
                            message="Keine Nutzungsbedingungen vorhanden"
                            description="Aktuell sind noch keine Nutzungsbedingungen hinterlegt."
                        />
                    )}

                    {!loading && !error && terms?.content?.trim() && (
                        <div className="terms-content">
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
                                            // Interne Route (SPA)
                                            return <RouterLink to={href}>{children}</RouterLink>;
                                        }
                                        // Externe Links – neuer Tab
                                        return (
                                            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                                                {children}
                                            </a>
                                        );
                                    },
                                }}
                            >
                                {terms.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default TermsOfUsePage;
