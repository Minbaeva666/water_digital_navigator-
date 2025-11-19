import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export function generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function generateRevokeToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function getTokenExpiration(hours = 168): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
}