function getFrontendPrefix(): string {
    const base = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    // Only use FRONTEND_CONTEXT when it is explicitly set. This avoids
    // forcing a "/dilowa" suffix in development. If set, normalize it to
    // a leading path segment without trailing slash (e.g. "/dilowa").
    const rawContext = process.env.FRONTEND_CONTEXT;
    const ctx = rawContext
        ? rawContext.startsWith("/")
            ? rawContext.replace(/\/$/, "")
            : `/${rawContext.replace(/\/$/, "")}`
        : "";

    if (!ctx) return base;
    return base.endsWith(ctx) ? base : base + ctx;
}

export function buildFrontendUrl(path: string): string {
    const prefix = getFrontendPrefix();
    // Ensure exactly one slash between prefix and path
    const p = path.startsWith("/") ? path.slice(1) : path;
    return `${prefix}/${p}`;
}

export function buildVerificationLink(token: string): string {
    return buildFrontendUrl(`/verify-email?token=${token}`);
}

export function buildRevokeLink(token: string): string {
    return buildFrontendUrl(`/revoke-registration?token=${token}`);
}