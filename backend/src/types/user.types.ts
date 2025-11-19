import { Prisma } from '@prisma/client';

/**
 * User inklusive zugehöriger Organization
 */
export type UserWithOrganization = Prisma.UserGetPayload<{
    include: {
        organization: true;
    };
}>;

export type User = Prisma.UserGetPayload<{
}>;

/**
 * User inklusive Tokens
 */
export type UserWithTokens = Prisma.UserGetPayload<{
    include: {
        tokens: true;
    };
}>;

/**
 * Vollständiger User inkl. Organization und Tokens
 */
export type FullUser = Prisma.UserGetPayload<{
    include: {
        organization: true;
        tokens: true;
    };
}>;

export type UserMinimalDto = {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    organizationId: string | null;
    organizationName: string | null; // <— neu
};
