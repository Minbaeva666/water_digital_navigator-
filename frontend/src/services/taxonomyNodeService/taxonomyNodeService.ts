import axiosInstance from "../auth/axiosInstance.ts";
import {TaxonomyNodeDto} from "../../types/dtos/TaxonomyNodeDto.ts";
import {TaxonomyStructureResponse} from "../../types/UiTreeNode.ts";

const baseUrl = `/api/taxonomyNodes`;


const fetchTaxonomyNodes = async (): Promise<TaxonomyNodeDto[] | []> => {
    try {
        const {data} = await axiosInstance.get<TaxonomyNodeDto[]>(baseUrl);
        return data;
    } catch (error) {
        console.error('Fehler beim Laden der Kriterien:', error);
        return [];
    }
};

const saveFullTree = async (tree: TaxonomyNodeDto[]): Promise<void> => {
    try {
        await axiosInstance.post(`${baseUrl}`, tree);
    } catch (error: any) {
        const serverError = error.response?.data?.error;
        if (serverError?.message) {
            throw serverError;
        }
        throw { message: "Fehler beim Speichern des Taxonomie-Baums." };
    }
};

const fetchTaxonomyStructure = async (): Promise<TaxonomyStructureResponse | null> => {
    try {
        const { data } = await axiosInstance.get<TaxonomyStructureResponse>(`${baseUrl}/taxonomy-structure`);
        return data ?? null;
    } catch (error) {
        console.error("Fehler beim Laden der Taxonomie-Struktur:", error);
        return null;
    }
};

export const taxonomyNodeService = {
    fetchTaxonomyNodes,
    saveFullTree,
    fetchTaxonomyStructure
};
