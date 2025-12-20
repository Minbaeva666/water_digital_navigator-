import { PrismaClient, Prisma, ExpertVideo } from "@prisma/client";

const prisma = new PrismaClient();

export const ExpertVideoModel = {
  async create(data: Prisma.ExpertVideoCreateInput): Promise<ExpertVideo> {
    return prisma.expertVideo.create({ data });
  },

  async getById(id: string): Promise<ExpertVideo | null> {
    return prisma.expertVideo.findUnique({ where: { id } });
  },

  async getAll(skip = 0, take = 20): Promise<ExpertVideo[]> {
    return prisma.expertVideo.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  },

  async countAll(): Promise<number> {
    return prisma.expertVideo.count();
  },

  async getLatest(limit = 4): Promise<ExpertVideo[]> {
    return prisma.expertVideo.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async update(
    id: string,
    data: Prisma.ExpertVideoUpdateInput
  ): Promise<ExpertVideo> {
    return prisma.expertVideo.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<ExpertVideo> {
    return prisma.expertVideo.delete({ where: { id } });
  },
};
