import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const axiosBase = axios.create({
    withCredentials: true,
    baseURL: backendUrl,
});

export default axiosBase;