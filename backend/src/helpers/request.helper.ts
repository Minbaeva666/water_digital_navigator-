export const toNullable = (v: unknown) => {
    if (v === undefined) return undefined;
    const s = String(v).trim().toLowerCase();
    return s === "" || s === "null" || s === "undefined" ? null : String(v).trim();
};