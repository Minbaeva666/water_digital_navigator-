import { prisma } from "../../prisma/prisma";
import { ExpertVideo } from "@prisma/client";

// то, что приходит из контроллера
export interface ExpertVideoCreateDto {
  title: string;
  description?: string;
  publishedAt?: string;  // ISO-строка или "YYYY-MM-DD"
  authorName?: string;
  authorUrl?: string;
  videoUrl: string;
  isActive?: boolean;
}

export interface ExpertVideoUpdateDto extends Partial<ExpertVideoCreateDto> {}

const parseDate = (value?: string | null): Date | undefined => {
  if (!value) return undefined;
  const d = new Date(value);
  if (isNaN(d.getTime())) return undefined;
  return d;
};

export const ExpertVideoService = {
  // список для админки, с пагинацией
  async list(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [total, items] = await Promise.all([
      prisma.expertVideo.count(),
      prisma.expertVideo.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",   // ← всегда последние по createdAt
        },
      }),
    ]);

    return { total, items, page, pageSize };
  },

  async getById(id: string): Promise<ExpertVideo | null> {
    return prisma.expertVideo.findUnique({ where: { id } });
  },

  async create(data: ExpertVideoCreateDto): Promise<ExpertVideo> {
    if (!data.title || !data.videoUrl) {
      throw new Error("title and videoUrl are required");
    }

    return prisma.expertVideo.create({
      data: {
        title: data.title,
        description: data.description,
        // createdAt НЕ трогаем → БД сама ставит now()
        publishedAt: parseDate(data.publishedAt), // сюда пишем дату публикации
        authorName: data.authorName,
        authorUrl: data.authorUrl,
        videoUrl: data.videoUrl,
        // thumbnailUrl пока пустая, заполнится после upload
        isActive: data.isActive ?? true,
      },
    });
  },

  async update(id: string, data: ExpertVideoUpdateDto): Promise<ExpertVideo> {
    return prisma.expertVideo.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.publishedAt !== undefined
          ? { publishedAt: parseDate(data.publishedAt) ?? null }
          : {}),
        ...(data.authorName !== undefined ? { authorName: data.authorName } : {}),
        ...(data.authorUrl !== undefined ? { authorUrl: data.authorUrl } : {}),
        ...(data.videoUrl !== undefined ? { videoUrl: data.videoUrl } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.expertVideo.delete({ where: { id } });
  },

  // для главной — только активные и отсортированные
  async getLatest(limit: number) {
    return prisma.expertVideo.findMany({
      where: { isActive: true },
      orderBy: {
        createdAt: "desc",   // ← тоже последние по createdAt
      },
      take: limit,
    });
  },

  // обновление thumbnailUrl после загрузки файла
  async updateThumbnailUrl(id: string, url: string): Promise<ExpertVideo> {
    return prisma.expertVideo.update({
      where: { id },
      data: { thumbnailUrl: url },
    });
  },
};
