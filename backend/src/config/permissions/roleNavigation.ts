import { Role } from './permissonTypes'; // z. B. 'ADMIN' | 'MODERATOR' | 'USER'

export type NavigationItem = {
    key: string;
    label: string;
    path: string;
    icon?: string;
};

export const ROLE_NAVIGATION: Record<Role, NavigationItem[]> = {
    ADMIN: [
        {
            key: 'user-management',
            label: 'User Management',
            path: '/admin/user-management',
        },
        {
            key: 'solution-management',
            label: 'Digitalen Lösungen Management',
            path: '/admin/digital-solution-management',
        },
        {
            key: 'organization-management',
            label: 'Organisationen Management',
            path: '/admin/organization-management',
        },
        {
            key: 'taxonomie-management',
            label: 'Taxonomie Management',
            path: '/admin/taxonomie-management',
        },
        {
            key: 'app-management',
            label: 'App Management',
            path: '/admin/app-management',
        },
        {
            key: "logout",
            label: "Abmelden",
            path: "login"
        },
    ],

    MODERATOR: [
        {
            key: 'solution-overview',
            label: 'Lösungen Übersicht',
            path: '/moderator/solutions',
        },
    ],

    USER: [
        {
            key: 'profile',
            label: 'Profil',
            path: '/profil',
        },
        {
            key: 'my-digital-solutions',
            label: 'Meine digitalen Lösungen',
            path: '/my-digital-solutions',
        },
        {
            key: 'digital-solutions',
            label: 'Digitalen Lösung',
            path: '/digital-solutions',
        },
        {
            key: "logout",
            label: "Abmelden",
            path: "login"
        },
    ],
};
