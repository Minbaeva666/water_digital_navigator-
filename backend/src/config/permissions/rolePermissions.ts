import {ResourceAction} from "./permissonTypes";

export type Role = "ADMIN" | "MODERATOR" | "USER";

export type RolePermissionMap = {
    [resource: string]: {
        [action in ResourceAction]: boolean | { own: boolean; others: boolean };
    };
};

export const ROLE_PERMISSIONS: Record<'ADMIN' | 'MODERATOR' | 'USER', RolePermissionMap> = {
    ADMIN: {
        user: {
            create: true,
            read: true,
            edit: { own: true, others: true },
            delete: { own: true, others: true },
        },
        organization: {
            create: true,
            read: true,
            edit: { own: true, others: true },
            delete: { own: true, others: true },
        },
        digital_solution: {
            create: true,
            read: true,
            edit: { own: true, others: true },
            delete: { own: true, others: true },
        },
        faq: {
            create: true,
            read: true,
            edit: true,
            delete: true,
        },
        termsOfUse: {
            create: true,
            read: true,
            edit: true,
            delete: true,
        },
        privacyPolicy: {
            create: true,
            read: true,
            edit: true,
            delete: true,
        },
        accessibilityStatement: {
            create: true,
            read: true,
            edit: true,
            delete: true,
        },
        imprintStatement: {
            create: true,
            read: true,
            edit: true,
            delete: true,
        },
        publicPdf: {
            create: true,
            read: true,
            edit: true,
            delete: true,
        },
    },

    MODERATOR: {
        user: {
            create: false,
            read: true,
            edit: { own: true, others: false },
            delete: { own: false, others: false },
        },
        organization: {
            create: false,
            read: true,
            edit: { own: false, others: false },
            delete: { own: false, others: false },
        },
        digital_solution: {
            create: false,
            read: true,
            edit: { own: false, others: false },
            delete: { own: false, others: false },
        },
        faq: {
            create: true,
            read: true,
            edit: true,
            delete: true,
        },
        termsOfUse: {
            create: true,
            read: true,
            edit: true,
            delete: true,
        },
        privacyPolicy: {
            create: true,
            read: true,
            edit: true,
            delete: true,
        },
        accessibilityStatement: {
            create: true,
            read: true,
            edit: true,
            delete: true,
        },
        imprintStatement: {
            create: true,
            read: true,
            edit: true,
            delete: true,
        },
        publicPdf: {
            create: true,
            read: true,
            edit: true,
            delete: true,
        },
    },

    USER: {
        user: {
            create: false,
            read: true,
            edit: { own: true, others: false },
            delete: { own: false, others: false },
        },
        organization: {
            create: false,
            read: true,
            edit: { own: false, others: false },
            delete: { own: false, others: false },
        },
        digital_solution: {
            create: true,
            read: true,
            edit: { own: true, others: false },
            delete: { own: true, others: false },
        },
        solution_category: {
            create: false,
            read: true,
            edit: { own: false, others: false },
            delete: { own: false, others: false },
        },
        faq: {
            create: false,
            read: true,
            edit: false,
            delete: false,
        },
        termsOfUse: {
            create: false,
            read: true,
            edit: false,
            delete: false,
        },
        privacyPolicy: {
            create: false,
            read: true,
            edit: false,
            delete: false,
        },
        accessibilityStatement: {
            create: false,
            read: true,
            edit: false,
            delete: false,
        },
        imprintStatement: {
            create: false,
            read: true,
            edit: false,
            delete: false,
        },
        publicPdf: {
            create: false,
            read: true,
            edit: false,
            delete: false,
        },
    },
};
