import { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type ProtectedRouteProps = {
    element: JSX.Element;
    requiredRole?: "ADMIN" | "USER" | "MODERATOR";
    requiredPermission?: string; // z. B. "users.read"
};

export default function ProtectedRoute({
                                           element,
                                           requiredRole,
                                           requiredPermission,
                                       }: ProtectedRouteProps) {
    const { isAuthenticated, user, permissions, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div style={{ padding: 24 }}>Authentifizierung wird geladen…</div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (requiredPermission && !permissions.includes(requiredPermission)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return element;
}
