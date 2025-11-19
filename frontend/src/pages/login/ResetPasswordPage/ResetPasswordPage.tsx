import React, { useState } from "react";
import { App, Button, Col, Form, Input, Row, Typography } from "antd";
import { useLocation } from "react-router-dom";
import "./ResetPasswordPage.css";
import PasswordResetSuccessComponent from "../../../components/PasswordResetSuccessComponent/PasswortResetSuccessComponent.tsx";
import { resetPassword } from "../../../services/auth/authService.ts";

const { Title, Paragraph } = Typography;

const ResetPasswordPage: React.FC = () => {
    const location = useLocation();
    const { message } = App.useApp();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

    const onFinish = async (values: { password: string; confirmPassword: string }) => {
        if (!token) {
            message.error("Token fehlt! Kann das Passwort nicht zurücksetzen.");
            return;
        }

        try {
            const response = await resetPassword(token, values.password);
            message.success(response);
            setPasswordResetSuccess(true);
        } catch (error: any) {
            console.error("Fehler beim Zurücksetzen des Passworts:", error);
            message.error(error?.message);
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.warn("Fehlgeschlagen:", errorInfo);
    };

    if (passwordResetSuccess) {
        return (
            <PasswordResetSuccessComponent successMessage="Du kannst dich nun mit deinem neuen Passwort anmelden." />
        );
    }

    return (
        <Row justify="center" align="middle" style={{ minHeight: "100vh", padding: "2rem" }}>
            <Col
                xs={24}
                sm={16}
                md={12}
                lg={8}
                style={{
                    maxWidth: "500px",
                    textAlign: "center",
                    padding: "2rem",
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
            >
                <Title level={3}>Passwort zurücksetzen</Title>
                <Paragraph>Gib ein neues Passwort für deinen Account ein.</Paragraph>

                <Form
                    name="resetPassword"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    style={{ width: "100%" }}
                >
                    <Form.Item
                        name="password"
                        label="Neues Passwort"
                        rules={[{ required: true, message: "Bitte geben Sie ein Passwort ein!" }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Neues Passwort wiederholen"
                        dependencies={["password"]}
                        hasFeedback
                        validateTrigger={["onChange", "onBlur"]}
                        rules={[
                            { required: true, message: "Bitte wiederholen Sie Ihr Passwort!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Passwörter stimmen nicht überein!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" style={{ width: "100%" }}>
                            Passwort speichern
                        </Button>
                    </Form.Item>
                </Form>
            </Col>
        </Row>
    );
};

export default ResetPasswordPage;
