import { prisma } from "../prisma/prisma";
import { Request, Response } from "express";
import logger from "../config/loggerConfig";
// import {UsingOrganizationDto, toUserDto} from "../shared/dtos/UsingOrganizationDto";

const logError = (...args: unknown[]) => {
  logger.error("admin.controller error", { details: args });
};

export const getUnverifiedUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        accountState: {
          in: ["VERIFY_EMAIL", "REGISTRATION_REVOKED"],
        },
      },
      select: {
        id: true,
        accountState: true,
        organization: {
          select: { name: true, organizationType: true, zip: true },
        },
      },
    });

    res.status(200).json(users);
  } catch (error) {
    logError("Fehler beim Laden der Benutzer:", error);
    res.status(500).json({ error: "Fehler beim Laden der Benutzer" });
  }
};

export const getRegisteredUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        accountState: "REGISTERED",
        role: "USER",
      },
    });

    res.status(200).json(users);
  } catch (error) {
    logError("Error loading all registered users:", error);
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
    logError("Error loading all admins and moderators:", error);
    res.status(500).json({ error: "Error loading all admins and moderators" });
  }
};
