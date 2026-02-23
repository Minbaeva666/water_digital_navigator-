import i18n from 'i18next';
import axiosInstance from "../auth/axiosInstance.ts";

export type TranslatedEnumOption = {
    value: string;
    label: string;
};

export const fetchOrganizationTypes = async (): Promise<TranslatedEnumOption[]> => {
    try {
        const response = await axiosInstance.get(`/input/organization-types`);
        const types: string[] = response.data.organizationTypes ?? [];

        const translated = types.map((type) => ({
            value: type,
            label: i18n.t(`organizationTypes.${type}`),
        }));

        // Sortiert nach übersetztem Label
        translated.sort((a, b) => a.label.localeCompare(b.label, 'de'));

        return translated;
    } catch (error) {
        console.error('Fehler beim Laden der Organisationstypen:', error);
        return [];
    }
};

export const fetchPublishedByTypes = async (): Promise<TranslatedEnumOption[]> => {
    try {
        const response = await axiosInstance.get(`/input/published-by-types`);
        const types: string[] = response.data.publishedByTypes ?? [];

        const translated = types.map((type) => ({
            value: type,
            label: i18n.t(`publishedByTypes.${type}`),
        }));

        // Sortiert nach übersetztem Label
        translated.sort((a, b) => a.label.localeCompare(b.label, 'de'));

        return translated;
    } catch (error) {
        console.error('Fehler beim Laden der Quell-Typen:', error);
        return [];
    }
};

export const fetchDigitalSolutionStateTypes = async (): Promise<TranslatedEnumOption[]> => {
    try {
        const response = await axiosInstance.get(`/input/digital-solution-state-types`);
        const types: string[] = response.data.digitalSolutionStateTypes ?? [];

        const translated = types.map((type) => ({
            value: type,
            label: i18n.t(`digitalSolutionState.${type}`),
        }));

        // Sortiert nach übersetztem Label
        translated.sort((a, b) => a.label.localeCompare(b.label, 'de'));

        return translated;
    } catch (error) {
        console.error('Fehler beim Laden der Organisationstypen:', error);
        return [];
    }
};

export const fetchSalutationTypes = async (): Promise<TranslatedEnumOption[]> => {
    try {
        const response = await axiosInstance.get("/input/salutation-types");
        const types: string[] = response.data.salutationTypes ?? [];

        const translated = types.map((type) => ({
            value: type,
            label: i18n.t(`salutationTypes.${type}`),
        }));

        return translated;
    } catch (error) {
        console.error("Fehler beim Laden der Anredetypen:", error);
        return [];
    }
};

export const fetchOfferingCategoryTypes = async (): Promise<TranslatedEnumOption[]> => {
    try {
        const response = await axiosInstance.get("/input/offering-category-types");
        const types: string[] = response.data.offeringCategoryTypes ?? [];

        const translated = types.map((type) => ({
            value: type,
            label: i18n.t(`offeringCategoryTypes.${type}`),
        }));

        return translated;
    } catch (error) {
        console.error("Fehler beim Laden der Digitalen Lösungsarten:", error);
        return [];
    }
};

export const fetchMaturityDegrees = async (): Promise<TranslatedEnumOption[]> => {
    try {
        const response = await axiosInstance.get("/input/maturity-degrees");
        const types: string[] = response.data.maturityDegrees ?? [];

        const translated = types.map((type) => ({
            value: type,
            label: i18n.t(`maturityDegrees.${type}`),
        }));
        return translated;
    } catch (error) {
        console.error("Fehler beim Laden der Reifegrade:", error);
        return [];
    }
};

export const fetchRoleTypes = async (): Promise<TranslatedEnumOption[]> => {
    try {
        const response = await axiosInstance.get("/input/role-types");
        const types: string[] = response.data.roleTypes ?? [];

        const translated = types.map((type) => ({
            value: type,
            label: i18n.t(`roleTypes.${type}`),
        }));

        return translated;
    } catch (error) {
        console.error("Fehler beim Laden der Anredetypen:", error);
        return [];
    }
};

// export const fetchCountries = async (): Promise<TranslatedEnumOption[]> => {
//     try {
//         const response = await axiosInstance.get(`${backendUrl}/input/countries`);
//         const types: string[] = response.data.countries ?? [];
//
//         const translated = types.map((type) => ({
//             value: type,
//             label: i18n.t(`countries.${type}`),
//         }));
//
//         // Sortiert nach übersetztem Label
//         translated.sort((a, b) => a.label.localeCompare(b.label, 'de'));
//
//         return translated;
//     } catch (error) {
//         console.error('Fehler beim Laden der Länder:', error);
//         return [];
//     }
// };

// Länder laden (als { value, label }-Liste)
export async function fetchCountries(
    lang: "de" | "en" = "de"
): Promise<TranslatedEnumOption[]> {
    const { data } = await axiosInstance.get<{ countries: TranslatedEnumOption[] }>(
        "/input/countries",
        { params: { lang } }
    );
    return data.countries;
}

// Regionen je Land laden (value = regionId, optional code = ISO-3166-2)
export async function fetchRegions(
    countryCode: string,
    lang: "de" | "en" = "de"
): Promise<Array<TranslatedEnumOption & { code?: string }>> {
    const { data } = await axiosInstance.get<{
        regions: Array<TranslatedEnumOption & { code?: string }>;
    }>("/input/regions", {
        params: { country: countryCode, lang },
    });
    return data.regions;
}