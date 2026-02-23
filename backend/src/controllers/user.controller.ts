import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import {
  AccountState,
  OrganizationState,
  OrganizationType,
  Prisma,
  PrismaClient,
  Role,
  SalutationType,
  TokenType,
} from "@prisma/client";
import bcrypt from "bcrypt";
import { sendResetPasswordEmail } from "../services/email/sendMail";
import { buildFrontendUrl } from "../utils/linkBuilder";
import { handleError } from "../utils/handleError";
import { resizeImageBuffer } from "../utils/image";
import { prepareOrganizationData } from "../helpers/organizationHelpers";
import { UserMinimalDto, UserWithOrganization } from "../types/user.types";
import { checkUserReferences } from "../utils/referenceIntegrityChecker";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const prisma = new PrismaClient();

// Hash token for storing/comparing with the tokenHash field in DB
const hashToken = (t: string) =>
  crypto.createHash("sha256").update(t).digest("hex");

export const resetPasswordRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  try {
    // 1) First find the user by email (without filtering by accountState)
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    // 2) If there is no user with that email → explicit error
    if (!user) {
      res.status(404).json({ error: "Account with this email does not exist." });
      return;
    }

    // 3) User exists but account is not complete (not REGISTERED)
    if (user.accountState !== AccountState.REGISTERED) {
      res.status(400).json({
        error:
          "Password reset is only possible for fully registered accounts. Please verify your email or contact support.",
        accountState: user.accountState,
      });
      return;
    }

    // 4) All good → create a reset password token
    const resetToken = crypto.randomBytes(32).toString("hex"); // raw token for email
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 Stunde gültig

    await prisma.token.create({
      data: {
        userId: user.id,
        tokenType: TokenType.PASSWORD_RESET_TOKEN,
        tokenHash: hashToken(resetToken),
        expiresAt,
      },
    });

    const resetLink = buildFrontendUrl(`/login/reset-password?token=${resetToken}`);

    try {
      await sendResetPasswordEmail(user, resetLink);

      res.status(201).json({ message: "Reset Password send", data: user });
      return;
    } catch (emailError) {
      console.error("Mailversand fehlgeschlagen:", emailError);
      res.status(500).json({
        error: "Fehler beim Versenden der Reset Passwort E-Mail.",
      });
      return;
    }
  } catch (error) {
    console.error("Reset password request error:", error);
    res.status(500).json({ error: "An internal server error occurred." });
    return;
  }
};


export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ error: "Token and new password are required." });
    return;
  }

  try {
    const tokenHash = hashToken(token);

    const resetPasswordToken = await prisma.token.findUnique({
      where: { tokenHash }, // tokenHash is marked @unique in the schema
      include: { user: true },
    });

    if (!resetPasswordToken || !resetPasswordToken.user) {
      res.status(400).json({ error: "Invalid or expired token." });
      return;
    }

    if (new Date() > resetPasswordToken.expiresAt) {
      res.status(400).json({ error: "Token has expired." });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetPasswordToken.userId },
        data: { password: hashedPassword },
      }),
      // delete record by token id (or use deleteMany by tokenHash & tokenType)
      prisma.token.delete({
        where: { id: resetPasswordToken.id },
      }),
    ]);

    res.status(200).json({ message: "Password successfully reset." });
    return;
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "An internal server error occurred." });
    return;
  }
};

export const getUsersByState = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const state = req.query.accountState as AccountState | undefined;

    if (!state) {
      res.status(200).json([]);
      return;
    }

    const where: any = { accountState: state };

    // Wenn state = REGISTERED, zusätzlich nur role = "user"
    if (state === AccountState.REGISTERED) {
      where.role = "USER";
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        organization: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Fehler beim Abrufen alles User:", error);
    res.status(500).json({ error: "Fehler beim Abrufen alles User" });
  }
};

export const getUsersByRoles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rolesRaw = req.query.role;
    let roles: Role[] | undefined;

    if (Array.isArray(rolesRaw)) {
      roles = (rolesRaw as string[]).map((r) => r as Role);
    } else if (typeof rolesRaw === "string") {
      roles = [rolesRaw as Role];
    } else {
      res.status(200).json([]);
      return;
    }

    const validRoles = Object.values(Role) as string[];
    const invalid = roles.filter((r) => !validRoles.includes(r));
    if (invalid.length > 0) {
      res.status(400).json({ error: `Ungültige Rolle(n): ${invalid.join(", ")}` });
      return;
    }

    const users = await prisma.user.findMany({
      where: { role: { in: roles } },
      include: { organization: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Fehler beim Abrufen alles User:", error);
    res.status(500).json({ error: "Fehler beim Abrufen alles User" });
  }
};

export const getUsersWithOrganizations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const usersWithOrg = await prisma.user.findMany({
      include: {
        organization: true, // Relation mitladen
      },
    });
    res.status(200).json(usersWithOrg); // korrekte Variable
  } catch (error) {
    console.error("Fehler beim Laden der Benutzer + Org:", error);
    res.status(500).json({ error: "Fehler beim Laden der Benutzer" });
  }
};

export const getUsersMinimal = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      // optional: nur aktive o.ä.
      // where: { deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        organizationId: true,
        organization: { select: { id: true, name: true } },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    const payload: UserMinimalDto[] = users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      organizationId: u.organizationId,
      organizationName: u.organization?.name ?? null,
    }));

    res.status(200).json(payload);
  } catch (error) {
    console.error("Fehler beim Laden der Benutzer:", error);
    res.status(500).json({ error: "Fehler beim Laden der Benutzer" });
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUserId = req.user?.id as string;
    const {
      salutationType,
      title,
      email,
      role,
      firstName,
      phonenumber,
      lastName,
      organizationId,
    } = req.body;

    const missing: string[] = [];
    if (!email) missing.push("email");
    if (!firstName) missing.push("firstName");
    if (!lastName) missing.push("lastName");
    if (!salutationType) missing.push("salutationType");
    if (!role) missing.push("role");

    if (missing.length > 0) {
      res.status(400).json({
        message: `Es fehlen erforderliche Felder: ${missing.join(", ")}.`,
      });
      return;
    }

    // 2) E-Mail-Unique prüfen
    const exists = await prisma.user.findUnique({
      where: { email },
    });
    if (exists) {
      res.status(409).json({ message: "Fehler: E-Mail ist bereits vergeben." });
      return;
    }

    const emailInUse = await prisma.user.findUnique({ where: { email } });
    if (emailInUse) {
      res.status(409).json({ message: "E-Mail ist bereits vergeben." });
      return;
    }

    // Passwort-Generierung …
    const generatedPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // User anlegen und optional Organisation verknüpfen
    const createdUser = await prisma.user.create({
      data: {
        role,
        salutationType,
        title,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phonenumber,
        hasAcceptedPrivacyPolicy: true,
        hasAcceptedTerms: true,
        accountState: AccountState.REGISTERED,
        createdBy: {
          connect: { id: currentUserId },
        },
        // Organisation nur connecten, wenn eine ID mitgeliefert wurde
        ...(organizationId && {
          organization: {
            connect: { id: organizationId },
          },
        }),
      },
      select: {
        role: true,
        id: true,
        salutationType: true,
        title: true,
        email: true,
        firstName: true,
        lastName: true,
        phonenumber: true,
        createdAt: true,
        accountState: true,
        hasAcceptedTerms: true,
        hasAcceptedPrivacyPolicy: true,
      },
    });

    res.status(201).json(createdUser);
  } catch (error: any) {
    next(error);
  }
};

export const createColleagueInMyOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const currentOrganizationId = req.user?.organizationId;

    if (!currentUserId) {
      res.status(401).json({ message: "Nicht authentifiziert." });
      return;
    }

    const {
      salutationType,
      title,
      email,
      firstName,
      phonenumber,
      lastName,
    } = req.body as {
      salutationType?: string;
      title?: string;
      email?: string;
      firstName?: string;
      phonenumber?: string;
      lastName?: string;
    };

    const normalizedEmail = (email ?? "").trim().toLowerCase();
    const normalizedFirstName = (firstName ?? "").trim();
    const normalizedLastName = (lastName ?? "").trim();

    const missing: string[] = [];
    if (!salutationType) missing.push("salutationType");
    if (!normalizedFirstName) missing.push("firstName");
    if (!normalizedLastName) missing.push("lastName");
    if (!normalizedEmail) missing.push("email");

    if (missing.length > 0) {
      res.status(400).json({
        message: `Es fehlen erforderliche Felder: ${missing.join(", ")}.`,
      });
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      res.status(409).json({ message: "E-Mail ist bereits vergeben." });
      return;
    }

    const generatedPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const createdUser = await prisma.user.create({
      data: {
        role: Role.USER,
        salutationType: salutationType as SalutationType,
        title: title?.trim() || undefined,
        email: normalizedEmail,
        password: hashedPassword,
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        phonenumber: phonenumber?.trim() || undefined,
        hasAcceptedPrivacyPolicy: true,
        hasAcceptedTerms: true,
        accountState: AccountState.REGISTERED,
        createdBy: {
          connect: { id: currentUserId },
        },
        ...(currentOrganizationId
          ? {
              organization: {
                connect: { id: currentOrganizationId },
              },
            }
          : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        organizationId: true,
        organization: { select: { name: true } },
      },
    });

    res.status(201).json({
      id: createdUser.id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      organizationId: createdUser.organizationId,
      organizationName: createdUser.organization?.name ?? null,
    });
  } catch (error) {
    next(error);
  }
};

export const createUserWithOrganization = async (
  req: MulterRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = req.user?.id as string;

    // 1) User-Payload
    const {
      salutationType,
      title,
      email,
      firstName,
      phonenumber,
      lastName,
      role,
    } = req.body;

    // 2) Organization JSON parsen
    type OrgPayload = {
      organizationState: OrganizationState;
      name: string;
      email: string;
      street: string;
      zip: string;
      city: string;
      countryCode: string; // ISO-3166-1 (z. B. "DE")
      regionId?: string | null; // optional
      organizationType: string;
      website?: string;
    };

    let orgPayload: OrgPayload;
    try {
      orgPayload =
        typeof req.body.organization === "string"
          ? JSON.parse(req.body.organization)
          : (req.body.organization as OrgPayload);
    } catch {
      res
        .status(400)
        .json({ message: 'Ungültiges JSON im Feld "organization".' });
      return;
    }

    // 3) Pflicht-Felder prüfen (User)
    const missingUser: string[] = [];
    if (!email) missingUser.push("email");
    if (!firstName) missingUser.push("firstName");
    if (!lastName) missingUser.push("lastName");
    if (!salutationType) missingUser.push("salutationType");
    if (!role) missingUser.push("role");
    if (missingUser.length) {
      res.status(400).json({
        message: `User-Pflichtfeld${
          missingUser.length > 1 ? "er" : ""
        } fehlen: ${missingUser.join(", ")}`,
      });
      return;
    }

    // 4) Pflicht-Felder prüfen (Org)
    const requiredOrgFields: (keyof OrgPayload)[] = [
      "name",
      "email",
      "street",
      "zip",
      "city",
      "countryCode",
      "organizationType",
    ];
    const missingOrg = requiredOrgFields.filter((f) => {
      const v = (orgPayload as any)[f];
      return v === undefined || String(v).trim() === "";
    });
    if (missingOrg.length) {
      res.status(400).json({
        message: `Org-Pflichtfeld${
          missingOrg.length > 1 ? "er" : ""
        } fehlen: ${missingOrg.join(", ")}`,
      });
      return;
    }

    // 5) Region gehört zum Land?
    if (orgPayload.regionId) {
      const region = await prisma.region.findUnique({
        where: { id: orgPayload.regionId },
        select: { countryId: true },
      });
      if (!region || region.countryId !== orgPayload.countryCode) {
        res
          .status(400)
          .json({ message: "Region passt nicht zum ausgewählten Land." });
        return;
      }
    }

    // 6) Logo-Upload Pflicht
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "Ein Logo-File ist erforderlich." });
      return;
    }

    // 7) Duplicate-Checks
    if (await prisma.user.findUnique({ where: { email } })) {
      res
        .status(409)
        .json({ message: `Die User-E-Mail ${email} ist bereits vergeben.` });
      return;
    }
    if (
      await prisma.organization.findFirst({ where: { name: orgPayload.name } })
    ) {
      res
        .status(409)
        .json({ message: `Der Organisationsname ${orgPayload.name} existiert bereits.` });
      return;
    }
    if (
      await prisma.organization.findFirst({ where: { email: orgPayload.email } })
    ) {
      res
        .status(409)
        .json({ message: `Die Organisations-E-Mail ${orgPayload.email} existiert bereits.` });
      return;
    }

    // 8) Logo verarbeiten
    const resizedBuffer = await resizeImageBuffer(file.buffer);
    const logoMimeType = file.mimetype;

    // 9) Passwort generieren & hashen
    const rawPw = crypto.randomBytes(6).toString("hex");
    const pwHash = await bcrypt.hash(rawPw, 10);

    // 10) Org-CreateInput vorbereiten (inkl. Country/Region Connect + Logo)
    const orgCreateData = await prepareOrganizationData(
      {
        organizationState: orgPayload.organizationState,
        name: orgPayload.name,
        email: orgPayload.email,
        street: orgPayload.street,
        zip: orgPayload.zip,
        city: orgPayload.city,
        countryCode: orgPayload.countryCode,
        regionId: orgPayload.regionId ?? null,
        organizationType: orgPayload.organizationType as OrganizationType,
        website: orgPayload.website ?? "",
        createdBy: { connect: { id: currentUserId } },
      },
      resizedBuffer,
      logoMimeType
    );

    // 11) Transaktion: User + (nested) Organization anlegen
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          salutationType: salutationType || undefined,
          title: title || undefined,
          email,
          firstName,
          lastName,
          password: pwHash,
          phonenumber: phonenumber || undefined,
          hasAcceptedPrivacyPolicy: true,
          hasAcceptedTerms: true,
          accountState: AccountState.REGISTERED,
          role,
          createdBy: { connect: { id: currentUserId } },
          organization: { create: orgCreateData },
        },
        include: { organization: true },
      });

      return user as UserWithOrganization;
    });

    // TODO: rawPw per E-Mail versenden, falls gewünscht.

    res.status(201).json({
      user: result,
      message: "User und Organisation erfolgreich angelegt.",
    });
  } catch (error) {
    console.error("Fehler beim Erstellen von User mit neuer Organisation:", error);
    return next(error);
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        organization: {},
      },
    });

    if (!user) {
      res.status(404).json({ error: "User nicht gefunden" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(`Fehler beim Abrufen des Users mit ID ${id}:`, error);
    res.status(500).json({ error: "Fehler beim Laden des Users" });
  }
};

export const getUserMinimal = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "User nicht gefunden" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(`Fehler beim Abrufen des Users mit ID ${id}:`, error);
    res.status(500).json({ error: "Fehler beim Laden des Users" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.id;
  const {
    salutationType,
    title,
    email,
    firstName,
    phonenumber,
    lastName,
    role,
    accountState,
    organizationId, // kann undefined | string | null sein
  } = req.body;

  // 1) Pflichtfelder prüfen
  const missingFields: string[] = [];
  if (!email) missingFields.push("email");
  if (!firstName) missingFields.push("firstName");
  if (!lastName) missingFields.push("lastName");
  if (!role) missingFields.push("role");
  if (missingFields.length > 0) {
    res
      .status(400)
      .json({ message: `Pflichtfelder fehlen: ${missingFields.join(", ")}` });
    return;
  }

  try {
    // 2) E-Mail-Unique prüfen
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing && existing.id !== userId) {
      res
        .status(409)
        .json({ message: "Die angegebene E-Mail wird bereits verwendet." });
      return;
    }

    // 3) Update-Payload nur mit übergebenen Feldern bauen
    const hasOrgField = Object.prototype.hasOwnProperty.call(
      req.body,
      "organizationId"
    );

    const payload: Prisma.UserUpdateInput = {
      firstName,
      lastName,
      email,
      role,
      ...(salutationType !== undefined && { salutationType }),
      ...(accountState !== undefined && { accountState }),
      ...(title !== undefined && { title }),
      ...(phonenumber !== undefined && { phonenumber }),
      ...(hasOrgField && { organizationId }), // darf auch null sein
    };

    const unsetSolutionsOrg = hasOrgField && req.body.organizationId === null;

    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: userId },
        data: payload,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          salutationType: true,
          title: true,
          phonenumber: true,
          accountState: true,
          createdAt: true,
          updatedAt: true,
          organizationId: true,
        },
      });

      if (unsetSolutionsOrg) {
        // Wichtig: Org an Solutions entfernen UND solutionPresentedByUser = true setzen
        await tx.digitalSolution.updateMany({
          where: { presentedByUserId: userId },
          data: {
            organizationId: null,
            solutionPresentedByUser: true,
          },
        });
      }

      // (Optional – falls beim Setzen einer neuen Orga die Solutions "umgehängt" werden sollen):
      // if (hasOrgField && typeof organizationId === "string") {
      //   await tx.digitalSolution.updateMany({
      //     where: { presentedByUserId: userId },
      //     data: {
      //       organizationId,
      //       solutionPresentedByUser: false,
      //     },
      //   });
      // }

      return u;
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(`Fehler beim Aktualisieren des Users mit ID ${userId}:`, error);
    handleError(error, next);
  }
};

export const updateUserWithCreateOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.id;
  const currentUserId = req.user?.id as string;

  // 1) User-Felder aus Body
  const {
    salutationType,
    title,
    email,
    firstName,
    phonenumber,
    lastName,
    role,
  } = req.body;

  // 2) Organization-Payload parsen
  type OrgPayload = {
    organizationState: OrganizationState;
    name: string;
    email: string;
    street: string;
    zip: string;
    city: string;
    countryCode: string; // ISO-3166-1 (z. B. "DE")
    regionId?: string | null; // optional
    organizationType: string;
    website?: string;
  };

  let orgPayload: OrgPayload;
  try {
    orgPayload =
      typeof req.body.organization === "string"
        ? JSON.parse(req.body.organization)
        : (req.body.organization as OrgPayload);
  } catch {
    res
      .status(400)
      .json({ message: 'Ungültiges JSON im Feld "organization".' });
    return;
  }

  // 3) Pflichtfelder prüfen (User)
  const missingUser: string[] = [];
  if (!email) missingUser.push("email");
  if (!firstName) missingUser.push("firstName");
  if (!lastName) missingUser.push("lastName");
  if (!salutationType) missingUser.push("salutationType");
  if (!role) missingUser.push("role");
  if (missingUser.length) {
    res.status(400).json({
      message: `User-Pflichtfeld${
        missingUser.length > 1 ? "er" : ""
      } fehlen: ${missingUser.join(", ")}`,
    });
    return;
  }

  // 4) Pflichtfelder prüfen (Org)
  const requiredOrgFields: (keyof OrgPayload)[] = [
    "name",
    "email",
    "street",
    "zip",
    "city",
    "countryCode",
    "organizationType",
  ];
  const missingOrg = requiredOrgFields.filter((f) => {
    const v = (orgPayload as any)[f];
    return v === undefined || String(v).trim() === "";
  });
  if (missingOrg.length) {
    res.status(400).json({
      message: `Org-Pflichtfeld${
        missingOrg.length > 1 ? "er" : ""
      } fehlen: ${missingOrg.join(", ")}`,
    });
    return;
  }

  try {
    // 5) E-Mail-Check (User): darf nicht bei anderem User vergeben sein
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing && existing.id !== userId) {
      res
        .status(409)
        .json({ message: "Die angegebene E-Mail wird bereits verwendet." });
      return;
    }

    // 6) Region gehört zum Land?
    if (orgPayload.regionId) {
      const region = await prisma.region.findUnique({
        where: { id: orgPayload.regionId },
        select: { countryId: true },
      });
      if (!region || region.countryId !== orgPayload.countryCode) {
        res
          .status(400)
          .json({ message: "Region passt nicht zum ausgewählten Land." });
        return;
      }
    }

    // 7) Logo prüfen
    if (!req.file) {
      res.status(400).json({ message: "Logo-Datei (req.file) fehlt" });
      return;
    }

    // 8) Duplicates (Organization)
    if (
      await prisma.organization.findFirst({ where: { name: orgPayload.name } })
    ) {
      res
        .status(409)
        .json({ message: `Der Organisationsname ${orgPayload.name} existiert bereits.` });
      return;
    }
    if (
      await prisma.organization.findFirst({ where: { email: orgPayload.email } })
    ) {
      res
        .status(409)
        .json({ message: `Die Organisations-E-Mail ${orgPayload.email} existiert bereits.` });
      return;
    }

    // 9) Logo verarbeiten
    let resizedBuffer: Buffer;
    try {
      resizedBuffer = await resizeImageBuffer(req.file.buffer);
    } catch (imgErr) {
      console.error("Fehler beim Skalieren des Logos:", imgErr);
      res.status(500).json({ message: "Logo-Verarbeitung fehlgeschlagen" });
      return;
    }
    const logoMimeType = req.file.mimetype;

    // 10) Org-CreateInput vorbereiten (inkl. Country/Region Connect + Logo)
    const orgCreateData = await prepareOrganizationData(
      {
        organizationState: orgPayload.organizationState,
        name: orgPayload.name,
        email: orgPayload.email,
        street: orgPayload.street,
        zip: orgPayload.zip,
        city: orgPayload.city,
        countryCode: orgPayload.countryCode,
        regionId: orgPayload.regionId ?? null,
        organizationType: orgPayload.organizationType,
        website: orgPayload.website ?? "",
        createdBy: { connect: { id: userId || currentUserId } },
      },
      resizedBuffer,
      logoMimeType
    );

    // 11) Transaktion: User updaten + neue Organization anlegen (nested)
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          salutationType: salutationType || undefined,
          title: title || undefined,
          email,
          firstName,
          lastName,
          phonenumber: phonenumber || undefined,
          role,
          organization: { create: orgCreateData }, // neue Org wird erstellt & verknüpft
        },
        include: { organization: true },
      });

      return updatedUser;
    });

    // 12) Antwort
    res.status(200).json(result);
  } catch (error) {
    console.error(
      "Fehler beim Aktualisieren des Users + Anlegen neuer Organisation:",
      error
    );
    handleError(error, next);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params as { id?: string };

  if (!id) {
    res.status(400).json({ error: "userId fehlt." });
    return;
  }

  try {
    // 1) Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!user) {
      res.status(404).json({ error: "User nicht gefunden." });
      return;
    }

    // 2) CHECK REFERENCES BEFORE DELETION
    const refCheck = await checkUserReferences(id);
    
    if (refCheck.hasReferences) {
      res.status(409).json({
        error: "Löschen nicht möglich, dieser Benutzer ist bereits in Gebrauch.",
        details: {
          userId: id,
          userEmail: user.email,
          references: refCheck.references,
          message: refCheck.message,
        },
        suggestion: "Bitte heben Sie die Zuordnungen auf, bevor Sie löschen.",
      });
      return;
    }

    // 3) SAFE TO DELETE - No references found
    await prisma.$transaction(async (tx) => {
      // Clean up any tokens associated with this user
      await tx.token.deleteMany({
        where: { userId: id },
      });
      
      // Delete the user
      await tx.user.delete({
        where: { id },
      });
    });

    res.status(200).json({ 
      message: "User erfolgreich gelöscht.",
      deletedUser: {
        id,
        email: user.email,
      }
    });
  } catch (error) {
    console.error(`Fehler beim Löschen des Users ${id}:`, error);

    // Handle database constraint errors as fallback
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003" || error.code === "P2014") {
        res.status(409).json({
          error: "Löschen nicht möglich, dieser Benutzer ist bereits in Gebrauch.",
          reason: "database_constraint",
        });
        return;
      }
    }

    next(error);
  }
};
