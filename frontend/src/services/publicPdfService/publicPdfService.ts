import axiosInstance from "../auth/axiosInstance.ts";
import type { PublicPdfDto } from "../../types/dtos/PublicPdfDto.ts";
import type { PublicPdfUploadPayload } from "../../types/payloads/PublicPdfPayload.ts";

const baseUrl = `/public-pdf`;

type ApiWithMessage<T> = T & { message?: string };

const fetchPublicPdf = async (): Promise<ApiWithMessage<PublicPdfDto> | undefined> => {
    try {
        const { data } = await axiosInstance.get<ApiWithMessage<PublicPdfDto>>(`${baseUrl}`);
        return data;
    } catch (error) {
        console.error("Fehler beim Laden der Public-PDF-Metadaten:", error);
        return undefined;
    }
};

const uploadPublicPdf = async (
    payload: PublicPdfUploadPayload
): Promise<ApiWithMessage<PublicPdfDto>> => {
    const formData = new FormData();
    formData.append("file", payload.file);

    const { data } = await axiosInstance.post<ApiWithMessage<PublicPdfDto>>(
        `${baseUrl}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );

    return data;
};

const deletePublicPdf = async (): Promise<{ message?: string; exists?: boolean }> => {
    const { data } = await axiosInstance.delete<{ message?: string; exists?: boolean }>(
        `${baseUrl}`
    );
    return data;
};

export const publicPdfService = {
    fetchPublicPdf,
    uploadPublicPdf,
    deletePublicPdf,
};
