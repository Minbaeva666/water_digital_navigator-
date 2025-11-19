import {App, Button, Col, Form, Input, Row, Typography} from "antd";
import "./ForgotPasswordRequestPage.css";
import {useState} from "react";
import {requestPasswordReset} from "../../../services/auth/authService.ts";
const {Title, Paragraph} = Typography;

type FieldType = {
    email: string;
};

const ForgotPasswordRequestPage = () => {
    const { message} = App.useApp();
    const [email, setEmail] = useState('');
    const [fetch, setFetch] = useState<boolean>(false);

    const onFinish = async (values: FieldType) => {
        setFetch(false);

        try {
            const messageText = await requestPasswordReset(values.email);
            message.success(messageText);
            setFetch(true);
        } catch (error: any) {
            message.error(error.message);
        }
    };

    if(!fetch){
        return (
            <Row justify="center" align="middle" style={{minHeight: "100%"}}>
                <Col xs={24} sm={16} md={12} lg={8} style={{
                    maxWidth: "500px",
                    textAlign: "center",
                    padding: "2rem",
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                }}>

                    <Title level={3}>Passwort vergessen?</Title>
                    <Paragraph>Gebe die Email-Adresse deines Accountes ein, damit wir dir eine Email zum Zurücksetzten deines Passwort senden können. </Paragraph>

                    <Form
                        name="password-reset"
                        style={{ width: "100%" }}
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                {
                                    required: true,
                                    type: "email",
                                    message: "Bitte eine gültige E-Mail angeben.",
                                },
                            ]}
                        >
                            <Input
                                placeholder="Bitte E-Mail-Adresse eingeben"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                style={{ width: "100%" }}
                            >
                                Passwort zurücksetzen
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        );
    } else {
        return (
            <Row justify="center" align="middle" style={{minHeight: "100%"}}>
                <Col xs={24} sm={16} md={12} lg={8} style={{
                    maxWidth: "500px",
                    textAlign: "center",
                    padding: "2rem",
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                }}>
                    <i className="bi bi-envelope-check" style={{ fontSize: "64px", color: "#2962FA" }}></i>
                    <Title level={3}>Eine Email zum Ändern Ihres Passworts wurde versendet.</Title>
                    <Paragraph>Folgen Sie den Anweisungen in der Email, um Ihr Passwort zu ändern.</Paragraph>
                </Col>
            </Row>
        );
    }

};

export default ForgotPasswordRequestPage;
