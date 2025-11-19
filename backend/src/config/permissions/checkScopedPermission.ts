import {ROLE_PERMISSIONS} from "./rolePermissions";
import {RESOURCE_CONFIG} from "./resourceConfig";
import {ResourceAction} from "./permissonTypes";

export async function checkScopedPermission(
    user: { id: string; role: string },
    resource: string,
    action: ResourceAction,
    resourceId: string
): Promise<boolean> {
    const rolePerms = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
    const resourcePerms = rolePerms?.[resource];
    const allowed = resourcePerms?.[action];

    if (!allowed || typeof allowed === "boolean") return false;

    const { own, others } = allowed;
    if (others) return true;
    if (!own) return false;

    const config = RESOURCE_CONFIG[resource as keyof typeof RESOURCE_CONFIG];
    if (!config) return false;

    const record = await config.model.findUnique({
        where: { id: resourceId },
        select: { [config.ownerField]: true },
    });

    return record?.[config.ownerField]?.toString() === user.id.toString();
}