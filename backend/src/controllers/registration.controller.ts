// import {PrismaClient, Prisma, TokenType, User} from "@prisma/client";
// import {NextFunction, Request, Response} from "express";
// import {UserModel} from "../models/user.models";
// import {sendAdminHintNewRegistrationEmail, sendRegistrationRevokedHintEmail, sendRegistrationSuccessEmail, sendVerifyEmailToPrivate, sendVerifyEmailToRepresentative} from "../services/email/sendMail";
// import {UserWithOrganization} from "../types/user.types";
// import {BadRequestError} from "../errors/BadRequestError";
// import {mapPrismaError} from "../utils/prismaErrorMapper";
// import {sendSuccess} from "../utils/response";
// import {safeRun} from "../utils/safeRun";
// import {handleError} from "../utils/handleError";
// import {resizeImageBuffer} from "../utils/image";
// import {assertUserNotExists} from "../helpers/userHelpers";
// import {generateRevokeToken, generateVerificationToken, getTokenExpiration, hashPassword} from "../utils/auth";
// import {prepareOrganizationData} from "../helpers/organizationHelpers";
// import {buildRevokeLink, buildVerificationLink} from "../utils/linkBuilder";
// import {assertTokenHasUser, assertTokenNotExpired, assertUserRevocationPossible, assertValidToken} from "../helpers/validationHelpers";
// import {getTokenWithUser} from "../helpers/tokenHelpers";
// import {safeEmailRun} from "../utils/email";

// const prisma = new PrismaClient();

// export const registerAsRepresentative = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const {
//             salutationType,
//             title,
//             email,
//             password,
//             firstName,
//             phonenumber,
//             lastName,
//             hasAcceptedPrivacyPolicy,
//             hasAcceptedTerms,
//             organization,
//         } = req.body;

//         const file = req.file;

//         if (!file) {
//             throw new BadRequestError('Logo file is required');
//         }

//         const resizedBuffer = await resizeImageBuffer(file.buffer);

//         await assertUserNotExists(email);

//         let organizationData: Prisma.OrganizationCreateInput | undefined;

//         if (organization) {
//             organizationData = await prepareOrganizationData(organization, resizedBuffer, file.mimetype);
//         }

//         const hashedPassword = await hashPassword(password);
//         const verificationToken = generateVerificationToken();
//         const revokeToken = generateRevokeToken();
//         const expiresAt = getTokenExpiration();

//         const result = await prisma.$transaction(async (tx) => {
//             const user = await UserModel.createUserWithTransaction(tx, {
//                 salutationType: salutationType,
//                 title,
//                 email,
//                 password: hashedPassword,
//                 firstName,
//                 lastName,
//                 phonenumber: phonenumber || undefined,
//                 hasAcceptedPrivacyPolicy,
//                 hasAcceptedTerms,
//                 organization: organizationData ? {create: organizationData} : undefined,
//                 accountState: 'VERIFY_EMAIL',
//             });

//             await tx.token.createMany({
//                 data: [
//                     {
//                         userId: user.id,
//                         token: verificationToken,
//                         tokenType: TokenType.EMAIL_VERIFICATION_TOKEN,
//                         expiresAt,
//                     },
//                     {
//                         userId: user.id,
//                         token: revokeToken,
//                         tokenType: TokenType.REVOKE_REGISTRATION_TOKEN,
//                         expiresAt,
//                     },
//                 ]
//             });

//             const fullUser = await tx.user.findUnique({
//                 where: {id: user.id},
//                 include: {organization: true},
//             });

//             if (!fullUser) {
//                 throw new Error('User not found after creation');
//             }

//             return fullUser as UserWithOrganization;
//         });

//         const user = result as UserWithOrganization;

//         const confirmLink = buildVerificationLink(verificationToken);
//         const revokeLink = buildRevokeLink(revokeToken);

//         await safeRun(
//             () => sendVerifyEmailToRepresentative(user, confirmLink, revokeLink),
//             async () => {
//                 await prisma.user.delete({where: {id: result.id}});
//                 next(new Error('Email sending failed. Registration rolled back.'));
//             },
//             () => void sendSuccess(res, 201, result, 'Registration successful')
//         );

//     } catch (error) {
//         const mapped = mapPrismaError(error);
//         return next(mapped || error);
//     }
// };

// export const registerAsPrivate = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const {
//             salutationType,
//             title,
//             email,
//             password,
//             firstName,
//             phonenumber,
//             lastName,
//             hasAcceptedPrivacyPolicy,
//             hasAcceptedTerms,
//         } = req.body;

//         await assertUserNotExists(email);

//         const hashedPassword = await hashPassword(password);
//         const verificationToken = generateVerificationToken();
//         const revokeToken = generateRevokeToken();
//         const expiresAt = getTokenExpiration();

//         const result = await prisma.$transaction(async (tx) => {
//             const user = await UserModel.createUserWithTransaction(tx, {
//                 salutationType: salutationType,
//                 title,
//                 email,
//                 password: hashedPassword,
//                 firstName,
//                 lastName,
//                 phonenumber: phonenumber || undefined,
//                 hasAcceptedPrivacyPolicy,
//                 hasAcceptedTerms,
//                 accountState: 'VERIFY_EMAIL',
//             });

//             await tx.token.createMany({
//                 data: [
//                     {
//                         userId: user.id,
//                         token: verificationToken,
//                         tokenType: TokenType.EMAIL_VERIFICATION_TOKEN,
//                         expiresAt,
//                     },
//                     {
//                         userId: user.id,
//                         token: revokeToken,
//                         tokenType: TokenType.REVOKE_REGISTRATION_TOKEN,
//                         expiresAt,
//                     },
//                 ]
//             });

//             return user;
//         });

//         const user = result as UserWithOrganization;

//         const confirmLink = buildVerificationLink(verificationToken);
//         const revokeLink = buildRevokeLink(revokeToken);


//         await safeRun(
//             () => sendVerifyEmailToPrivate(user, confirmLink, revokeLink),
//             async () => {
//                 await prisma.user.delete({where: {id: result.id}});
//                 next(new Error('Email sending failed. Registration rolled back.'));
//             },
//             () => void sendSuccess(res, 201, result, 'Registration successful')
//         );

//     } catch (error) {
//         return handleError(error, next);
//     }
// };

// export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const {token} = req.query;

//         assertValidToken(token);
//         const verificationToken = await getTokenWithUser(token, 'EMAIL_VERIFICATION_TOKEN');
//         assertTokenNotExpired(verificationToken.expiresAt);


//         const result = await prisma.$transaction(async (tx) => {
//             const user = await tx.user.update({
//                 where: {id: verificationToken.userId},
//                 data: {
//                     emailVerifiedAt: new Date(),
//                     accountState: 'REGISTERED',
//                 },
//                 include: {organization: true},
//             });

//             await tx.token.deleteMany({
//                 where: {
//                     userId: verificationToken.userId,
//                     tokenType: {
//                         in: ['REVOKE_REGISTRATION_TOKEN', 'EMAIL_VERIFICATION_TOKEN'],
//                     },
//                 },
//             });

//             return user;
//         });

//         const user = result as UserWithOrganization;

//         await safeRun(
//             async () => {
//                 await sendRegistrationSuccessEmail(user);
//                 await sendAdminHintNewRegistrationEmail(user);
//             },
//             (error) => {
//                 console.error('Email sending failed:', error);
//             },
//             () => void sendSuccess(res, 200, result, 'Email successfully confirmed')
//         );

//     } catch (error) {
//         return handleError(error, next);
//     }
// };

// export const revokeRegistration = async (req: Request, res: Response, next: NextFunction) => {
//     const { token } = req.query;

//     assertValidToken(token);
//     const revokeToken = await getTokenWithUser(token, 'REVOKE_REGISTRATION_TOKEN');
//     assertTokenHasUser(revokeToken);
//     assertTokenNotExpired(revokeToken.expiresAt);
//     assertUserRevocationPossible(revokeToken.user);

//     try {
//         const userId = revokeToken.userId;

//         const user = await prisma.user.update({
//             where: { id: userId },
//             data: { accountState: 'REGISTRATION_REVOKED' },
//             include: { organization: true },
//         });

//         await prisma.token.deleteMany({
//             where: {
//                 userId,
//                 tokenType: {
//                     in: ['REVOKE_REGISTRATION_TOKEN', 'EMAIL_VERIFICATION_TOKEN'],
//                 },
//             },
//         });

//         await safeEmailRun(() => sendRegistrationRevokedHintEmail(user), res, 201, user, 'Send revoke registration hint to admin');
//         sendSuccess(res, 200, user, 'Registration successfully revoked');
//     } catch (error) {
//         return handleError(error, next);
//     }

// };


import { PrismaClient, Prisma, TokenType, OrganizationState} from "@prisma/client";
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
import { assertUserNotExists } from "../helpers/userHelpers";
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

// Хешируем сырые токены перед записью в БД (совпадает с полем tokenHash)
const hashToken = (t: string) =>
  crypto.createHash("sha256").update(t).digest("hex");

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

    const file = req.file;
    if (!file) throw new BadRequestError("Logo file is required");

    const resizedBuffer = await resizeImageBuffer(file.buffer);

    await assertUserNotExists(email);

    let organizationData: Prisma.OrganizationCreateInput | undefined;

if (organization) {
  console.log("organization from body:", organization);

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
    file.mimetype
  );
}


    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken(); // сырой
    const revokeToken = generateRevokeToken();             // сырой
    const expiresAt = getTokenExpiration();

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
        accountState: "VERIFY_EMAIL",
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

    // В письма отправляем СЫРЫЕ токены (не хеш)
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

    await assertUserNotExists(email);

    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken(); // сырой
    const revokeToken = generateRevokeToken();             // сырой
    const expiresAt = getTokenExpiration();

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
        accountState: "VERIFY_EMAIL",
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
    // ВНИМАНИЕ: getTokenWithUser внутри должен искать по tokenHash = sha256(token)
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
          accountState: "REGISTERED",
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
  // ВНИМАНИЕ: getTokenWithUser внутри должен искать по tokenHash = sha256(token)
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
