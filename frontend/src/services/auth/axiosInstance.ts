import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import axiosBase from "./axioBase";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

// Eine Refresh-Operation gleichzeitig teilen
let refreshPromise: Promise<string> | null = null;
let hasRedirectedToLogin = false;

const redirectToLoginOnce = () => {
    if (hasRedirectedToLogin) return;
    hasRedirectedToLogin = true;
    try { localStorage.removeItem("accessToken"); } catch {}
    delete axiosInstance.defaults.headers.common["Authorization"];
    window.location.assign("/login");
};

const doRefresh = async (): Promise<string> => {
    const res = await axiosBase.post("/auth/refresh"); // withCredentials:true via axiosBase
    const body = res?.data as any;
    const newToken = body?.token ?? body?.accessToken;
    if (!newToken) throw new Error("no_access_token_in_refresh_response");
    return newToken as string;
};

// ~60s vor Ablauf proaktiv refreshen – aber NUR wenn ohnehin ein Request gesendet wird
const shouldRefreshSoon = (token: string, thresholdMs = 60_000): boolean => {
    try {
        const { exp } = jwtDecode<{ exp?: number }>(token);
        if (!exp) return false;
        return (exp * 1000 - Date.now()) < thresholdMs;
    } catch {
        return false;
    }
};

// --- REQUEST: Token anhängen + proaktiver Refresh kurz vor Ablauf ---
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const url = config?.url ?? "";
        const isAuthRoute = /\/auth\/(login|refresh)/.test(url);

        const token = localStorage.getItem("accessToken");
        config.headers = AxiosHeaders.from(config.headers);
        const headers = config.headers as AxiosHeaders;

        if (token && token !== "null" && token !== "undefined") {
            // Nur bei Nicht-Auth-Routen proaktiv refreshen
            if (!isAuthRoute && shouldRefreshSoon(token)) {
                try {
                    if (!refreshPromise) refreshPromise = doRefresh();
                    const newToken = await refreshPromise; refreshPromise = null;

                    localStorage.setItem("accessToken", newToken);
                    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
                    headers.set("Authorization", `Bearer ${newToken}`);
                    return config;
                } catch {
                    refreshPromise = null;
                    // Proaktiver Refresh fehlgeschlagen -> sofort Logout/Redirect
                    redirectToLoginOnce();
                    throw new axios.Cancel("proactive refresh failed");
                }
            }

            // normaler Fall: vorhandenes Token anhängen
            headers.set("Authorization", `Bearer ${token}`);
        } else {
            headers.delete("Authorization");
        }
        return config;
    }
);

// --- RESPONSE: 401 expired -> Refresh + Retry; terminal -> Login ---
const TERMINAL_401_REASONS = new Set([
    "no_token",
    "access_token_invalid",
    "access_token_invalid_payload",
    "user_not_found",
    "no_refresh_token",
    "refresh_token_expired",
    "refresh_token_invalid",
    "refresh_failed",
]);

axiosInstance.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
        const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        const status = error.response?.status ?? 0;
        const data = error.response?.data as any;
        const reason: string | undefined = data?.reason;
        const url = original?.url ?? "";
        const isAuthRoute = /\/auth\/(login|refresh)/.test(url);

        // Fallback: klassisch bei abgelaufenem Access-Token
        const canAttemptRefresh =
            status === 401 && reason === "access_token_expired" && !original?._retry && !isAuthRoute;

        if (canAttemptRefresh) {
            try {
                if (original) original._retry = true;
                if (!refreshPromise) refreshPromise = doRefresh();
                const newToken = await refreshPromise; refreshPromise = null;

                localStorage.setItem("accessToken", newToken);
                axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

                if (original) {
                    original.headers = AxiosHeaders.from(original.headers);
                    (original.headers as AxiosHeaders).set("Authorization", `Bearer ${newToken}`);
                    return axiosInstance(original);
                }
            } catch {
                refreshPromise = null;
                redirectToLoginOnce();
                throw error;
            }
        }

        // Terminale Auth-Fehler -> sofort Logout/Redirect
        const isTerminal = (status === 401 || status === 403) && TERMINAL_401_REASONS.has(reason ?? "");
        if (isTerminal && !isAuthRoute) {
            redirectToLoginOnce();
        }

        throw error;
    }
);

export default axiosInstance;
