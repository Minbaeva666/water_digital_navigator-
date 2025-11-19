import axiosBase from "./axioBase.ts";

export const requestPasswordReset = async (email: string): Promise<string> => {
    try {
        const res = await axiosBase.post("/user/reset-password-request", { email });
        return res.data.message;
    } catch (error: any) {
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error("Serverfehler oder Netzwerkproblem.");
    }
};

export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
    try {
        const res = await axiosBase.post("/user/reset-password", {token, newPassword,});
        return res.data.message;
    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "response" in error &&
            (error as any).response?.data?.error
        ) {
            throw new Error((error as any).response.data.error);
        }

        throw new Error("Serverfehler oder Netzwerkproblem.");
    }
};