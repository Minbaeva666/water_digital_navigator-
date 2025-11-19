import axiosBase from "../auth/axioBase.ts";

type VerificationStatus = "success" | "expired" | "error";

interface VerifyResult {
    status: VerificationStatus;
    message: string;
}

export const validateRegistrationToken = async (token: string): Promise<boolean> => {
    try {
        const res = await axiosBase.get("/register/validate-registration-successful", {
            params: { token },
        });

        return res.data.valid === true;
    } catch (err) {
        console.error("Token-Validierung fehlgeschlagen", err);
        return false;
    }
};


export const revokeRegistration = async (token: string): Promise<boolean> => {
    try {
        const res = await axiosBase.get("/register/revoke-registration", {params: { token },});
        return res.data.success === true;
    } catch (error) {
        console.error("Fehler beim Widerrufen der Registrierung:", error);
        return false;
    }
};

export const verifyAndHandleEmail = async (token: string): Promise<VerifyResult> => {
    if (!token) {
        return {
            status: "error",
            message: "Kein Token vorhanden.",
        };
    }

    try {
        const res = await axiosBase.get("/register/verify-email", {
            params: { token },
        });

        const data = res.data;

        if (data.success) {
            return {
                status: "success",
                message: "E-Mail erfolgreich bestätigt!",
            };
        } else {
            return {
                status: data.reason === "expired" ? "expired" : "error",
                message: data.error || "Verifizierung fehlgeschlagen.",
            };
        }
    } catch (error) {
        console.error("Verifizierungsfehler:", error);
        return {
            status: "error",
            message: "Ein Fehler ist aufgetreten.",
        };
    }
};
