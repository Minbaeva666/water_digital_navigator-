import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../services/auth/axiosInstance";
import axiosBase from "../services/auth/axioBase";
import { Role } from "../types/constants/enums";

export interface NavigationItem { key: string; label: string; path?: string }
export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    organization?: { id: string; name: string } | null;
}
export interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    navigation: NavigationItem[];
    permissions: string[];
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<string | null>;
    logout: () => Promise<void>;
}

interface LoginResponse { token: string }
interface MeResponse { user: AuthUser; navigation: NavigationItem[]; permissions: string[] }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [navigation, setNavigation] = useState<NavigationItem[]>([]);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const boot = async () => {
            const stored = localStorage.getItem("accessToken");
            if (!stored) {
                setLoading(false);
                return;
            }

            setToken(stored);
            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${stored}`;

            try {
                const res = await axiosInstance.get<MeResponse>("/auth/me");
                setIsAuthenticated(true);
                setUser(res.data.user);
                setNavigation(res.data.navigation);
                setPermissions(res.data.permissions);
                setLoading(false);
            } catch {
                setToken(null);
                setIsAuthenticated(false);
                setUser(null);
                setNavigation([]);
                setPermissions([]);
                try { localStorage.removeItem("accessToken"); } catch {}
                delete axiosInstance.defaults.headers.common["Authorization"];
                setLoading(false);
            }
        };

        boot();

        const syncLogout = (event: StorageEvent) => {
            if (event.key === "logout") {
                setToken(null);
                setIsAuthenticated(false);
                setUser(null);
                setNavigation([]);
                setPermissions([]);
                try { localStorage.removeItem("accessToken"); } catch {}
                delete axiosInstance.defaults.headers.common["Authorization"];
            }
        };

        window.addEventListener("storage", syncLogout);
        return () => window.removeEventListener("storage", syncLogout);
    }, []);

    const login = async (email: string, password: string): Promise<string | null> => {
        try {
            const r = await axiosBase.post<LoginResponse>("/auth/login", { email, password });
            const { token } = r.data;

            localStorage.setItem("accessToken", token);
            setToken(token);
            setIsAuthenticated(true);
            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const me = await axiosInstance.get<MeResponse>("/auth/me");
            setUser(me.data.user);
            setNavigation(me.data.navigation);
            setPermissions(me.data.permissions);
            return me.data.user.firstName;
        } catch (error) {
            console.error("Login fehlgeschlagen:", error);
            return null;
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch { /* ignore */ }
        finally {
            try { localStorage.removeItem("accessToken"); } catch {}
            localStorage.setItem("logout", Date.now().toString());
            delete axiosInstance.defaults.headers.common["Authorization"];
            setToken(null);
            setUser(null);
            setNavigation([]);
            setIsAuthenticated(false);
            setPermissions([]);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, navigation, permissions, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth muss innerhalb von AuthProvider verwendet werden");
    return context;
};
