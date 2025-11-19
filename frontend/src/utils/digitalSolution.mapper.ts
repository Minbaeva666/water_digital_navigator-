import {DigitalSolutionBackendDto, DigitalSolutionWithRelationsDto} from "../types/dtos/DigitalSolutionDto.ts";

export function normalizeDigitalSolution(dto: DigitalSolutionBackendDto): DigitalSolutionWithRelationsDto {
    const taxonomyNodeIds = dto.taxonomyNodes?.map(x => x.taxonomyNodeId) ?? [];

    const titleImage = dto.images.find(img => img.type === "TITLE") ?? null;
    const detailImages = dto.images.filter(img => img.type === "DETAIL");

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
        efficiencyDescription: dto.efficiencyDescription,
        processDescription: dto.processDescription,
        socialRelevanceDescription: dto.socialRelevanceDescription,
        hasAcceptedTerms: dto.hasAcceptedTerms,
        hasAcceptedPrivacyPolicy: dto.hasAcceptedPrivacyPolicy,
        solutionPresentedByUser: dto.solutionPresentedByUser ?? null,
        state: dto.state,
        createdAt: dto.createdAt,
        createdAtOverride: dto.createdAtOverride,
        readyForOperation: dto.readyForOperation,
        organizationId: dto.organizationId,

        taxonomyNodeIds,
        presentedByUser: dto.presentedByUser,
        user: dto.user,
        projectPartners: dto.projectPartners,
        solutionUsers: dto.solutionUsers,
        organization: dto.organization,

        publishedBy: dto.publishedBy,
        publishedAt: dto.publishedAt,
        publishedSource: dto.publishedSource,

        titleImage,
        detailImages,
    };
}
