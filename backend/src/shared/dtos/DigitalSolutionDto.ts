import {
    MaturityDegree,
    DigitalSolutionState,
    PresentedBy,
    OfferingCategory
} from "../constants/enums";
import { OrganizationBaseDto } from "./Organization.dto";
import {UserBaseDto, UserWithOrganizationDto} from "./User.dto";
import { DigitalSolutionImageDto } from "./DigitalSolutionImageDto";

export interface DigitalSolutionBaseDto {
    id: string;
    name: string;
    link: string;
    maturityDegree: MaturityDegree;
    offeringCategory?: OfferingCategory;
    shortDescription: string;
    longDescription: string;
    goalDescription: string;
    technicalDescription: string;
    efficiencyDescription: string;
    processDescription: string;
    socialRelevanceDescription: string;
    hasAcceptedTerms: boolean;
    hasAcceptedPrivacyPolicy: boolean;
    presentedByUser: UserBaseDto;
    state?: DigitalSolutionState;
    createdAt: string;
    readyForOperation: string;
    organizationId?: string;
}

export interface DigitalSolutionMinimalDto extends DigitalSolutionBaseDto {
    organizationId?: string;
    userId: string;
    projectPartnerIds: string[];
    solutionUserIds: string[];
}

export interface DigitalSolutionWithRelationsDto extends DigitalSolutionBaseDto {
    user: UserWithOrganizationDto;
    projectPartners: OrganizationBaseDto[];
    solutionUsers: OrganizationBaseDto[];
    organization: OrganizationBaseDto
}

export interface DigitalSolutionFormValues {
    id?: string;
    // Der User, der die Lösung repräsentiert
    presentedByUserId?: string;
    presentedByUser?: { id: string; organizationId?: string };
    user: { id: string; organizationId?: string };
    userId?: string;
    organizationId?: string;

    name: string;
    link: string;
    maturityDegree?: MaturityDegree;
    offeringCategory?: OfferingCategory;
    shortDescription: string;
    longDescription: string;
    goalDescription: string;
    technicalDescription: string;
    efficiencyDescription: string;
    processDescription: string;
    socialRelevanceDescription: string;
    projectPartners: OrganizationBaseDto[];
    solutionUsers: OrganizationBaseDto[];

    titleImage?: DigitalSolutionImageDto;
    detailImages: DigitalSolutionImageDto[];
    hasAcceptedTerms: boolean;
    hasAcceptedPrivacyPolicy: boolean;
    // Der Persisted-Status
    state?: DigitalSolutionState;
    // Datum als DD.MM.YYYY-String im Formular
    readyForOperation: string;
}