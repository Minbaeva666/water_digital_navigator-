import {ROLE_PERMISSIONS} from "./rolePermissions";
import {ResourceAction} from "./permissonTypes";

export function checkBasicPermission(user: { role: string }, resource: string, action: ResourceAction): boolean {
    const perms = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
    const resourcePerms = perms?.[resource];
    const permission = resourcePerms?.[action];

    return typeof permission === "boolean" ? permission : false;
}