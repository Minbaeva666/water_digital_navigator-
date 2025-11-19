import React, { ReactNode } from "react";
import { Layout } from "antd";
import "./MainLayout.css";

const { Content } = Layout;

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <Layout style={{ flex: 1, display: 'flex', justifyContent: 'center', height: "100%" }}>
            <Content
                style={{
                    padding: 24,
                    background: "#fff",
                    borderRadius: 8,
                    width: "100%",
                    height: "100%",
                    flexDirection: "column",
                }}
            >
                {children}
            </Content>
        </Layout>
    );
};

export default MainLayout;