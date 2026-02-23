import axiosInstance from "../auth/axiosInstance.ts";
import {
    OrganizationBaseDto,
    OrganizationFormValues, OrganizationFullDto,
    OrganizationMinimalDto, OrganizationForRegistrationDto
} from "../../types/dtos/Organization.dto.ts";
import {appendIfPresent, appendNullable} from "../../utils/apiHelpers.ts";
import {findMissing, requiredPathsFor} from "./organizationAdminRequired.ts";
import {OrganizationState, OrganizationType} from "../../types/constants/enums.ts";


const baseUrl = `/organizations`;


const fetchOrganizationsBase = async (): Promise<OrganizationBaseDto[]> => {
    try {
        const { data } = await axiosInstance.get<OrganizationBaseDto[]>(baseUrl + "/base");
        return data;
    } catch (error) {
        console.error('Fehler beim Laden der Basisinformationen der Organisationen:', error);
        return [];
    }
};

export const fetchOrganizationsForRegistration = async (): Promise<OrganizationForRegistrationDto[]> => {
  const { data } = await axiosInstance.get<OrganizationForRegistrationDto[]>(
    "/organizations/for-registration"
  );
  return data;
};

// const fetchOrganizationsMinimal = async (): Promise<OrganizationMinimalDto[]> => {
//     try {
//         const { data } = await axiosInstance.get<OrganizationMinimalDto[]>(baseUrl + "/minimal");
//         return data;
//     } catch (error) {
//         console.error('Fehler beim Laden der Organisationen + minimal:', error);
//         return [];
//     }
// };

export const fetchOrganizationsMinimalWithoutPresenter = async (
    opts: { signal?: AbortSignal; presentedByUserId?: string | null } = {}
) => {
    const { signal, presentedByUserId } = opts;
    const params: Record<string, string> = {};
    if (presentedByUserId) params.presentedByUserId = presentedByUserId;

    const { data } = await axiosInstance.get<OrganizationMinimalDto[]>(
        `${baseUrl}/minimal-organizations-without-presenter`,
        { signal, params }
    );
    return data;
};


export const createOrganization = async (
    values: OrganizationFormValues
): Promise<OrganizationMinimalDto> => {
    const formData = new FormData();

    // === 1) Pflichtlogik ===
    // Variante mit erweiterten Helpers (empfohlen):
    const required = requiredPathsFor({
        organizationState: values.organizationState,
        organizationType: values.organizationType,
    });
    const missing = findMissing(values, required);
    if (missing.length) {
        const label = (p: any) => (Array.isArray(p) ? p.join(".") : p);
        throw new Error(`Fehlende Pflichtfelder: ${missing.map(label).join(", ")}`);
    }

    // === 2) FormData befüllen (explizit statt „über required iterieren“) ===
    // Basis
    appendIfPresent(formData, "organizationState", values.organizationState);
    appendIfPresent(formData, "organizationType", values.organizationType);
    appendIfPresent(formData, "name", values.name);
    appendIfPresent(formData, "email", values.email);
    appendIfPresent(formData, "street", values.street);
    appendIfPresent(formData, "zip", values.zip);
    appendIfPresent(formData, "city", values.city);
    appendIfPresent(formData, "countryCode", values.countryCode);
    appendIfPresent(formData, "website", values.website);

    if (values.regionId === undefined || values.regionId === null) {
        // wenn auch bei undefined ein Disconnect gewünscht ist:
        formData.append("regionId", "null");
    } else {
        formData.append("regionId", String(values.regionId));
    }

    formData.append("manualCoords", String(values.manualCoords ?? false));

    // lat/lon nur mitsenden, wenn manuell gesetzt werden sollen
    if (values.manualCoords) {
        appendIfPresent(formData, "lat", values.lat);
        appendIfPresent(formData, "lon", values.lon);
    }

    // Municipality: population (nested ODER flach erlaubt)
    const effectivePopulation =
        values.municipalityProfile?.population ??
        (typeof values.population === "number" ? values.population : undefined);

    if (values.organizationType === OrganizationType.MUNICIPALITY && typeof effectivePopulation === "number") {
        formData.append("population", String(Math.trunc(effectivePopulation)));
    }

    // Logo (nur wenn wirklich Datei vorhanden)
    const file = values.logoBase64?.[0]?.originFileObj as File | undefined;
    if (file) {
        formData.append("logoBase64", file, file.name);
    }

    // === 3) Request absetzen ===
    const { data } = await axiosInstance.post<OrganizationMinimalDto>(baseUrl, formData);
    return data;
};

const fetchOrganizations = async (): Promise<OrganizationFullDto[]> => {
    try {
        const { data } = await axiosInstance.get<OrganizationFullDto[]>(baseUrl);
        return data;
    } catch (error) {
        console.error('Fehler beim Laden der Organisationen:', error);
        return [];
    }
};


const fetchOrganization = async (id: string | undefined): Promise<OrganizationFullDto | null> => {
    try {
        const { data } = await axiosInstance.get<OrganizationFullDto>(`${baseUrl}/${id}`);
        return data;
    } catch (error) {
        console.error('Fehler beim Laden der Organisation:', error);
        return null;
    }
};

export const updateOrganization = async (
    values: OrganizationFormValues
): Promise<OrganizationFullDto> => {
    const formData = new FormData();

    const appendIf = (k: string, v: unknown) => {
        if (v !== undefined && v !== null && String(v).trim() !== "") {
            formData.append(k, String(v));
        }
    };


    const isLite = values.organizationState === OrganizationState.LITE;
    const isMunicipality = values.organizationType === "MUNICIPALITY";
    const population =
        values.municipalityProfile?.population ??
        (typeof values.population === "number" ? values.population : undefined);


    appendIf("name", values.name);
    appendIf("zip", values.zip);
    appendIf("city", values.city);
    appendIf("countryCode", values.countryCode);
    appendIf("organizationType", values.organizationType);
    appendIf("organizationState", values.organizationState);


    if (values.regionId === undefined || values.regionId === null) {
        // wenn auch bei undefined ein Disconnect gewünscht ist:
        formData.append("regionId", "null");
    } else {
        formData.append("regionId", String(values.regionId));
    }


    if (isLite) {
        appendNullable(formData, "email", isLite ? null : values.email);
        appendNullable(formData, "street", isLite ? null : values.street);
        appendNullable(formData, "website", isLite ? null : values.website);
    } else {
        appendIf("email", values.email);
        appendIf("street", values.street);
        appendIf("website", values.website);
    }

    formData.append("manualCoords", String(values.manualCoords ?? false));

    // lat/lon nur mitsenden, wenn manuell gesetzt werden sollen
    if (values.manualCoords) {
        appendIfPresent(formData, "lat", values.lat);
        appendIfPresent(formData, "lon", values.lon);
    }

    if (isMunicipality && typeof population === "number") {
        formData.append("population", String(Math.trunc(population)));
        formData.append("municipalityProfileAction", "UPSERT");
    } else {
        formData.append("municipalityProfileAction", "DELETE");
    }


    // --- Logo-Handhabung ---
    const uploadFile = values.logoBase64?.[0];
    const fileLike = uploadFile?.originFileObj as File | undefined;

    if (fileLike instanceof Blob) {
        const filename = (fileLike as File).name ?? "logo";
        formData.append("logoBase64", fileLike, filename);
    } else {
        // Wenn bei LITE kein Logo mehr gewünscht ist, "removeLogo" setzen:
        if (isLite) {
            formData.append("removeLogo", "true");
        } else {
            // Dein bisheriges Verhalten beibehalten:
            const logoRemoved =
                (values.logoBase64 && values.logoBase64.length === 0) ||
                (!values.logoBase64 && (values.logoMimeType || values.logoFilename) === undefined);

            if (logoRemoved) {
                formData.append("removeLogo", "true");
            }
        }
    }

    const { data } = await axiosInstance.put<OrganizationFullDto>(
        `${baseUrl}/${values.id}`,
        formData
    );
    return data;
};

// export const updateOrganization = async (
//     values: OrganizationFormValues
// ): Promise<OrganizationFullDto> => {
//     const formData = new FormData();

//     // kleine Helper
//     const appendIf = (k: string, v: unknown) => {
//         if (v !== undefined && v !== null && String(v).trim() !== "") {
//             formData.append(k, String(v));
//         }
//     };

//     // Basisfelder
//     appendIf("name", values.name);
//     appendIf("email", values.email);
//     appendIf("street", values.street);
//     appendIf("zip", values.zip);
//     appendIf("city", values.city);
//     appendIf("countryCode", values.countryCode);

//     // regionId als null senden können
//     appendNullable(formData, "regionId", values.regionId ?? null);

//     // State & Type
//     appendIf("organizationType", values.organizationType);
//     appendIf("organizationState", values.organizationState);
//     appendIf("website", values.website);

//     // MunicipalityProfile (nur bei MUNICIPALITY)
//     const isMunicipality = values.organizationType === "MUNICIPALITY";
//     const population =
//         values.municipalityProfile?.population ??
//         (typeof values.population === "number" ? values.population : undefined);

//     if (isMunicipality && typeof population === "number") {
//         formData.append("population", String(Math.trunc(population)));
//         // optional: explizit signalisieren, dass Server upserten soll
//         formData.append("municipalityProfileAction", "UPSERT");
//     } else {
//         // optional: explizit signalisieren, dass Server ggf. löschen soll
//         formData.append("municipalityProfileAction", "DELETE");
//     }

//     // Logo:
//     const uploadFile = values.logoBase64?.[0];
//     const fileLike = uploadFile?.originFileObj as File | undefined;

//     if (fileLike instanceof Blob) {
//         const filename = (fileLike as File).name ?? "logo";
//         formData.append("logoBase64", fileLike, filename);
//     } else {
//         // Wenn Benutzer das Logo entfernt hat (keine Datei und keine vorhandenen Meta-Infos mehr)
//         const logoRemoved =
//             (values.logoBase64 && values.logoBase64.length === 0) ||
//             (!values.logoBase64 && (values.logoMimeType || values.logoFilename) === undefined);

//         if (logoRemoved) {
//             formData.append("removeLogo", "true");
//         }
//     }

//     const { data } = await axiosInstance.put<OrganizationFullDto>(
//         `${baseUrl}/${values.id}`,
//         formData
//     );

//     return data;
// };

const deleteOrganization = async (id: string): Promise<OrganizationFullDto> => {
    const { data } = await axiosInstance.delete<OrganizationFullDto>(
        baseUrl + `/${id}`
    );
    return data;
};


export const organizationService = {
    fetchOrganizationsMinimalWithoutPresenter,
    createOrganization,
    fetchOrganizations,
    fetchOrganization,
    updateOrganization,
    deleteOrganization,
    fetchOrganizationsBase
};
