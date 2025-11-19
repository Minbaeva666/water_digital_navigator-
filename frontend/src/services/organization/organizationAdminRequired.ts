// services/organization/organizationAdminRequired.ts
import { OrganizationFormValues } from "../../types/dtos/Organization.dto";
import { OrganizationType } from "../../types/constants/enums";

export const ORG_STATES = ["LITE", "FULL"] as const;
export type OrgState = typeof ORG_STATES[number];
export const isOrgState = (s: unknown): s is OrgState =>
    ORG_STATES.includes(s as OrgState);

// Pfadtyp: flat oder nested
export type FieldPath =
    | keyof OrganizationFormValues
    | ["municipalityProfile", "population"];

// Basis-Pflichten pro State
export const REQUIRED_COMMON: Record<OrgState, (keyof OrganizationFormValues)[]> = {
    LITE: ["organizationState","name","organizationType","zip","city","countryCode"],
    FULL: ["organizationState","name","email","website","organizationType","street","zip","city","countryCode"],
};

// dynamische Pflichtpfade inkl. Logo/Population
export function requiredPathsFor(
    values: Pick<OrganizationFormValues, "organizationState" | "organizationType">
): FieldPath[] {
    const state = isOrgState(values.organizationState) ? values.organizationState : "LITE";
    const base = REQUIRED_COMMON[state].slice() as FieldPath[];

    // if (state === "FULL") base.push("logoBase64"); // Logo nur in FULL
    if (values.organizationType === OrganizationType.MUNICIPALITY) {
        base.push(["municipalityProfile","population"]); // Population nur für MUNICIPALITY
    }
    return base;
}

// ---- Helpers
export const isEmpty = (v: unknown) =>
    v == null ||
    (typeof v === "string" && v.trim() === "") ||
    (Array.isArray(v) && v.length === 0);

function getByPath(obj: any, path: FieldPath): any {
    if (Array.isArray(path)) {
        const [p1, p2] = path;
        return obj?.[p1]?.[p2];
    }
    return (obj as any)?.[path];
}

function hasValue(path: FieldPath, v: unknown): boolean {
    if (Array.isArray(path)) {
        const n = Number(v);
        return Number.isInteger(n) && n >= 0; // municipalityProfile.population
    }
    if (path === "logoBase64") return Array.isArray(v) && v.length > 0;
    if (path === "zip") return typeof v === "string" ? v.trim().length > 0 : v != null;
    return !isEmpty(v);
}

export function findMissing(values: OrganizationFormValues, required: FieldPath[]): FieldPath[] {
    return required.filter((p) => !hasValue(p, getByPath(values, p)));
}

export function toAntdName(p: FieldPath): (string | number)[] | string {
    return Array.isArray(p) ? p : p;
}

export function assertRequired(values: OrganizationFormValues, required: FieldPath[]) {
    const missing = findMissing(values, required);
    if (missing.length) {
        const label = (p: FieldPath) => (Array.isArray(p) ? p.join(".") : p);
        throw new Error(`Fehlende Pflichtfelder: ${missing.map(label).join(", ")}`);
    }
}

export function partitionPaths(paths: FieldPath[]) {
    const flat: (keyof OrganizationFormValues)[] = [];
    const nested: (string | number)[][] = [];
    for (const p of paths) {
        if (Array.isArray(p)) nested.push(p);
        else flat.push(p);
    }
    return { flat, nested };
}

// optional: einfacher Helper, wenn du nur nach State gehen willst
export const requiredForState = (s: unknown) =>
    REQUIRED_COMMON[isOrgState(s) ? s : "LITE"];
