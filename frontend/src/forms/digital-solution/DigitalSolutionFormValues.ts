import {DigitalSolutionState, MaturityDegree, OfferingCategory, PublishedByType} from "../../types/constants/enums";
import {OrganizationBaseDto} from "../../types/dtos/Organization.dto.ts";
import {UploadFile} from "antd";
import {UserBaseDto, UserFullDto} from "../../types/dtos/User.dto.ts";
import {TaxonomySelectionsMap} from "../../utils/taxonomyTree.ts";

export interface DigitalSolutionFormValues {
    id?: string;
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
    solutionPresentedByUser?: boolean;
    hasAcceptedTerms: boolean;
    hasAcceptedPrivacyPolicy: boolean;
    readyForOperation?: string;
    createdAtOverride?: string;
    createdAt?: string;
    state?: DigitalSolutionState;

    publishedBy?: PublishedByType;
    publishedAt?: string;
    publishedSource?: string;

    //Images
    titleImage: UploadFile[];
    detailImages: UploadFile[];

    //Ids
    userId?: string;
    organizationId?: string;
    projectPartnerIds: string[];
    solutionUserIds: string[];
    taxonomyNodeIds: string[];
    presentedByUserId: string;

    // Relationen
    user?: UserBaseDto;
    presentedByUser?: UserFullDto;
    organization?: OrganizationBaseDto;
    projectPartners?: OrganizationBaseDto[];
    solutionUsers?: OrganizationBaseDto[];
    taxonomySelections?: TaxonomySelectionsMap;
}