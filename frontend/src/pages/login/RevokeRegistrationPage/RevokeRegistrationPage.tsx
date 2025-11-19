import { Col, Row, Typography } from "antd";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {revokeRegistration} from "../../../services/registration/registerTokenService.ts";

const { Title, Text } = Typography;

const RevokeRegistrationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
    const fetched = useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token || fetched.current) return;
        fetched.current = true;

        revokeRegistration(token)
            .then((success) => setIsSuccess(success))
            .catch(() => setIsSuccess(false));

    }, [location, navigate]);

    if (isSuccess === null) {
        return <p>Registrierung wird zurückgezogen...</p>;
    }

    return (
        <Row justify="center" align="middle" style={{ minHeight: '100%' }}>
            <Col
                xs={20}
                sm={16}
                md={12}
                lg={8}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
            >
                <i className="bi bi-envelope-check" style={{ fontSize: "64px", color: "#2962FA" }}></i>
                <Title level={3} style={{ textAlign: 'center' }}>
                    {isSuccess
                        ? "Ihre Registrierung wurde erfolgreich zurückgezogen!"
                        : "Die Registrierung konnte nicht zurückgezogen werden."}
                </Title>
                <Text style={{ textAlign: 'center' }}>
                    {isSuccess
                        ? "Ihre Registrierung und die zugehörigen Daten wurden aus unserem System entfernt."
                        : "Der Widerruf ist fehlgeschlagen oder der Link ist nicht mehr gültig."}
                </Text>
            </Col>
        </Row>
    );
};

export default RevokeRegistrationPage;
