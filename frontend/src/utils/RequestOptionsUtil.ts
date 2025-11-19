import axiosInstance from "../services/auth/axiosInstance.ts";

export async function get<T>(
    url: string,
    options: { params?: any; signal?: AbortSignal } = {}
): Promise<T> {
    const { params, signal } = options;
    const { data } = await axiosInstance.get<T>(url, { params, signal });
    return data;
}