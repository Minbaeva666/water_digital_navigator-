// Was das Backend **tatsächlich** liefert:
import {DigitalSolutionState, MaturityDegree, OfferingCategory, PublishedByType} from "../constants/enums.ts";
import { OrganizationBaseDto } from "./Organization.dto.ts";
import {UserBaseDto, UserFullDto} from "./User.dto.ts";
import {TaxonomyNodeDto} from "./TaxonomyNodeDto.ts";

export interface DigitalSolutionImageDto {
    id: string;
    filename: string;
    path: string;
    mimeType: string;
    size: number;
    type: "TITLE" | "DETAIL";
    uploadedAt: string;
    dataUri: string;
}

export interface DigitalSolutionBackendDto {
    id: string;
    name: string;
    link: string;
    maturityDegree: MaturityDegree;
    offeringCategory?: OfferingCategory;
    shortDescription: string;
    longDescription: string;
    goalDescription: string;
    technicalDescription: string;
    efficiencyDescription: string | null;
    processDescription: string | null;
    socialRelevanceDescription: string | null;
    hasAcceptedTerms: boolean;
    hasAcceptedPrivacyPolicy: boolean;
    solutionPresentedByUser?: boolean | null;
    presentedByUserId: string | null;
    state: DigitalSolutionState;
    publishedBy: PublishedByType;
    publishedAt: string | null;
    publishedSource: string | null;
    createdAt: string;
    createdAtOverride: string | null;
    readyForOperation: string | null;
    organizationId: string | null;
    userId: string | null;

    // Relationen aus deinem Response:
    taxonomyNodes: { taxonomyNodeId: string }[];
    presentedByUser: UserFullDto | null;
    user: UserBaseDto | null;
    projectPartners: OrganizationBaseDto[];
    solutionUsers: OrganizationBaseDto[];
    images: DigitalSolutionImageDto[];
    organization: OrganizationBaseDto | null;

}


export interface DigitalSolutionWithRelationsDto {
    id: string;
    name: string;
    link: string;
    maturityDegree: MaturityDegree;
    offeringCategory?: OfferingCategory;
    shortDescription: string;
    longDescription: string;
    goalDescription: string;
    technicalDescription: string;
    efficiencyDescription: string | null;
    processDescription: string | null;
    socialRelevanceDescription: string | null;
    hasAcceptedTerms: boolean;
    hasAcceptedPrivacyPolicy: boolean;
    solutionPresentedByUser?: boolean | null;
    state: DigitalSolutionState;
    createdAt: string;
    createdAtOverride: string | null;
    readyForOperation: string | null;
    organizationId?: string | null;

    publishedBy: PublishedByType;
    publishedAt: string | null;
    publishedSource: string | null;

    // Relationen normalisiert:
    taxonomyNodeIds: string[];
    presentedByUser: UserFullDto | null;
    user: UserBaseDto | null;
    projectPartners: OrganizationBaseDto[];
    solutionUsers: OrganizationBaseDto[];
    organization: OrganizationBaseDto | null;

    // Bilder bereits getrennt:
    titleImage?: DigitalSolutionImageDto | null;
    detailImages?: DigitalSolutionImageDto[];
}

export interface DigitalSolutionDto {
    id: string;
    name: string;
    link: string;
    maturityDegree: MaturityDegree;
    offeringCategory?: OfferingCategory;
    shortDescription: string;
    longDescription: string;
    goalDescription: string;
    technicalDescription: string;
    efficiencyDescription: string | null;
    processDescription: string | null;
    socialRelevanceDescription: string | null;
    hasAcceptedTerms: boolean;
    hasAcceptedPrivacyPolicy: boolean;
    solutionPresentedByUser?: boolean | null;
    state: DigitalSolutionState;
    createdAt: string;
    readyForOperation: string | null;
    createdAtOverride: string | null;
    organizationId?: string | null;

    publishedBy: PublishedByType;
    publishedAt:  string | null;
    publishedSource: string | null;

    // Relationen normalisiert:
    taxonomyNodeIds: string[];
    taxonomyNodes?: TaxonomyNodeDto[];
    presentedByUser: UserFullDto | null;
    user: UserBaseDto | null;
    projectPartners: OrganizationBaseDto[];
    solutionUsers: OrganizationBaseDto[];
    organization: OrganizationBaseDto | null;

    // Bilder bereits getrennt:
    titleImage?: DigitalSolutionImageDto | null;
    detailImages?: DigitalSolutionImageDto[];
}
