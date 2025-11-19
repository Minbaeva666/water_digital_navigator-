export const buildOrgLogoSrc = (org?: { logoBase64?: string | null; logoMimeType?: string | null }) => {
    if (!org?.logoBase64) return undefined;
    const mime = org.logoMimeType ?? detectMimeFromBase64(org.logoBase64);
    return `data:${mime};base64,${org.logoBase64}`;
};

export const detectMimeFromBase64 = (b64?: string | null) => {
    if (!b64) return undefined;
    if (b64.startsWith("/9j/")) return "image/jpeg";              // JPEG
    if (b64.startsWith("iVBORw0KGgo")) return "image/png";        // PNG
    if (b64.startsWith("PHN2Zy")) return "image/svg+xml";         // "<svg" base64
    return "image/jpeg"; // Fallback
};