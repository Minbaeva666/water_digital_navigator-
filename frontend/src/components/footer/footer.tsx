// src/components/footer/AppFooter.tsx
import React from 'react';
import { Layout, Space, Typography, Grid, Button } from 'antd';
import { NavLink } from 'react-router-dom';
import './footer.less';

const { Footer } = Layout;
const { useBreakpoint } = Grid;

const AppFooter: React.FC = () => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const handleCookieSettings = () => {
        if (window.openCookieSettings) {
            window.openCookieSettings();
        }
    };

    return (
        <Footer className="app-footer" role="contentinfo" aria-label="Fußbereich mit rechtlichen Informationen">
            <nav className="footer-nav" aria-label="Rechtliche Links">
                <Space size={isMobile ? 12 : 20} wrap aria-label="Primäre Footer-Navigation">
                    <NavLink to="/impressum" className="footer-link">Impressum</NavLink>
                    <NavLink to="/datenschutz" className="footer-link">Datenschutz</NavLink>
                    <NavLink to="/barrierefreiheit" className="footer-link">Barrierefreiheit</NavLink>
                    <NavLink to="/nutzungsbedingungen" className="footer-link">Nutzungsbedingungen</NavLink>
                    <NavLink to="/faq" className="footer-link">FAQ</NavLink>
                    <NavLink to="/kontakt" className="footer-link">Kontakt</NavLink>
                    <Button 
                        type="text" 
                        onClick={handleCookieSettings}
                        className="footer-link"
                        style={{ padding: 0, height: 'auto' }}
                    >
                        Cookie-Einstellungen
                    </Button>

                </Space>

                <Typography.Text className="footer-copy">
                    © {new Date().getFullYear()} Institut für nachhaltige Wassersysteme (inwa)
                </Typography.Text>
            </nav>
        </Footer>
    );
};

export default AppFooter;
