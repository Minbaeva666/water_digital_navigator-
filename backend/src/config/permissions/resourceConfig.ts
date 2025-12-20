import {prisma} from "../../prisma/prisma";

export type AllowedResource =
  | "user"
  | "organization"
  | "digital_solution"
  | "faq"
  | "termsOfUse"
  | "privacyPolicy"
  | "accessibilityStatement"
  | "imprintStatement"
  | "publicPdf"
  | "expert_video"; 

export interface ResourceConfig {
  model: {
    findUnique: (args: {
      where: { id: string };
      select: Record<string, boolean>;
    }) => Promise<any | null>;
  };
  ownerField: string;
  idParam?: string;
}

export const RESOURCE_CONFIG: Record<AllowedResource, ResourceConfig> = {
  user: {
    model: prisma.user,
    ownerField: "id",
    idParam: "id",
  },
  organization: {
    model: prisma.organization,
    ownerField: "ownerId",
    idParam: "id",
  },
  digital_solution: {
    model: prisma.digitalSolution,
    ownerField: "presentedByUserId",
    idParam: "id",
  },
  faq: {
    model: prisma.faq,
    ownerField: "ownerId", 
    idParam: "id",        
  },
  termsOfUse: {
    model: prisma.termsOfUse,
    ownerField: "ownerId",
    idParam: "id",
  },
  privacyPolicy: {
    model: prisma.privacyPolicy,
    ownerField: "ownerId",
    idParam: "id",
  },
  accessibilityStatement: {
    model: prisma.accessibilityStatement,
    ownerField: "ownerId",
    idParam: "id",
  },
  imprintStatement: {
    model: prisma.imprintStatement,
    ownerField: "ownerId",
    idParam: "id",
  },
  publicPdf: {
    model: prisma.publicPdf,
    ownerField: "ownerId",
    idParam: "id",
  },
  expert_video: {
    model: prisma.expertVideo,
    ownerField: "ownerId", 
    idParam: "id",
  },
};
