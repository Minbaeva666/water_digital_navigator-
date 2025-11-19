type Lang = "de" | "en";
export const normalizeLang = (x: unknown): Lang => (String(x || "de").toLowerCase() === "en" ? "en" : "de");

export const toLabel = (lang: Lang, nameDe?: string | null, nameEn?: string | null, fallback?: string) =>
    (lang === "en" ? nameEn : nameDe) || nameDe || nameEn || fallback || "";

export const sortByLabel = (a: { label: string }, b: { label: string }, lang: Lang) =>
    a.label.localeCompare(b.label, lang);