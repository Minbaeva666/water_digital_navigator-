import React from "react";
import {Row, Col, Typography, Space} from "antd";
import {useNavigate} from "react-router-dom";
import "./DigitalSolutionSelection.css";

const {Title, Paragraph} = Typography;

const DigitalSolutionSelection: React.FC = () => {
    const navigate = useNavigate();

    const handlePDFClick = () => {
        navigate("/create-digital-solution/pdf");
    };

    return (
        <section className="page-fill page-center">
            <Row justify="center" style={{ width: "100%" }}>
                <Col xs={24} sm={18} md={18} lg={12} xl={12} xxl={8}>
                    <div
                        style={{
                            padding: "2rem",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            background: "#fff",
                            textAlign: "center",
                        }}
                    >
                        <Title level={1}>Digitale Lösung/Projekt einreichen</Title>
                        <Paragraph>
                            Wir laden Sie und Ihre Kolleg:innen herzlich ein, uns Einblick in Ihre
                            Digitalisierungsaktivitäten zu geben und diese einem breiten Publikum
                            zugänglich zu machen.
                        </Paragraph>

                        <Space
                            direction="vertical"
                            size="large"
                            style={{width: "100%", alignItems: "center"}}
                        >
                            <div className="custom-button" onClick={handlePDFClick}>
                                <i className="bi bi-file-earmark-pdf-fill icon"/>
                                <div className="text">
                                    Digitale Lösung mit PDF-Steckbrief hochladen
                                    <br/>
                                    <small>
                                        (Ihr benötigtes Benutzerkonto wird in diesem Fall von der
                                        Administration für Sie eingerichtet)
                                    </small>
                                </div>
                                <i className="bi bi-arrow-right icon"/>
                            </div>
                        </Space>
                    </div>
                </Col>
            </Row>
        </section>
    );
};

export default DigitalSolutionSelection;
