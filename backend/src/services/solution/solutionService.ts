import { prisma } from '../../prisma/prisma';
import { logService } from '../logger/loggerService';
import type { LisaFilters } from '../lisa/lisaService';
import { resolveTaxonomyNodeIds } from '../taxonomy/taxonomyService';

export interface DigitalSolutionFilter {
  taxonomyNodeIds: string[];
}

export interface DigitalSolutionResult {
  id: string;
  name: string | null;
  link: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  state: string;
  organizationId: string | null;
  taxonomyNodes?: {
    taxonomyNode: {
      id: string;
      nameDe: string;
      type: string;
    };
  }[];
}

export async function mapFiltersToTaxonomyIds(filters: LisaFilters): Promise<string[]> {
  try {
    return await resolveTaxonomyNodeIds(filters);
  } catch (error) {
    logService.error('Error mapping filters to taxonomy IDs:', error as Error);
    throw error;
  }
}

export async function findSolutionsByTaxonomy(
  taxonomyNodeIds: string[]
): Promise<DigitalSolutionResult[]> {
  try {
    if (taxonomyNodeIds.length === 0) {
      logService.info('No taxonomy filters provided, returning all active solutions');
      return await getAllActiveSolutions();
    }

    logService.info('Querying solutions by taxonomy', { taxonomyNodeIds });

    const solutions = await prisma.digitalSolution.findMany({
      where: {
        state: 'ACTIVATED',
        taxonomyNodes: {
          some: {
            taxonomyNodeId: {
              in: taxonomyNodeIds
            }
          }
        }
      },
      include: {
        taxonomyNodes: {
          include: {
            taxonomyNode: {
              select: {
                id: true,
                nameDe: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    logService.info('Solutions found', { count: solutions.length });

    return solutions;
  } catch (error) {
    logService.error('Error finding solutions by taxonomy:', error as Error);
    throw error;
  }
}

/**
 * Gets all active digital solutions (fallback when no filters)
 */
export async function getAllActiveSolutions(limit: number = 20): Promise<DigitalSolutionResult[]> {
  try {
    const solutions = await prisma.digitalSolution.findMany({
      where: {
        state: 'ACTIVATED'
      },
      include: {
        taxonomyNodes: {
          include: {
            taxonomyNode: {
              select: {
                id: true,
                nameDe: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return solutions;
  } catch (error) {
    logService.error('Error getting all active solutions:', error as Error);
    throw error;
  }
}

/**
 * Gets a single digital solution by ID
 */
export async function getSolutionById(id: string): Promise<DigitalSolutionResult | null> {
  try {
    const solution = await prisma.digitalSolution.findUnique({
      where: { id },
      include: {
        taxonomyNodes: {
          include: {
            taxonomyNode: {
              select: {
                id: true,
                nameDe: true,
                type: true
              }
            }
          }
        }
      }
    });

    return solution;
  } catch (error) {
    logService.error('Error getting solution by ID:', error as Error);
    throw error;
  }
}

/**
 * Orchestrates the full filter-to-solutions flow
 */
export async function findSolutionsFromLisaFilters(
  filters: LisaFilters
): Promise<DigitalSolutionResult[]> {
  try {
    const taxonomyNodeIds = await resolveTaxonomyNodeIds(filters);

    const solutions = await findSolutionsByTaxonomy(taxonomyNodeIds);

    return solutions;
  } catch (error) {
    logService.error('Error in findSolutionsFromLisaFilters:', error as Error);
    throw error;
  }
}
