import { Col, Row, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import "./RegistrationPage.css";

const { Title, Paragraph } = Typography;

const RegistrationPage = () => {
    const navigate = useNavigate();

    return (
        <Row justify="center" align="middle" style={{ height: "100%", padding: "0 2rem" }}>
            <Col xs={24} sm={20} md={16} lg={12} style={{ textAlign: "center", padding: "2rem", background: "#fff" }}>
                <Title level={3}>Registrierung</Title>
                <Paragraph>
                    Wählen Sie aus, ob Sie sich als Privatperson oder Vertreter einer Organisation registrieren möchten.
                </Paragraph>

                <Row gutter={[20, 20]} justify="center" style={{ display: "flex" }}>
                    {/* 🔹 Registrierung als Privatperson */}
                    <Col xs={24} sm={12} style={{ display: "flex" }}>
                        <div
                            className="register-box"
                            onClick={() => navigate("/login/registration/register-as-private-person")}
                        >
                            Als Privatperson registrieren
                        </div>
                    </Col>

                    {/* 🔹 Registrierung als Vertreter */}
                    <Col xs={24} sm={12} style={{ display: "flex" }}>
                        <div
                            className="register-box"
                            onClick={() => navigate("/login/registration/register-as-representative")}
                        >
                            Als Vertreter registrieren
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

export default RegistrationPage;
