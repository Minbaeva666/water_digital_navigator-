import React from 'react';
import {Row, Col, Typography, Button, Space} from 'antd';

const {Title, Text} = Typography;

interface PasswordResetSuccessProps {
    successMessage: string; // Erfolgsnachricht, die von der übergeordneten Komponente übergeben wird
}

const PasswordResetSuccessComponent: React.FC<PasswordResetSuccessProps> = ({successMessage}) => {
    return (
        <Row justify="center" align="middle" style={{minHeight: '100%'}}>
            <Col
                xs={20}
                sm={32}
                md={24}
                lg={8}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <i className="bi bi-shield-check" style={{fontSize: '64px', color: '#2962FA'}}></i>
                <Space direction="vertical" size="middle" style={{width: "100%"}} align="center">
                    <Title level={3}>Passwort erfolgreich geändert!</Title>
                    <Text>{successMessage}</Text>
                    <Col style={{display: "flex", justifyContent: "center", width: "100%"}}>
                        <Button type="primary" href="/login" size="large" style={{width: "100%", maxWidth: "300px"}}>
                            Jetzt anmelden
                        </Button>
                    </Col>

                </Space>

            </Col>
        </Row>
    );
};

export default PasswordResetSuccessComponent;