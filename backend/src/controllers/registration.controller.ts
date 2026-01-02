import {
  PrismaClient,
  Prisma,
  TokenType,
  OrganizationState,
  AccountState,
} from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/user.models";
import {
  sendAdminHintNewRegistrationEmail,
  sendRegistrationRevokedHintEmail,
  sendRegistrationSuccessEmail,
  sendVerifyEmailToPrivate,
  sendVerifyEmailToRepresentative,
} from "../services/email/sendMail";
import { UserWithOrganization } from "../types/user.types";
import { BadRequestError } from "../errors/BadRequestError";
import { mapPrismaError } from "../utils/prismaErrorMapper";
import { sendSuccess } from "../utils/response";
import { safeRun } from "../utils/safeRun";
import { handleError } from "../utils/handleError";
import { resizeImageBuffer } from "../utils/image";
import {
  generateRevokeToken,
  generateVerificationToken,
  getTokenExpiration,
  hashPassword,
} from "../utils/auth";
import { prepareOrganizationData } from "../helpers/organizationHelpers";
import { buildRevokeLink, buildVerificationLink } from "../utils/linkBuilder";
import {
  assertTokenHasUser,
  assertTokenNotExpired,
  assertUserRevocationPossible,
  assertValidToken,
} from "../helpers/validationHelpers";
import { getTokenWithUser } from "../helpers/tokenHelpers";
import { safeEmailRun } from "../utils/email";
import crypto from "crypto";

const prisma = new PrismaClient();

const hashToken = (t: string) =>
  crypto.createHash("sha256").update(t).digest("hex");

/**
 * Registrierung als Vertreter: User + Organisation
 */
export const registerAsRepresentative = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      salutationType,
      title,
      email,
      password,
      firstName,
      phonenumber,
      lastName,
      hasAcceptedPrivacyPolicy,
      hasAcceptedTerms,
      organization,
    } = req.body;

    const file = req.file as Express.Multer.File | undefined;

    let resizedBuffer: Buffer | undefined;
    let logoMimeType: string | undefined;

    if (file) {
      resizedBuffer = await resizeImageBuffer(file.buffer);
      logoMimeType = file.mimetype;
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (existing && existing.accountState === AccountState.REGISTERED) {
      throw new BadRequestError(
        "Ein Benutzer mit dieser E-Mail ist bereits registriert."
      );
    }

    let organizationData: Prisma.OrganizationCreateInput | undefined;

    if (organization && resizedBuffer) {
      const orgPayload = {
        name: organization.name,
        email: organization.email,
        street: organization.street,
        zip: organization.zip,
        city: organization.city,
        organizationState: OrganizationState.LITE,
        countryCode: organization.country,
        regionId: organization.regionId ?? null,
        organizationType: organization.organizationType,
        website: organization.website,
      };

      organizationData = await prepareOrganizationData(
        orgPayload,
        resizedBuffer,
        logoMimeType!
      );
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken(); 
    const revokeToken = generateRevokeToken(); 
    const expiresAt = getTokenExpiration(); 

 
    if (
      existing &&
      (existing.accountState === AccountState.REGISTRATION_REVOKED ||
        existing.accountState === AccountState.VERIFY_EMAIL)
    ) {
      const result = await prisma.$transaction(async (tx) => {
        const updateData: Prisma.UserUpdateInput = {
          salutationType,
          title,
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phonenumber: phonenumber || undefined,
          hasAcceptedPrivacyPolicy,
          hasAcceptedTerms,
          accountState: AccountState.VERIFY_EMAIL,
          emailVerifiedAt: null,
        };

        if (!existing.organizationId && organizationData) {
          updateData.organization = { create: organizationData };
        }

        const user = await tx.user.update({
          where: { id: existing.id },
          data: updateData,
          include: { organization: true },
        });

        await tx.token.deleteMany({
          where: {
            userId: user.id,
            tokenType: {
              in: [
                TokenType.EMAIL_VERIFICATION_TOKEN,
                TokenType.REVOKE_REGISTRATION_TOKEN,
              ],
            },
          },
        });

        await tx.token.createMany({
          data: [
            {
              userId: user.id,
              tokenHash: hashToken(verificationToken),
              tokenType: TokenType.EMAIL_VERIFICATION_TOKEN,
              expiresAt,
            },
            {
              userId: user.id,
              tokenHash: hashToken(revokeToken),
              tokenType: TokenType.REVOKE_REGISTRATION_TOKEN,
              expiresAt,
            },
          ],
        });

        return user;
      });

      const user = result as UserWithOrganization;
      const confirmLink = buildVerificationLink(verificationToken);
      const revokeLink = buildRevokeLink(revokeToken);


      await safeRun(
        () => sendVerifyEmailToRepresentative(user, confirmLink, revokeLink),
        async () => {
          console.error(
            "E-Mail-Versand fehlgeschlagen (Re-Registration):",
            email
          );
        },
        () =>
          void sendSuccess(
            res,
            201,
            result,
            "Registrierung aktualisiert und Bestätigungs-E-Mail erneut gesendet"
          )
      );

      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await UserModel.createUserWithTransaction(tx, {
        salutationType,
        title,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phonenumber: phonenumber || undefined,
        hasAcceptedPrivacyPolicy,
        hasAcceptedTerms,
        organization: organizationData ? { create: organizationData } : undefined,
        accountState: AccountState.VERIFY_EMAIL,
      });

      await tx.token.createMany({
        data: [
          {
            userId: user.id,
            tokenHash: hashToken(verificationToken),
            tokenType: TokenType.EMAIL_VERIFICATION_TOKEN,
            expiresAt,
          },
          {
            userId: user.id,
            tokenHash: hashToken(revokeToken),
            tokenType: TokenType.REVOKE_REGISTRATION_TOKEN,
            expiresAt,
          },
        ],
      });

      const fullUser = await tx.user.findUnique({
        where: { id: user.id },
        include: { organization: true },
      });
      if (!fullUser) throw new Error("User not found after creation");

      return fullUser as UserWithOrganization;
    });

    const user = result as UserWithOrganization;

    const confirmLink = buildVerificationLink(verificationToken);
    const revokeLink = buildRevokeLink(revokeToken);

    await safeRun(
      () => sendVerifyEmailToRepresentative(user, confirmLink, revokeLink),
      async () => {
        await prisma.user.delete({ where: { id: result.id } });
        next(new Error("Email sending failed. Registration rolled back."));
      },
      () => void sendSuccess(res, 201, result, "Registration successful")
    );
  } catch (error) {
    const mapped = mapPrismaError(error);
    return next(mapped || error);
  }
};

/**
 * Registrierung als Privatperson
 */
export const registerAsPrivate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      salutationType,
      title,
      email,
      password,
      firstName,
      phonenumber,
      lastName,
      hasAcceptedPrivacyPolicy,
      hasAcceptedTerms,
    } = req.body;

    // --- 1) Check existing user by email ---
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    // 1a) Already fully registered → error
    if (existing && existing.accountState === AccountState.REGISTERED) {
      throw new BadRequestError(
        "Ein Benutzer mit dieser E-Mail ist bereits registriert."
      );
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken(); // raw
    const revokeToken = generateRevokeToken(); // raw
    const expiresAt = getTokenExpiration(); // 48h

    // 1b) Existing with REGISTRATION_REVOKED or VERIFY_EMAIL → overwrite + new email
    if (
      existing &&
      (existing.accountState === AccountState.REGISTRATION_REVOKED ||
        existing.accountState === AccountState.VERIFY_EMAIL)
    ) {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: existing.id },
          data: {
            salutationType,
            title,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phonenumber: phonenumber || undefined,
            hasAcceptedPrivacyPolicy,
            hasAcceptedTerms,
            accountState: AccountState.VERIFY_EMAIL,
            emailVerifiedAt: null,
          },
        });

        await tx.token.deleteMany({
          where: {
            userId: user.id,
            tokenType: {
              in: [
                TokenType.EMAIL_VERIFICATION_TOKEN,
                TokenType.REVOKE_REGISTRATION_TOKEN,
              ],
            },
          },
        });

        await tx.token.createMany({
          data: [
            {
              userId: user.id,
              tokenHash: hashToken(verificationToken),
              tokenType: TokenType.EMAIL_VERIFICATION_TOKEN,
              expiresAt,
            },
            {
              userId: user.id,
              tokenHash: hashToken(revokeToken),
              tokenType: TokenType.REVOKE_REGISTRATION_TOKEN,
              expiresAt,
            },
          ],
        });

        return user;
      });

      const user = result as UserWithOrganization;
      const confirmLink = buildVerificationLink(verificationToken);
      const revokeLink = buildRevokeLink(revokeToken);

      await safeRun(
        () => sendVerifyEmailToPrivate(user, confirmLink, revokeLink),
        async () => {
          console.error(
            "E-Mail-Versand fehlgeschlagen (Re-Registration private):",
            email
          );
        },
        () =>
          void sendSuccess(
            res,
            201,
            result,
            "Registrierung aktualisiert und Bestätigungs-E-Mail erneut gesendet"
          )
      );

      return;
    }

    // 1c) User not found → normal new registration
    const result = await prisma.$transaction(async (tx) => {
      const user = await UserModel.createUserWithTransaction(tx, {
        salutationType,
        title,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phonenumber: phonenumber || undefined,
        hasAcceptedPrivacyPolicy,
        hasAcceptedTerms,
        accountState: AccountState.VERIFY_EMAIL,
      });

      await tx.token.createMany({
        data: [
          {
            userId: user.id,
            tokenHash: hashToken(verificationToken),
            tokenType: TokenType.EMAIL_VERIFICATION_TOKEN,
            expiresAt,
          },
          {
            userId: user.id,
            tokenHash: hashToken(revokeToken),
            tokenType: TokenType.REVOKE_REGISTRATION_TOKEN,
            expiresAt,
          },
        ],
      });

      return user;
    });

    const user = result as UserWithOrganization;

    const confirmLink = buildVerificationLink(verificationToken);
    const revokeLink = buildRevokeLink(revokeToken);

    await safeRun(
      () => sendVerifyEmailToPrivate(user, confirmLink, revokeLink),
      async () => {
        await prisma.user.delete({ where: { id: result.id } });
        next(new Error("Email sending failed. Registration rolled back."));
      },
      () => void sendSuccess(res, 201, result, "Registration successful")
    );
  } catch (error) {
    return handleError(error, next);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;

    assertValidToken(token);
    // getTokenWithUser should search by hashToken(token) in tokenHash
    const verificationToken = await getTokenWithUser(
      token as string,
      "EMAIL_VERIFICATION_TOKEN"
    );
    assertTokenNotExpired(verificationToken.expiresAt);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerifiedAt: new Date(),
          accountState: AccountState.REGISTERED,
        },
        include: { organization: true },
      });

      await tx.token.deleteMany({
        where: {
          userId: verificationToken.userId,
          tokenType: {
            in: ["REVOKE_REGISTRATION_TOKEN", "EMAIL_VERIFICATION_TOKEN"],
          },
        },
      });

      return user;
    });

    const user = result as UserWithOrganization;

    await safeRun(
      async () => {
        await sendRegistrationSuccessEmail(user);
        await sendAdminHintNewRegistrationEmail(user);
      },
      (error) => {
        console.error("Email sending failed:", error);
      },
      () => void sendSuccess(res, 200, result, "Email successfully confirmed")
    );
  } catch (error) {
    return handleError(error, next);
  }
};

export const revokeRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.query;

  assertValidToken(token);
  const revokeToken = await getTokenWithUser(
    token as string,
    "REVOKE_REGISTRATION_TOKEN"
  );
  assertTokenHasUser(revokeToken);
  assertTokenNotExpired(revokeToken.expiresAt);
  assertUserRevocationPossible(revokeToken.user);

  try {
    const userId = revokeToken.userId;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { accountState: "REGISTRATION_REVOKED" },
      include: { organization: true },
    });

    await prisma.token.deleteMany({
      where: {
        userId,
        tokenType: {
          in: ["REVOKE_REGISTRATION_TOKEN", "EMAIL_VERIFICATION_TOKEN"],
        },
      },
    });

    await safeEmailRun(
      () => sendRegistrationRevokedHintEmail(user),
      res,
      201,
      user,
      "Send revoke registration hint to admin"
    );
    sendSuccess(res, 200, user, "Registration successfully revoked");
  } catch (error) {
    return handleError(error, next);
  }
};
