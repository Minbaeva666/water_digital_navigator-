import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import {JSX} from "react";

const GuestRoute = ({ element }: { element: JSX.Element }) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return element;
};

export default GuestRoute;
