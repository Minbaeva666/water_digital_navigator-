import { Col, Row, Spin, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyAndHandleEmail } from "../../../services/registration/registerTokenService.ts";

const { Title } = Typography;

const VerifyEmailPage: React.FC = () => {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "expired"
  >("loading");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();
  const fetched = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (fetched.current) return;
      fetched.current = true;

      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) {
        setStatus("error");
        setMessage("Kein Token vorhanden.");
        setLoading(false);
        return;
      }

      verifyAndHandleEmail(token).then(({ status, message }) => {
        setStatus(status);
        setMessage(message);
        setLoading(false);
      });
    };

    verify();
  }, [navigate]);

  if (loading) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: "100%" }}>
        <Spin tip="Schließe Registerung ab..." size="large">
          <div style={{ minHeight: 100, padding: "6rem" }}></div>
        </Spin>
      </Row>
    );
  }

  if (status === "success") {
    return (
      <Row justify="center" align="middle" style={{ minHeight: "100%" }}>
        <Col
          xs={20}
          sm={32}
          md={24}
          lg={8}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <i
            className="bi bi-check-lg"
            style={{ fontSize: "64px", color: "#2962FA" }}
          ></i>
          <Title level={3} style={{ textAlign: "center" }}>
            Sie haben sich erfolgreich registriert!
          </Title>
          <Title level={4} style={{ textAlign: "center" }}>
            Sie können sich nun mit Ihrer E-Mail und Passwort anmelden.
          </Title>
        </Col>
      </Row>
    );
  }

  if (status === "expired") {
    return (
      <Row justify="center" align="middle" style={{ minHeight: "100%" }}>
        <Col
          xs={20}
          sm={32}
          md={24}
          lg={8}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <i
            className="bi bi-envelope-check"
            style={{ fontSize: "64px", color: "#2962FA" }}
          ></i>
          <Title level={3} style={{ textAlign: "center" }}>
            Validierungs-Token abgelaufen.
          </Title>
          <Title level={4} style={{ textAlign: "center" }}>
            Der Token für die Validierung ihrer Email-Adresse ist leider
            abgelaufen. Kontaktieren sie einen Admin.
          </Title>
        </Col>
      </Row>
    );
  }

  if (status === "error") {
    return (
      <Row justify="center" align="middle" style={{ minHeight: "100%" }}>
        <Col
          xs={20}
          sm={32}
          md={24}
          lg={8}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <i
            className="bi bi-envelope-check"
            style={{ fontSize: "64px", color: "#2962FA" }}
          ></i>
          <Title level={3} style={{ textAlign: "center" }}>
            Verifizierung Ihre Email-Adresse nicht möglich.
          </Title>
          <Title level={4} style={{ textAlign: "center" }}>
            {message}
          </Title>
        </Col>
      </Row>
    );
  }
};

export default VerifyEmailPage;
