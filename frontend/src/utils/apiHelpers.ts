import {Dayjs} from "dayjs";
import {OrganizationFormValues} from "../types/dtos/Organization.dto.ts";

export type AppendStringOptions = {
    /** Standard: true – trimmt führende/abschließende Leerzeichen */
    trim?: boolean;
    /** Standard: false – leere Strings werden nicht angehängt */
    allowEmpty?: boolean;
};

/**
 * Hängt einen String an FormData an – nur wenn definiert (nicht null/undefined).
 * Optionales Trimmen und Umgang mit leeren Strings konfigurierbar.
 */
export function appendIfString(
    fd: FormData,
    key: string,
    value?: string | null,
    options: AppendStringOptions = {}
): void {
    const { trim = true, allowEmpty = false } = options;
    if (value == null) return;

    let v = value;
    if (trim) v = v.trim();
    if (!allowEmpty && v.length === 0) return;

    fd.append(key, v);
}

export function appendNullable(fd: FormData, key: string, value?: string | null) {
    if (value === undefined || value === null) {
        fd.append(key, "null");
        return;
    }
    const v = String(value).trim();
    fd.append(key, v === "" ? "null" : v);
}

export const toApiDate = (d: Dayjs | null | undefined) =>
    d ? d.format("YYYY-MM-DD") : undefined;

export const isEmpty = (v: unknown) =>
    v === undefined ||
    v === null ||
    (typeof v === "string" && v.trim() === "") ||
    (Array.isArray(v) && v.length === 0);

export function assertRequired(values: OrganizationFormValues, required: (keyof OrganizationFormValues)[]) {
    const missing = required.filter(k => isEmpty((values as any)[k]));
    if (missing.length) {
        throw new Error(`Fehlende Pflichtfelder: ${missing.join(", ")}`);
    }
}

export function appendIfPresent(fd: FormData, key: string, v: unknown) {
    if (isEmpty(v)) return;
    if (typeof v === "number" || typeof v === "boolean") {
        fd.append(key, String(v));
    } else if (v instanceof Blob) {
        fd.append(key, v);
    } else {
        fd.append(key, String(v));
    }
}

export function appendJsonIfPresent(fd: FormData, key: string, v: unknown) {
    if (isEmpty(v)) return;
    fd.append(key, JSON.stringify(v));
}