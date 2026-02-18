import { prisma } from '../../prisma/prisma';
import { logService } from '../logger/loggerService';
import type { LisaFilters } from '../lisa/lisaService';

export async function resolveTaxonomyNodeIds(filters: LisaFilters): Promise<string[]> {
  const searchTerms: string[] = [];

  if (filters.lösungskategorie) searchTerms.push(...filters.lösungskategorie);
  if (filters.anwendungsbereich) searchTerms.push(...filters.anwendungsbereich);
  if (filters.aufgabenbereich) searchTerms.push(...filters.aufgabenbereich);
  if (filters.technischer_bereich) searchTerms.push(...filters.technischer_bereich);
  if (filters.digitalisierung) searchTerms.push(...filters.digitalisierung);

  if (searchTerms.length === 0) return [];

  logService.info('Mapping filter terms to taxonomy nodes', { searchTerms });

  const taxonomyNodes = await prisma.taxonomyNode.findMany({
    where: {
      OR: [
        ...searchTerms.map(term => ({ nameDe: { contains: term } })),
        ...searchTerms.map(term => ({ slug: { contains: term.toLowerCase().replace(/\s+/g, '-') } })),
        ...searchTerms.map(term => ({ nameEn: { contains: term } }))
      ]
    },
    select: {
      id: true,
      nameDe: true,
      slug: true,
      type: true
    }
  });

  const nodeIds = taxonomyNodes.map(node => node.id);

  logService.info('Mapped taxonomy nodes', {
    foundCount: nodeIds.length,
    nodes: taxonomyNodes.map(n => ({ id: n.id, name: n.nameDe, type: n.type }))
  });

  return nodeIds;
}
