import { FaqDto } from "../../types/dtos/FaqDto.ts";
import { PrivacyPolicyDto } from "../../types/dtos/PrivacyPolicyDto.ts";
import { TermsOfUseDto } from "../../types/dtos/TermsOfUseDto.ts";
import { FaqPayload } from "../../types/payloads/FaqPayload.ts";
import { TermsOfUsePayload } from "../../types/payloads/TermsOfUsePayload.ts";
import axiosInstance from "../auth/axiosInstance.ts";
import {AccessibilityStatementDto} from "../../types/dtos/AccessibilityStatementDto.ts";
import {PrivacyPolicyUpdatePayload} from "../../types/payloads/PrivacyPolicyPayload.ts";
import {AccessibilityStatementUpdatePayload} from "../../types/payloads/AccessibilityStatementUpdatePayload.ts";
import {ImprintStatementDto} from "../../types/dtos/ImprintStatementDto.ts";
import {ImprintStatementUpdatePayload} from "../../types/payloads/ImprintStatementPayload.ts";
const baseUrl = `/api/app-options`;
const fetchFaq = async (id?: string): Promise<FaqDto | undefined> => {
    try {
        const url = id ? `${baseUrl}/faq?id=${encodeURIComponent(id)}` : `${baseUrl}/faq`;
        const { data } = await axiosInstance.get<FaqDto>(url);
        return data;
    } catch (error) {
        console.error("Fehler beim Laden des neuesten FAQ:", error);
        return undefined;
    }
};

const updateFaq = async (payload: FaqPayload): Promise<FaqDto> => {
    const { data } = await axiosInstance.post<FaqDto>(`${baseUrl}/faq`, payload);
    return data;
};

const fetchTermsOfUse = async (id?: string): Promise<TermsOfUseDto | undefined> => {
    try {
        const url = id ? `${baseUrl}/terms-of-use?id=${encodeURIComponent(id)}` : `${baseUrl}/terms-of-use`;
        const { data } = await axiosInstance.get<TermsOfUseDto>(url);
        return data;
    } catch (error) {
        console.error("Fehler beim Laden der Nutzungsbedingungen:", error);
        return undefined;
    }
};

const updateTermsOfUse = async (
    payload: TermsOfUsePayload
): Promise<TermsOfUseDto> => {
    const { data } = await axiosInstance.post<TermsOfUseDto>(`${baseUrl}/terms-of-use`, payload);
    return data;
};

const fetchPrivacyPolicy = async (id?: string): Promise<PrivacyPolicyDto | undefined> => {
    try {
        const url = id ? `${baseUrl}/privacy-policy?id=${encodeURIComponent(id)}` : `${baseUrl}/privacy-policy`;
        const { data } = await axiosInstance.get<PrivacyPolicyDto>(url);
        return data;
    } catch (error) {
        console.error("Fehler beim Laden der Datenschutzerklärung:", error);
        return undefined;
    }
};

const updatePrivacyPolicy = async (
    payload: PrivacyPolicyUpdatePayload
): Promise<PrivacyPolicyDto> => {
    const { data } = await axiosInstance.post<PrivacyPolicyDto>(`${baseUrl}/privacy-policy`, payload);
    return data;
};

const fetchAccessibilityStatement = async (id?: string): Promise<AccessibilityStatementDto | undefined> => {
    try {
        const url = id ? `${baseUrl}/accessibility?id=${encodeURIComponent(id)}` : `${baseUrl}/accessibility`;
        const { data } = await axiosInstance.get<AccessibilityStatementDto>(url);
        return data;
    } catch (error) {
        console.error("Fehler beim Laden der Barrierefreiheitserklärung:", error);
        return undefined;
    }
};

const updateAccessibilityStatement = async (
    payload: AccessibilityStatementUpdatePayload
): Promise<AccessibilityStatementDto> => {
    const { data } = await axiosInstance.post<AccessibilityStatementDto>(`${baseUrl}/accessibility`, payload);
    return data;
};

const fetchImprintStatement = async (id?: string): Promise<ImprintStatementDto | undefined> => {
    try {
        const url = id ? `${baseUrl}/imprint?id=${encodeURIComponent(id)}` : `${baseUrl}/imprint`;
        const { data } = await axiosInstance.get<ImprintStatementDto>(url);
        return data;
    } catch (error) {
        console.error("Fehler beim Laden des Impressums:", error);
        return undefined;
    }
};

const updateImprintStatement = async (
    payload: ImprintStatementUpdatePayload
): Promise<ImprintStatementDto> => {
    const { data } = await axiosInstance.post<ImprintStatementDto>(`${baseUrl}/imprint`, payload);
    return data;
};

export const faqService = {
    fetchFaq,
    updateFaq,
};

export const termsService = {
    fetchTermsOfUse,
    updateTermsOfUse,
};

export const privacyService = {
    fetchPrivacyPolicy,
    updatePrivacyPolicy,
};

export const accessibilityService = {
    fetchAccessibilityStatement,
    updateAccessibilityStatement,
};

export const imprintService = {
    fetchImprintStatement,
    updateImprintStatement,
};
