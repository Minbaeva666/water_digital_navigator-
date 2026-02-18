import {DigitalSolutionImageDto} from "../types/dtos/DigitalSolutionImageDto.ts";
import {UploadFile} from "antd";
import {DigitalSolutionDto} from "../types/dtos/DigitalSolutionDto.ts";
import {DigitalSolutionFormValues} from "../forms/digital-solution/DigitalSolutionFormValues.ts";
import {EMPTY_DIGITAL_SOLUTION_FORM} from "../services/digitalSolutionService/digitalSolution.mapper.ts";
import {OrganizationFormValues, OrganizationFullDto} from "../types/dtos/Organization.dto.ts";

export function normalizeEmptyToUndefined(value: string){ return value === "" ? undefined : value}

export function mapImageDtoToUploadFile(
    dto: DigitalSolutionImageDto
): UploadFile {
    return {
        uid: dto.id,
        name: dto.filename,
        status: "done",
        size: dto.size,
        type: dto.mimeType,
        // direkt den relativen Pfad verwenden:
        url: dto.path ?? undefined,
        // falls du zusätzlich den Base64-String nutzen willst:
        thumbUrl: dto.dataUri,
    };
}

export function imagesDiffer(a?: any[], b?: any[]): boolean {
    if (!Array.isArray(a) || !Array.isArray(b)) return true;
    if (a.length !== b.length) return true;

    return a.some((img, idx) => {
        const other = b[idx];
        const aUrl = img?.url || img?.thumbUrl;
        const bUrl = other?.url || other?.thumbUrl;

        return (
            aUrl !== bUrl ||
            img?.name !== other?.name ||
            img?.uid !== other?.uid
        );
    });
};


export function mapDigitalSolutionDtoToForm(
    dto: DigitalSolutionDto | undefined,
    titleImageDto: DigitalSolutionImageDto | undefined,
    detailImageDtos: DigitalSolutionImageDto[]
): DigitalSolutionFormValues {
    if (!dto) return EMPTY_DIGITAL_SOLUTION_FORM;

    return {
        id: dto.id,
        name: dto.name,
        link: dto.link,
        maturityDegree: dto.maturityDegree,
        offeringCategory: dto.offeringCategory,
        shortDescription: dto.shortDescription,
        longDescription: dto.longDescription,
        goalDescription: dto.goalDescription,
        technicalDescription: dto.technicalDescription,

        taxonomyNodeIds: dto.taxonomyNodeIds ?? [],
        taxonomySelections: {},

        efficiencyDescription: dto.efficiencyDescription ?? "",
        processDescription: dto.processDescription ?? "",
        socialRelevanceDescription: dto.socialRelevanceDescription ?? "",
        targetGroupOther: dto.targetGroupOther ?? "",

        presentedByUserId: dto.presentedByUser?.id ?? "",
        solutionPresentedByUser: dto.solutionPresentedByUser ?? undefined,
        projectPartnerIds: dto.projectPartners.map(p => p.id),
        solutionUserIds: dto.solutionUsers.map(u => u.id),

        titleImage: titleImageDto ? [mapImageDtoToUploadFile(titleImageDto)] : [],
        detailImages: (detailImageDtos ?? []).map(mapImageDtoToUploadFile),

        hasAcceptedTerms: dto.hasAcceptedTerms,
        hasAcceptedPrivacyPolicy: dto.hasAcceptedPrivacyPolicy,

        user: dto.user ?? undefined,
        solutionUsers: dto.solutionUsers?? undefined,
        projectPartners: dto.projectPartners?? undefined,
        presentedByUser: dto.presentedByUser ?? undefined,
        userId: dto.user?.id ?? undefined,
        organizationId: dto.organizationId ?? undefined,
        organization: dto.organization ?? undefined,

        readyForOperation: dto.readyForOperation ? dto.readyForOperation : undefined,
        createdAtOverride: dto.createdAtOverride ? dto.createdAtOverride : undefined,
        createdAt: dto.createdAt ? dto.createdAt : undefined,

        publishedBy: dto.publishedBy ? dto.publishedBy : undefined,
        publishedAt: dto.publishedAt ? dto.publishedAt : undefined,
        publishedSource: dto.publishedSource ? dto.publishedSource : undefined,

        state: dto.state,
    };
}


export const getBase64 = (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });


export function mapOrganizationDtoToFormValues(
    dto: OrganizationFullDto
): OrganizationFormValues {

    let logoBase64;

    if (dto.logoBase64 && dto.logoMimeType && dto.logoFilename) {
        // a) Data-URI bauen
        const dataUri = `data:${dto.logoMimeType};base64,${dto.logoBase64}`;

        const fileList: UploadFile[] = [
            {
                uid: dto.id,
                name: dto.logoFilename,
                status: "done",
                type: dto.logoMimeType,
                thumbUrl: dataUri,
                url:      dataUri,
            },
        ];
        // 3) Dieses Array ins Form-Feld „logo“ schreiben
        logoBase64 = fileList;
    }

    return {
        id: dto.id,
        email: dto.email,
        name: dto.name,
        street: dto.street,
        zip: dto.zip,
        city: dto.city,
        manualCoords: dto.manualCoords,
        lat: dto.lat,
        lon: dto.lon,
        countryCode: dto.countryId,
        regionId: dto.regionId ?? undefined,
        organizationType: dto.organizationType ?? "",
        organizationState: dto.organizationState ?? "",
        website: dto.website,

        municipalityProfile: dto.municipalityProfile
            ? {
                organizationId: dto.id,
                population: dto.municipalityProfile.population,
            }
            : null,

        logoBase64: logoBase64,
        logoMimeType: dto.logoMimeType ?? undefined,
        logoFilename: dto.logoFilename ?? undefined,
        users: dto.users,
    };
}

export function extractFilesFromUploadFiles(
    uploadFiles: UploadFile[]
): File[] {
    return uploadFiles
        // nur solche UploadFile-Objekte behalten, die originFileObj vom Browser enthalten
        .filter(
            (f): f is UploadFile & { originFileObj: File } =>
                typeof f.originFileObj !== "undefined"
        )
        // und genau diese echten File-Blobs zurückgeben
        .map((f) => f.originFileObj);
}


export function formatDateToGerman(isoDateString?: string): string {
    // Kein Datum übergeben oder leerer String → leerer Fallback
    if (!isoDateString) {
        return "";
    }

    const date = new Date(isoDateString);
    // Ungültiges Datum prüfen
    if (isNaN(date.getTime())) {
        return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

export function generateImageCaption(
    presentedByUser: boolean,
    presentedByUserName: string,
    organizationName: string,
    createdAt?: string
): string {
    const presenter = presentedByUser
        ? presentedByUserName
        : organizationName;
    const date = formatDateToGerman(createdAt);
    return `© ${presenter}${date ? ` ${date}` : ""}`;
}

export const normIdArray = (arr?: (string | number | null | undefined)[]) =>
    Array.from(new Set((arr ?? []).map(String))) // alles zu String + dedupe
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));       // order-insensitiv machen

export const equalIdArrays = (a?: (string | number | null | undefined)[], b?: (string | number | null | undefined)[]) => {
    const A = normIdArray(a);
    const B = normIdArray(b);
    if (A.length !== B.length) return false;
    for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) return false;
    return true;
};


export function getSourceCountryName(
    ds: DigitalSolutionFormValues,
): string {

    const source = ds?.solutionPresentedByUser
        ? ds?.presentedByUser?.organization
        : ds?.organization;

    const countryCode = source?.country?.nameDe;

    if (!countryCode) return "Unbekannt";

    return countryCode;
}

export function getSourceRegionName(
    ds: DigitalSolutionFormValues,
): string | null {
    const source = ds?.solutionPresentedByUser
        ? ds?.presentedByUser?.organization
        : ds?.organization;

    const region = source?.region?.nameDe;


    if (!region) return null;

    return region;
}




