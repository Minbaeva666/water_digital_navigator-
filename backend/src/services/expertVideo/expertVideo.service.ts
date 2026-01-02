import { prisma } from "../../prisma/prisma";
import { ExpertVideo, ExpertVideoAuthor } from "@prisma/client";

// ---------- DTOs (backend <-> frontend) ----------

export interface ExpertAuthorDto {
  name: string;
  url?: string;
}

export interface ExpertVideoCreateDto {
  title: string;
  description?: string;
  publishedAt?: string;

  // NEW multi-author API
  authors?: ExpertAuthorDto[];

  // legacy fields (can still be used by old clients, optional)
  authorName?: string;
  authorUrl?: string;

  videoUrl: string;
  isActive?: boolean;
}

export type ExpertVideoUpdateDto = Partial<ExpertVideoCreateDto>;

// What we send back to frontend (matches your ExpertVideoDto)
export interface ExpertVideoResponseDto {
  id: string;
  title: string;
  description?: string;
  publishedAt?: string;

  authors?: ExpertAuthorDto[];

  // legacy, for compatibility if you still use them somewhere
  authorName?: string;
  authorUrl?: string;

  videoUrl: string;
  thumbnailUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------- helpers ----------

const parseDate = (value?: string | null): Date | undefined => {
  if (!value) return undefined;
  const d = new Date(value);
  if (isNaN(d.getTime())) return undefined;
  return d;
};

type ExpertVideoWithAuthors = ExpertVideo & { authors: ExpertVideoAuthor[] };

const mapExpertVideoToDto = (
  video: ExpertVideoWithAuthors
): ExpertVideoResponseDto => {
  const sortedAuthors = [...video.authors].sort(
    (a, b) => a.order - b.order
  );

  const authors: ExpertAuthorDto[] = sortedAuthors.map((a) => ({
    name: a.name,
    url: a.url ?? undefined,
  }));

  // legacy fallback – first author or undefined
  const legacyAuthor = authors[0];

  return {
    id: video.id,
    title: video.title,
    description: video.description ?? undefined,
    publishedAt: video.publishedAt
      ? video.publishedAt.toISOString()
      : undefined,

    authors,

    authorName: legacyAuthor?.name,
    authorUrl: legacyAuthor?.url,

    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl ?? undefined,
    isActive: video.isActive,
    createdAt: video.createdAt.toISOString(),
    updatedAt: video.updatedAt.toISOString(),
  };
};

// ---------- Service ----------

export const ExpertVideoService = {
  async list(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [total, items] = await Promise.all([
      prisma.expertVideo.count(),
      prisma.expertVideo.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          authors: true,
        },
      }),
    ]);

    return {
      total,
      items: items.map(mapExpertVideoToDto),
      page,
      pageSize,
    };
  },

  async getById(id: string): Promise<ExpertVideoResponseDto | null> {
    const video = await prisma.expertVideo.findUnique({
      where: { id },
      include: { authors: true },
    });

    return video ? mapExpertVideoToDto(video) : null;
  },

  async create(data: ExpertVideoCreateDto): Promise<ExpertVideoResponseDto> {
    if (!data.title || !data.videoUrl) {
      throw new Error("title and videoUrl are required");
    }

    // Prefer authors[] from payload. If not given, fall back to legacy authorName/authorUrl.
    const authorsFromPayload: ExpertAuthorDto[] =
      data.authors && data.authors.length > 0
        ? data.authors
        : data.authorName
        ? [{ name: data.authorName, url: data.authorUrl }]
        : [];

    const created = await prisma.expertVideo.create({
      data: {
        title: data.title,
        description: data.description,
        publishedAt: parseDate(data.publishedAt),
        videoUrl: data.videoUrl,
        isActive: data.isActive ?? true,
        authors:
          authorsFromPayload.length > 0
            ? {
                create: authorsFromPayload.map((a, index) => ({
                  name: a.name,
                  url: a.url,
                  order: index,
                })),
              }
            : undefined,
      },
      include: {
        authors: true,
      },
    });

    return mapExpertVideoToDto(created);
  },

  async update(
    id: string,
    data: ExpertVideoUpdateDto
  ): Promise<ExpertVideoResponseDto> {
    // Decide if authors should be updated
    let authorsUpdate:
      | {
          deleteMany: {};
          create: { name: string; url?: string | null; order: number }[];
        }
      | undefined;

    if (data.authors !== undefined || data.authorName !== undefined || data.authorUrl !== undefined) {
      const authorsFromPayload: ExpertAuthorDto[] =
        data.authors && data.authors.length > 0
          ? data.authors
          : data.authorName
          ? [{ name: data.authorName, url: data.authorUrl }]
          : [];

      authorsUpdate = {
        deleteMany: {}, // remove all existing authors for this video
        create: authorsFromPayload.map((a, index) => ({
          name: a.name,
          url: a.url,
          order: index,
        })),
      };
    }

    const updated = await prisma.expertVideo.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.publishedAt !== undefined
          ? { publishedAt: parseDate(data.publishedAt) ?? null }
          : {}),
        ...(data.videoUrl !== undefined ? { videoUrl: data.videoUrl } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(authorsUpdate ? { authors: authorsUpdate } : {}),
      },
      include: {
        authors: true,
      },
    });

    return mapExpertVideoToDto(updated);
  },

  async delete(id: string): Promise<void> {
    await prisma.expertVideo.delete({ where: { id } });
  },

  async getLatest(limit: number): Promise<ExpertVideoResponseDto[]> {
    const videos = await prisma.expertVideo.findMany({
      where: { isActive: true },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        authors: true,
      },
    });

    return videos.map(mapExpertVideoToDto);
  },

  async updateThumbnailUrl(
    id: string,
    url: string
  ): Promise<ExpertVideoResponseDto> {
    const updated = await prisma.expertVideo.update({
      where: { id },
      data: { thumbnailUrl: url },
      include: { authors: true },
    });

    return mapExpertVideoToDto(updated);
  },
};