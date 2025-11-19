export type SolutionWithCoords = {
    id: string;
    title: string;
    lat: number | null;
    lon: number | null;
    city?: string;
    municipality?: string;
    website?: string | null;
};

const normalizeUrl = (url?: string | null) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
};

export function mapBackendToSolutionsWithCoords(items: any[]): SolutionWithCoords[] {
    return (items ?? []).map((s) => {
        const org = s?.organization ?? null;
        const pOrg = s?.presentedByUser?.organization ?? null;

        const lat = typeof org?.lat === "number" ? org.lat
            : typeof pOrg?.lat === "number" ? pOrg.lat
                : null;

        const lon = typeof org?.lon === "number" ? org.lon
            : typeof pOrg?.lon === "number" ? pOrg.lon
                : null;

        const municipality = [pOrg?.zip ?? org?.zip, pOrg?.city ?? org?.city]
            .filter(Boolean)
            .join(" ");

        return {
            id: String(s.id),
            title: s.name ?? s.title ?? "Ohne Titel",
            lat,
            lon,
            city: org?.city ?? undefined,
            municipality: municipality || undefined,
            website: normalizeUrl(s.link),
        };
    });
}