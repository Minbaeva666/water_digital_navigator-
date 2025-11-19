// src/pages/login/LoginPage/LoginPage.tsx
import { Button, Col, Form, FormProps, Input, message, Row, Typography } from "antd";
import "./LoginPage.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const { Title, Paragraph, Text } = Typography;

type FieldType = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();

  // Sicheres Auslesen der "from"-Route (Fallback: "/")
  const state = location.state as
    | { from?: { pathname?: string; search?: string; hash?: string } }
    | undefined;

  const fromPath =
    state?.from?.pathname
      ? `${state.from.pathname}${state.from.search ?? ""}${state.from.hash ?? ""}`
      : "/";

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const firstName = await login(values.email, values.password);
    if (firstName) {
      messageApi.success(`Willkommen zurück, ${firstName}!`);
      // Immer absolut und mit Fallback navigieren
      navigate(fromPath.startsWith("/") ? fromPath : "/", { replace: true });
    } else {
      messageApi.error("Login fehlgeschlagen");
    }
  };

  return (
    <Row justify="center" align="middle">
      <Col
        xs={24}
        sm={16}
        md={8}
        lg={10}
        xl={8}
        xxl={6}
        style={{
          textAlign: "center",
          padding: "2rem",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Title level={3}>Willkommen!</Title>
        <Paragraph>Gib deine E-Mail und dein Passwort ein, um dich anzumelden.</Paragraph>

        {contextHolder}
        <Form
          name="basic"
          style={{ width: "100%" }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item<FieldType>
            label="E-Mail"
            name="email"
            rules={[{ required: true, message: "Bitte E-Mail angeben" }]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item<FieldType>
            label="Passwort"
            name="password"
            rules={[{ required: true, message: "Bitte Passwort eingeben" }]}
          >
            <Input.Password placeholder="Passwort" size="large" />
          </Form.Item>

          {/*forgot-password*/}
          <Row justify="start" style={{ marginBottom: 16 }}>
            <Col>
              <Link to="/login/forgot-password">Passwort vergessen?</Link>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" style={{ width: "100%" }}>
              Anmelden
            </Button>
          </Form.Item>

          {/* Блок приглашения к регистрации */}
          <Row justify="center">
            <Col>
              <Text type="secondary">
                Noch kein Konto?{" "}
                <Link to="/login/registration">Jetzt registrieren</Link>
              </Text>
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
  );
};

export default LoginPage;
