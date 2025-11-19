export function buildVerificationLink(token: string): string {
    return `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
}

export function buildRevokeLink(token: string): string {
    return `${process.env.FRONTEND_URL}/revoke-registration?token=${token}`;
}