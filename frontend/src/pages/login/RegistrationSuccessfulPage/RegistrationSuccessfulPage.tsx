import { Col, Row, Typography } from "antd";
import 'bootstrap-icons/font/bootstrap-icons.css';
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {validateRegistrationToken} from "../../../services/registration/registerTokenService.ts";
const { Title, Text } = Typography;

const RegistrationSuccesfulPage = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const fetched = useRef(false); // Speichert, ob die Anfrage schon gemacht wurde

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token || fetched.current) return;
        fetched.current = true;

        validateRegistrationToken(token)
            .then((isValid) => {
                if (isValid) {
                    setIsValid(true);
                } else {
                    navigate("/", { replace: true });
                }
            })
            .catch((err) => {
                console.error("Fehler bei der Validierung:", err);
                navigate("/", { replace: true });
            });
    }, [location, navigate]);

    if (isValid === null) return <p>Registrierung wird zurückgezogen...</p>;
    if (!isValid) return null;


    return (
        <Row justify="center" align="middle" style={{ minHeight: '100%' }}>
            <Col xs={20} sm={32} md={24} lg={8} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <i className="bi bi-envelope-check" style={{ fontSize: "64px", color: "#2962FA" }}></i>
                <Title level={3} style={{ textAlign: 'center' }}>Sie haben sich erfolgreich registriert!</Title>
                <Text style={{ textAlign: 'center' }}>
                    <p>Sie haben sich erfolgreich registriert und können sich nun anmelden.</p>
                </Text>
            </Col>
        </Row>
    );
};

export default RegistrationSuccesfulPage;
