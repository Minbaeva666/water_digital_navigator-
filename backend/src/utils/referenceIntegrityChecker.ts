import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Referential Integrity Checker
 * Validates that entities can be safely deleted before removal
 */

// ============================================================================
// USER DELETION CHECKS
// ============================================================================

export const checkUserReferences = async (userId: string) => {
    const references = {
        ownedSolutions: 0,
        createdOrganizations: 0,
        createdUsers: 0,
        presentedSolutions: 0,
        moderatedUsers: 0,
    };

    const [solutions, orgs, createdUsers, presentedSolutions, moderatedUsers] = await Promise.all([
        prisma.digitalSolution.count({ where: { userId } }),
        prisma.organization.count({ where: { createdById: userId } }),
        prisma.user.count({ where: { createdById: userId } }),
        prisma.digitalSolution.count({ where: { presentedByUserId: userId } }),
        prisma.user.count({ where: { /* TODO: Replace with correct moderator field name from your schema */ } }),
    ]);

    references.ownedSolutions = solutions;
    references.createdOrganizations = orgs;
    references.createdUsers = createdUsers;
    references.presentedSolutions = presentedSolutions;
    references.moderatedUsers = moderatedUsers;

    const hasReferences = Object.values(references).some(count => count > 0);

    return {
        hasReferences,
        references,
        message: hasReferences
            ? `Deletion is not possible, this user is already in use. ` +
              `Solutions owned: ${solutions}, Organizations created: ${orgs}, ` +
              `Users created: ${createdUsers}, Solutions presented: ${presentedSolutions}, ` +
              `Users moderated: ${moderatedUsers}`
            : null,
    };
};

// ============================================================================
// ORGANIZATION DELETION CHECKS
// ============================================================================

export const checkOrganizationReferences = async (organizationId: string) => {
    const references = {
        users: 0,
        solutions: 0,
        municipalityProfile: false,
    };

    const [users, solutions, municipality] = await Promise.all([
        prisma.user.count({ where: { organizationId } }),
        prisma.digitalSolution.count({ where: { organizationId } }),
        prisma.municipalityProfile.findFirst({ where: { organizationId } }),
    ]);

    references.users = users;
    references.solutions = solutions;
    references.municipalityProfile = !!municipality;

    const hasReferences = Object.values(references).some(val => 
        typeof val === 'number' ? val > 0 : val === true
    );

    return {
        hasReferences,
        references,
        message: hasReferences
            ? `Deletion is not possible, this organization is already in use. ` +
              `Users assigned: ${users}, Digital solutions: ${solutions}, ` +
              `Municipality profile exists: ${municipality ? 'yes' : 'no'}`
            : null,
    };
};

// ============================================================================
// TAXONOMY NODE DELETION CHECKS
// ============================================================================

export const checkTaxonomyNodeReferences = async (nodeId: string) => {
    const references = {
        childNodes: 0,
        usedInSolutions: 0,
        hasChildren: false,
    };

    const [childCount, solutionCount, children] = await Promise.all([
        prisma.taxonomyNode.count({ where: { parentId: nodeId } }),
        prisma.digitalSolutionTaxonomy.count({ where: { taxonomyNodeId: nodeId } }),
        prisma.taxonomyNode.findMany({ where: { parentId: nodeId }, select: { id: true } }),
    ]);

    references.childNodes = childCount;
    references.usedInSolutions = solutionCount;
    references.hasChildren = childCount > 0;

    const hasReferences = references.childNodes > 0 || references.usedInSolutions > 0;

    return {
        hasReferences,
        references,
        message: hasReferences
            ? `Deletion is not possible, this taxonomy node is already in use. ` +
              `Child nodes: ${childCount}, Used in ${solutionCount} digital solution(s)`
            : null,
    };
};

// ============================================================================
// REGION DELETION CHECKS
// ============================================================================

export const checkRegionReferences = async (regionId: string) => {
    const references = {
        organizations: 0,
    };

    const orgs = await prisma.organization.count({ where: { regionId } });
    references.organizations = orgs;

    const hasReferences = orgs > 0;

    return {
        hasReferences,
        references,
        message: hasReferences
            ? `Deletion is not possible, this region is already in use. ` +
              `${orgs} organization(s) assigned to this region`
            : null,
    };
};

// ============================================================================
// COUNTRY DELETION CHECKS
// ============================================================================

export const checkCountryReferences = async (countryCode: string) => {
    const references = {
        organizations: 0,
        regions: 0,
    };

    const [orgs, regions] = await Promise.all([
        prisma.organization.count({ where: { countryId: countryCode } }),
        prisma.region.count({ where: { countryId: countryCode } }),
    ]);

    references.organizations = orgs;
    references.regions = regions;

    const hasReferences = orgs > 0 || regions > 0;

    return {
        hasReferences,
        references,
        message: hasReferences
            ? `Deletion is not possible, this country is already in use. ` +
              `${orgs} organization(s) and ${regions} region(s) use this country`
            : null,
    };
};

// ============================================================================
// EXPERT VIDEO DELETION CHECKS
// ============================================================================

export const checkExpertVideoReferences = async (videoId: string) => {
    const references = {
        authors: 0,
    };

    const authors = await prisma.expertVideoAuthor.count({ where: { expertVideoId: videoId } });
    references.authors = authors;

    const hasReferences = authors > 0;

    return {
        hasReferences,
        references,
        message: hasReferences
            ? `Deletion is not possible, this video is already in use. ` +
              `${authors} author(s) assigned to this video`
            : null,
    };
};

// ============================================================================
// GENERIC REFERENCE CHECK HELPER
// ============================================================================

export interface ReferenceCheckConfig {
    entityName: string;
    checks: Array<{
        name: string;
        count: number;
    }>;
}

/**
 * Generic function to build a reference check result
 */
export const buildReferenceCheckResult = (config: ReferenceCheckConfig) => {
    const references = Object.fromEntries(
        config.checks.map(check => [check.name, check.count])
    );

    const hasReferences = config.checks.some(check => check.count > 0);

    const details = config.checks
        .filter(check => check.count > 0)
        .map(check => `${check.name}: ${check.count}`)
        .join(", ");

    return {
        hasReferences,
        references,
        message: hasReferences
            ? `Deletion is not possible, this ${config.entityName} is already in use. ${details}`
            : null,
    };
};
