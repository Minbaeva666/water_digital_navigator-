import "./Header.less";
import logo from "../../../src/assets/Logo/Logo.svg";
import React, { useState, useEffect } from "react";
import { Layout, Dropdown, Menu, Drawer, Button, Typography } from "antd";
import { MenuOutlined, DownOutlined } from "@ant-design/icons";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {useAuth} from "../../context/AuthContext.tsx";


const { Header } = Layout;
const { Title } = Typography;

const AppHeader: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, navigation, logout } = useAuth();
    const location = useLocation();
    const isInAccountSection = location.pathname.startsWith("/admin");
    const isInCreateDigitalSolutionSection = location.pathname.startsWith("/create-digital-solution");

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 992);
            setMenuOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const renderMenuItems = (onClickCallback?: () => void) =>
        navigation.map((item) =>
            item.key === "logout" ? (
                <Menu.Item key={item.key} onClick={() => {
                    handleLogout();
                    onClickCallback?.();
                }}>
                    {item.label}
                </Menu.Item>
            ) : (
                <Menu.Item key={item.key}>
                    <NavLink to={item.path!} onClick={onClickCallback}>
                        {item.label}
                    </NavLink>
                </Menu.Item>
            )
        );

    return (
        <Header className="header">
            <div className="header-container">
                <NavLink to="/" className="logo-link">
                    <img src={logo} alt="Logo" className="logo" />
                </NavLink>

                {isMobile ? (
                    <>
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            className="menu-button"
                            size="large"
                            onClick={() => setMenuOpen(true)}
                        />

                        <Drawer
                            title={null}
                            placement="right"
                            closable={false}
                            onClose={() => setMenuOpen(false)}
                            open={menuOpen}
                            styles={{ body: { paddingTop: "48px" } }}
                            className="header-drawer"
                        >
                            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
                                <Button
                                    type="text"
                                    onClick={() => setMenuOpen(false)}
                                    style={{ fontSize: "18px" }}
                                >
                                    ✕
                                </Button>
                            </div>

                            <Menu style={{ borderInlineEnd: "none" }} mode="vertical" selectable={false}>
                                <Menu.ItemGroup key="lotse" title="Digital Lotse Wasser">
                                    <Menu.Item key="atlas">
                                        <NavLink to="/digital-atlas" onClick={() => setMenuOpen(false)}>
                                            Digital Atlas
                                        </NavLink>
                                    </Menu.Item>
                                    
                                    <Menu.Item key="submit">
                                        <NavLink to="/create-digital-solution" onClick={() => setMenuOpen(false)}>
                                            Digitale Lösung einreichen
                                        </NavLink>
                                    </Menu.Item>

                                    <Menu.Item key="expert-videos">
                                        <NavLink to="/expert-videos" onClick={() => setMenuOpen(false)}>
                                            Interviews/Videos
                                        </NavLink>
                                    </Menu.Item>
                                </Menu.ItemGroup>

                                <Menu.ItemGroup key="account" title="Account">
                                    {isAuthenticated ? (
                                        renderMenuItems(() => setMenuOpen(false))
                                    ) : (
                                        <Menu.Item key="login">
                                            <NavLink to="/login" onClick={() => setMenuOpen(false)}>
                                                Login
                                            </NavLink>
                                        </Menu.Item>
                                    )}
                                </Menu.ItemGroup>
                            </Menu>
                        </Drawer>
                    </>
                ) : (
                    <div className="nav-container">
                        <NavLink
                            to="/digital-atlas"
                            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                        >
                            <Title level={4}>Digital Atlas</Title>
                        </NavLink>
                        <NavLink
                            to="/create-digital-solution"
                            className={`nav-link ${isInCreateDigitalSolutionSection ? "active" : ""}`}
                        >
                            <Title level={4}>Digitale Lösung einreichen</Title>
                        </NavLink>

                        <NavLink
                            to="/expert-videos"
                            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                        >
                           <Title level={4}>Interviews/Videos</Title>
                        </NavLink>

                        {isAuthenticated ? (
                            <Dropdown
                                trigger={["click"]}
                                open={dropdownOpen}
                                onOpenChange={(open) => setDropdownOpen(open)}
                                placement="bottomRight"
                                overlayStyle={{ textAlign: "right" }}
                                popupRender={() => (
                                    <div className="custom-dropdown-menu">
                                        {navigation.map((item) => {
                                            const isActive = location.pathname.startsWith(item.path || "");

                                            if (item.key === "logout") {
                                                return (
                                                    <span
                                                        key={item.key}
                                                        className="dropdown-link logout-button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleLogout();
                                                            setDropdownOpen(false);     // ← schließt das Dropdown
                                                        }}
                                                    >
              <span className="dropdown-content">
                <span className="dropdown-text">{item.label}</span>
              </span>
            </span>
                                                );
                                            }

                                            return (
                                                <NavLink
                                                    key={item.key}
                                                    to={item.path!}
                                                    className={`dropdown-link${isActive ? " active" : ""}`}
                                                    onClick={() => setDropdownOpen(false)}  // ← schließt das Dropdown
                                                >
            <span className="dropdown-content">
              <span className={`bullet ${isActive ? "" : "invisible"}`} />
              <span className="dropdown-text">{item.label}</span>
            </span>
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                )}
                            >
                                <a
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDropdownOpen(!dropdownOpen);
                                    }}
                                    className={`nav-link ${isInAccountSection ? "active" : ""}`}
                                    style={{ display: "flex", alignItems: "center", gap: "4px" }}
                                >
                                    <Title level={4} style={{ margin: 0 }}>
                                        Account
                                    </Title>
                                    <DownOutlined style={{ fontSize: "16px" }} />
                                </a>
                            </Dropdown>
                        ) : (
                            <NavLink to="/login" className="nav-link">
                                <Title level={4}>Login</Title>
                            </NavLink>
                        )}
                    </div>
                )}
            </div>
        </Header>
    );
};

export default AppHeader;
