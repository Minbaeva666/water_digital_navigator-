import {PrismaClient, Prisma, User} from "@prisma/client";

const prisma = new PrismaClient();

export const UserModel = {
    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data,
        });
    },

    async getUserById(id: string) {
        return prisma.user.findUnique({ where: { id } });
    },

    async getAllUsers() {
        return prisma.user.findMany();
    },

    async updateUser(id: string, data: Prisma.UserUpdateInput) {
        return prisma.user.update({ where: { id }, data });
    },

    async deleteUser(id: string) {
        return prisma.user.delete({ where: { id } });
    },

    async getUserByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    },

    async createUserWithTransaction(
        prismaClient: Prisma.TransactionClient,
        userData: Prisma.UserCreateInput
    ): Promise<User> {
        return prismaClient.user.create({
            data: userData,
        });
    }
};
