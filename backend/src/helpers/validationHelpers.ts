import { BadRequestError } from '../errors/BadRequestError';
import {NotFoundError} from "../errors/NotFoundError";
import {User} from "@prisma/client";

export function assertValidToken(token: unknown): asserts token is string {
    if (!token || typeof token !== 'string') {
        throw new BadRequestError('Token is missing or invalid');
    }
}

export function assertTokenHasUser(token: any): asserts token is { user: any } {
    if (!token || !token.user) {
        throw new NotFoundError('Token is invalid or already used');
    }
}

export function assertTokenNotExpired(expiresAt: Date): void {
    if (new Date(expiresAt) < new Date()) {
        throw new BadRequestError('Token has expired');
    }
}

export function assertUserRevocationPossible(user: Pick<User, 'accountState'>): void {
    if (user.accountState !== 'VERIFY_EMAIL') {
        throw new BadRequestError('Revocation is no longer possible');
    }
}