import {
    DigitalSolutionBackendDto, DigitalSolutionDto,
    DigitalSolutionWithRelationsDto
} from "../../types/dtos/DigitalSolutionDto.ts";
import axiosInstance from "../auth/axiosInstance.ts";
import {DigitalSolutionState} from "../../types/constants/enums.ts";
import {DigitalSolutionImageDto} from "../../types/dtos/DigitalSolutionImageDto.ts";
import axios from "axios";
import {DigitalSolutionFormValues} from "../../forms/digital-solution/DigitalSolutionFormValues.ts";
import {normalizeDigitalSolution} from "../../utils/digitalSolution.mapper.ts";

const baseUrl = `/api/digital-solutions`;


const fetchDigitalSolutionById = async (digitalSolutionId: string | undefined): Promise<DigitalSolutionWithRelationsDto | undefined> => {
    try {
        const {data} = await axiosInstance.get<DigitalSolutionBackendDto>(`${baseUrl}/${digitalSolutionId}`);
        return normalizeDigitalSolution(data);
    } catch (error) {
        console.error(`Fehler beim Laden der digitalen Lösung mit ID ${digitalSolutionId}:`, error);
        return undefined;
    }
};

const fetchActiveDigitalSolutionsWithTitleImage = async (
    page: number,
    pageSize: number,
    taxonomyNodeId?: string,
    q?: string,
    sort?: "newest" | "oldest" | "az" | "za",
    taxonomyPath?: string,
    dateFrom?: string,
    dateTo?: string,
    organizationId?: string       
) => {
    const { data } = await axiosInstance.get(`${baseUrl}/active-with-title-image`, {
        params: {
            page,
            pageSize,
            taxonomyNodeId,
            taxonomyPath,
            q,
            sort,
            dateFrom,
            dateTo,
            organizationId,       
        },
    });

    return data as { items: DigitalSolutionDto[]; total: number };
};


// const fetchActiveDigitalSolutionsWithTitleImage = async (
//     page: number,
//     pageSize: number,
//     taxonomyNodeId?: string,
//     q?: string,
//     sort?: "newest" | "oldest" | "az" | "za",
//     taxonomyPath?: string,
//     dateFrom?: string,
//     dateTo?: string
// ) => {
//     const {data} = await axiosInstance.get(`${baseUrl}/active-with-title-image`, {
//         params: {page, pageSize, taxonomyNodeId, taxonomyPath, q, sort, dateFrom, dateTo},
//     });
//     return data as { items: DigitalSolutionDto[]; total: number };
// };

export const createDigitalSolution = async (
    values: DigitalSolutionFormValues
): Promise<{ digitalSolutionId: string }> => {

    const {
        state,
        name,
        link,
        maturityDegree,
        offeringCategory,
        shortDescription,
        longDescription,
        goalDescription,
        technicalDescription,
        efficiencyDescription,
        processDescription,
        socialRelevanceDescription,
        hasAcceptedTerms,
        hasAcceptedPrivacyPolicy,
        projectPartnerIds,
        solutionUserIds,
        taxonomyNodeIds,
        readyForOperation,
        createdAtOverride,
        presentedByUserId,
        solutionPresentedByUser,
        publishedBy,
        publishedAt,
        publishedSource,
    } = values;

    const payload = {
        state,
        name,
        link,
        maturityDegree,
        offeringCategory,
        shortDescription,
        longDescription,
        goalDescription,
        technicalDescription,
        efficiencyDescription,
        processDescription,
        socialRelevanceDescription,
        hasAcceptedTerms,
        hasAcceptedPrivacyPolicy,
        presentedByUserId,
        projectPartnerIds,
        solutionUserIds,
        taxonomyNodeIds,
        readyForOperation,
        createdAtOverride,
        solutionPresentedByUser,
        publishedBy,
        publishedAt,
        publishedSource
    };

    const {data} = await axiosInstance.post<{ digitalSolutionId: string }>(baseUrl, payload);
    return {digitalSolutionId: data.digitalSolutionId};
};


export const uploadDigitalSolutionDetailImages = async (params: {
    id: string;
    detailImages: File[];
}): Promise<string> => {
    const {id, detailImages} = params;
    const formData = new FormData();
    detailImages.forEach((file) => formData.append("detailImages", file));

    try {
        await axiosInstance.post(
            `${baseUrl}/digital-solution/${id}/detail-images-upload`,
            formData,
            {
                headers: {"Content-Type": "multipart/form-data"},
            }
        );
        return "Detailbilder erfolgreich hochgeladen";
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            // Deine API liefert den Fehler in err.response.data.error
            return err.response?.data?.error ?? err.message;
        }
        return err instanceof Error ? err.message : "Unbekannter Fehler";
    }
};

const fetchDigitalSolutionsWithState = async (state: DigitalSolutionState
): Promise<DigitalSolutionWithRelationsDto[]> => {
    const params = state ? {state} : undefined;
    const {data} = await axiosInstance.get<DigitalSolutionWithRelationsDto[]>(
        '/digital-solutions',
        {params}
    );
    return data;
};

const fetchMyDigitalSolutionsWithState = async (
  state: DigitalSolutionState
): Promise<DigitalSolutionWithRelationsDto[]> => {
  const params = state ? { state } : undefined;
  const { data } = await axiosInstance.get<DigitalSolutionWithRelationsDto[]>(
    "/digital-solutions/my",
    { params }
  );
  return data;
};


async function fetchTitleImageByDigitalSolution(digitalSolutionId: string | undefined): Promise<DigitalSolutionImageDto | undefined> {
    if (!digitalSolutionId) return undefined;

    try {
        const {data} = await axiosInstance.get(baseUrl + `/title-image`, {params: {digitalSolutionId},});
        return data;
    } catch (err) {
        console.error("Fehler beim Abrufen des Titelbild‐Meta:", err);
        return undefined;
    }
}

async function fetchDetailImagesByDigitalSolution(digitalSolutionId: string | undefined): Promise<DigitalSolutionImageDto[]> {
    if (!digitalSolutionId) return [];

    try {
        const {data} = await axiosInstance.get(baseUrl + `/detail-images`, {params: {digitalSolutionId},});
        return data ?? [] as DigitalSolutionImageDto[];
    } catch (err) {
        console.error("Fehler beim Abrufen des Titelbild‐Meta:", err);
        return [];
    }
}

const updateDigitalSolution = async (values: DigitalSolutionFormValues): Promise<DigitalSolutionWithRelationsDto> => {
    const taxonomySelections = values.taxonomySelections ?? {};
    const taxonomyNodeIds = Object.values(taxonomySelections)
        .flat()
        .filter((id, idx, arr) => arr.indexOf(id) === idx);

    const payload = {
        id: values.id,
        userId: values.userId,
        name: values.name,
        link: values.link,
        maturityDegree: values.maturityDegree,
        offeringCategory: values.offeringCategory,
        shortDescription: values.shortDescription,
        longDescription: values.longDescription,
        goalDescription: values.goalDescription,
        technicalDescription: values.technicalDescription,
        efficiencyDescription: values.efficiencyDescription,
        processDescription: values.processDescription,
        socialRelevanceDescription: values.socialRelevanceDescription,
        hasAcceptedTerms: values.hasAcceptedTerms,
        hasAcceptedPrivacyPolicy: values.hasAcceptedPrivacyPolicy,
        presentedByUser: values.presentedByUser,
        presentedByUserId: values.presentedByUserId,
        organizationId: values.organizationId,
        projectPartnerIds: values.projectPartnerIds,
        solutionUserIds: values.solutionUserIds,
        taxonomyNodeIds,
        readyForOperation: values.readyForOperation,
        createdAtOverride: values.createdAtOverride,
        state: values.state,
        solutionPresentedByUser: values.solutionPresentedByUser,
        publishedBy: values.publishedBy,
        publishedAt: values.publishedAt,
        publishedSource: values.publishedSource
    };

    const {data} = await axiosInstance.put<DigitalSolutionWithRelationsDto>(
        `/digital-solutions/${values.id}`,
        payload
    );

    return data;
};

const updateDigitalSolutionState = async (values: DigitalSolutionFormValues): Promise<DigitalSolutionWithRelationsDto> => {
    const payload = {
        digitalSolutionId: values.id,
        state: values.state,
    };

    const {data} = await axiosInstance.put<DigitalSolutionWithRelationsDto>(
        `/digital-solutions/${values.id}`,
        payload
    );

    return data;
};

export const updateDigitalSolutionTitleImage = async (params: {
    id: string;
    titleImage: File;
}): Promise<string> => {
    const {id, titleImage} = params;
    const formData = new FormData();
    formData.append("titleImage", titleImage);

    try {
        await axiosInstance.put(
            `${baseUrl}/digital-solution/${id}/title-image`,
            formData,
            {headers: {"Content-Type": "multipart/form-data"}}
        );
        return "Titelbild erfolgreich aktualisiert";
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            return err.response?.data?.error ?? err.message;
        }
        return err instanceof Error ? err.message : "Unbekannter Fehler";
    }
};

export const updateDigitalSolutionDetailImages = async (params: {
    digitalSolutionId: string;
    keepImageIds: string[];
    detailImages: File[]; // nur neue Dateien!
}): Promise<string> => {
    const {digitalSolutionId, keepImageIds, detailImages} = params;
    const formData = new FormData();
    formData.append("keepImageIds", JSON.stringify(keepImageIds));
    detailImages.forEach((file) => formData.append("detailImages", file));
    await axiosInstance.put(
        `${baseUrl}/digital-solution/${digitalSolutionId}/detail-images`,
        formData,
        {headers: {"Content-Type": "multipart/form-data"}}
    );
    return "Detailbilder aktualisiert";
};

export const uploadDigitalSolutionTitleImage = async (params: {
    id: string;
    titleImage: File;
}): Promise<string> => {
    const {id, titleImage} = params;
    const formData = new FormData();
    formData.append("titleImage", titleImage);

    try {
        await axiosInstance.post(
            `${baseUrl}/digital-solution/${id}/title-image-upload`,
            formData,
            {headers: {"Content-Type": "multipart/form-data"}}
        );
        return "Titelbild erfolgreich hochgeladen";
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            return err.response?.data?.error ?? err.message;
        }
        return err instanceof Error ? err.message : "Unbekannter Fehler";
    }
};

export const deleteDigitalSolution = async (id: string): Promise<DigitalSolutionWithRelationsDto> => {
    const {data} = await axiosInstance.delete<DigitalSolutionWithRelationsDto>(
        baseUrl + `/digital-solution/${id}`
    );
    return data;
};

const fetchActiveDigitalSolutions = async (): Promise<DigitalSolutionWithRelationsDto[]> => {
    try {
        const {data} = await axiosInstance.get(`${baseUrl}/active`);
        return data;
    } catch (error) {
        console.error("Fehler beim Laden aktiver DigitalSolutions mit Organisation:", error);
        return [];
    }
};

export const fetchAllCoordinates = async (): Promise<DigitalSolutionWithRelationsDto[]> => {
    try {
        console.log(`📍 Fetching all coordinates from: ${baseUrl}/all-coordinates`);
        const {data} = await axiosInstance.get(`${baseUrl}/all-coordinates`);
        console.log(`✅ Fetched ${data?.length || 0} digital solutions from API`, data);
        return data;
    } catch (error) {
        console.error("❌ Fehler beim Laden aller Koordinaten:", error);
        return [];
    }
};


export const digitalSolutionService = {
    fetchDigitalSolutionById,
    createDigitalSolution,
    uploadDigitalSolutionDetailImages,
    uploadDigitalSolutionTitleImage,
    fetchDigitalSolutionsWithState,
    fetchTitleImageByDigitalSolution,
    fetchDetailImagesByDigitalSolution,
    updateDigitalSolution,
    updateDigitalSolutionTitleImage,
    updateDigitalSolutionDetailImages,
    updateDigitalSolutionState,
    deleteDigitalSolution,
    fetchActiveDigitalSolutionsWithTitleImage,
    fetchActiveDigitalSolutions,
    fetchAllCoordinates,
    fetchMyDigitalSolutionsWithState,
};
