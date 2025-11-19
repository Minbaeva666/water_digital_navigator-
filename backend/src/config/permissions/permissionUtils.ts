import { CRUDAction, Role } from './permissonTypes';
import {ROLE_PERMISSIONS, RolePermissionMap} from './rolePermissions';

/**
 * Prüft, ob ein User mit gegebener Rolle eine bestimmte Aktion auf ein Entity ausführen darf.
 * @param role Rolle des Users
 * @param entity z. B. "users"
 * @param action z. B. "edit"
 * @param isOwn true, wenn es sich um eigene Ressource handelt
 */
export function hasPermission(
    role: Role,
    entity: keyof RolePermissionMap,
    action: CRUDAction,
    isOwn: boolean = false
): boolean {
    const perms = ROLE_PERMISSIONS[role]?.[entity];
    if (!perms) return false;

    const actionPerm = perms[action];
    if (typeof actionPerm === 'boolean') return actionPerm;

    if (typeof actionPerm === 'object') {
        return isOwn ? actionPerm.own : actionPerm.others;
    }

    return false;
}
