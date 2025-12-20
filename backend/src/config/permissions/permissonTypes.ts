// 1) Alle CRUD‐Aktionen
export type CRUDAction = "create" | "read" | "edit" | "delete";

// 2) Definiere, welche Ressourcen es gibt
export type Resource = "users" | "organizations" | "digital_solution" | "solution_category" | "expert_video" | "faq" | "termsOfUse" | "privacyPolicy" | "accessibilityStatement" | "imprintStatement" | "publicPdf";

// 3) Action ist dasselbe wie CRUDAction (für die Combos)
export type Action = CRUDAction;

export type ResourceAction = "create" | "read" | "edit" | "delete";

// 5) Für „own/others“-Berechtigungen
export type OwnOthersPermission = {
    own: boolean;
    others: boolean;
};

// 6) Einfache Permission: entweder Boolean oder Own/Others‐Objekt
export type SimplePermission = boolean | OwnOthersPermission;

// 7) Alias für dasselbe wie SimplePermission
export type PermissionValue = SimplePermission;

// 8) Wie sehen die CRUD‐Permissions für eine einzelne Resource aus?
export type CRUDPermission = {
    create?: boolean;
    read?: boolean;
    edit?: PermissionValue;
    delete?: PermissionValue;
};


// 10) Rollen‐Typ
export type Role = "ADMIN" | "MODERATOR" | "USER";