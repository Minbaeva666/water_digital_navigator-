import {prisma} from "../prisma/prisma";
import { Request, Response } from "express";
// import {UsingOrganizationDto, toUserDto} from "../shared/dtos/UsingOrganizationDto";


export const getUnverifiedUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
  where: { accountState: "VERIFY_EMAIL" },
  select: {
    id: true,
    accountState: true,
    organization: {
      select: { name: true, organizationType: true, zip: true,}
    }
  }
});

        res.status(200).json(users);
    } catch (error) {
        console.error("Fehler beim Laden der Benutzer:", error);
        res.status(500).json({ error: "Fehler beim Laden der Benutzer" });
    }
};

export const getRegisteredUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            where: {
                accountState: "REGISTERED",
                role: "USER"
            },
        });

        res.status(200).json(users);
    } catch (error) {
        console.error("Error loading all registered users:", error);
        res.status(500).json({ error: "Error loading all registered users" });
    }
};

export const getModerators = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: "ADMIN",
            },
        });

        res.status(200).json(users);
    } catch (error) {
        console.error("Error loading all admins and moderators:", error);
        res.status(500).json({ error: "Error loading all admins and moderators" });
    }
};