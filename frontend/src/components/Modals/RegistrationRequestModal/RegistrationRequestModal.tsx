import React from "react";
import {Modal, Button, Typography, Row, Col} from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";

const { Title, Text } = Typography;

interface ModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RegistrationRequestModal: React.FC<ModalProps> = ({ isModalOpen, setIsModalOpen }) => {
    const handleOk = () => {
        setIsModalOpen(false);
        window.location.href = "/login";
    };

    return (
        <Modal
            open={isModalOpen}
            closable={false}
            onCancel={() => setIsModalOpen(false)}
            width={{
                xs: '90%',
                sm: '80%',
                md: '70%',
                lg: '60%',
                xl: '50%',
                xxl: '40%',
            }}
            footer={[
                <div key="login-button-container" style={{ textAlign: "center", paddingBottom: 20 }}>
                    <Button key="login" type="primary" onClick={handleOk}>
                        Zurück zum Login
                    </Button>
                </div>
            ]}
            centered
            maskClosable={false}
        >
            <div style={{ textAlign: "center", paddingBottom: 40 }}>
                <CheckCircleTwoTone twoToneColor="#2f54eb" style={{ fontSize: "64px", marginBottom: 16 }} />
                <Row justify="center">
                    <Col>
                        <Title level={3}> Ihre Daten wurden erfolgreich gesendet. Vielen Dank für Ihre Registrierung!</Title>
                        <Title level={4}> Sie werden bald eine Bestätigungs-Email erhalten.</Title>
                        <Text>
                            Um Ihr Benutzerkonto zu aktivieren, folgen Sie bitte der Anleitung in der Bestätigungs-Mail.
                        </Text>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

export default RegistrationRequestModal;
