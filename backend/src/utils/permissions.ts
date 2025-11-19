import {
    OwnOthersPermission,
    ResourceAction,
    SimplePermission
} from "../config/permissions/permissonTypes";
import {RolePermissionMap} from "../config/permissions/rolePermissions";

interface UserWithPermissions {
    permissions: RolePermissionMap;
}

export function hasPermission(
    userWithPermissions: UserWithPermissions,
    permissionPath: ResourceAction,
    isOwner: boolean = false
): boolean {
    const { permissions } = userWithPermissions;
    // Split in [resource, action] und typisiere explizit
    const [resource, action] = permissionPath.split(".") as [keyof RolePermissionMap, string];

    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) {
        return false;
    }

    // `action` ist z. B. "edit" oder "read"
    const perm = (resourcePermissions as any)[action] as SimplePermission | undefined;
    if (perm === undefined) {
        return false;
    }

    // 1) Wenn Boolean = true, überall erlaubt (z. B. Admin)
    if (perm === true) {
        return true;
    }

    // 2) Sonst ist perm ein OwnOthersPermission
    const ownOthers = perm as OwnOthersPermission;
    return isOwner ? ownOthers.own : ownOthers.others;
}