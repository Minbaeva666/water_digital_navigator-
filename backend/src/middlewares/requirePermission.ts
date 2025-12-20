import { Request, Response, NextFunction } from "express";
import { checkBasicPermission } from "../config/permissions/checkBasicPermission";
import { RESOURCE_CONFIG } from "../config/permissions/resourceConfig";
import { checkScopedPermission } from "../config/permissions/checkScopedPermission";
import { ResourceAction } from "../config/permissions/permissonTypes";

export function requirePermission(descriptor: string) {
    const [resource, actionRaw] = descriptor.split(".");
    const action = actionRaw as ResourceAction;

    return async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !user.id || !user.role) {
            res.status(401).json({ message: "Nicht authentifiziert." });
            return;
        }

        // 🔥 НОВОЕ: ADMIN = суперюзер, пропускаем все проверки
        if (user.role === "ADMIN") {
            return next();
        }

        // Basic permission (e.g. 'create' or 'read')
        if (checkBasicPermission(user, resource, action)) {
            return next();
        }

        // Check "own" permission
        const config = RESOURCE_CONFIG[resource as keyof typeof RESOURCE_CONFIG];
        if (!config) {
            res.status(403).json({ message: "Unbekannte Ressource." });
            return;
        }

        const idParam = config.idParam || "id";
        const resourceId = req.params[idParam];
        if (!resourceId) {
            res.status(400).json({ message: `Pfadparameter "${idParam}" fehlt.` });
            return;
        }

        const hasPermission = await checkScopedPermission(
            user,
            resource,
            action as ResourceAction,
            resourceId
        );

        if (hasPermission) {
            next();
            return;
        }

        res.status(403).json({ message: "Keine Berechtigung." });
        return;
    };
}
