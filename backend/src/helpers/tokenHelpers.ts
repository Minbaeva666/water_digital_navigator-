// src/helpers/tokenHelpers.ts
import crypto from "crypto";
import { PrismaClient, TokenType } from "@prisma/client";
import { NotFoundError } from "../errors/NotFoundError";

const prisma = new PrismaClient();

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Finds a token by the RAW value from the link (?token=...) and the token type.
 * Internally computes the sha256 and looks up the token by the `tokenHash` field.
 */
export async function getTokenWithUser(
  rawToken: string,
  tokenType: TokenType | "REVOKE_REGISTRATION_TOKEN" | "EMAIL_VERIFICATION_TOKEN"
) {
  if (!rawToken || typeof rawToken !== "string") {
    throw new NotFoundError("Token not found or user missing");
  }

  const tokenHash = sha256(rawToken);

  const result = await prisma.token.findFirst({
    where: { tokenHash, tokenType: tokenType as TokenType },
    include: { user: true },
  });

  if (!result || !result.user) {
    throw new NotFoundError("Token not found or user missing");
  }

  return result;
}
// import { PrismaClient } from '@prisma/client';
// import { NotFoundError } from '../errors/NotFoundError';

// const prisma = new PrismaClient();

// export async function getTokenWithUser(tokenHash: string, tokenType: 'REVOKE_REGISTRATION_TOKEN' | 'EMAIL_VERIFICATION_TOKEN') {
//     const result = await prisma.token.findFirst({
//         where: { tokenHash, tokenType },
//         include: { user: true },
//     });

//     if (!result || !result.user) {
//         throw new NotFoundError('Token not found or user missing');
//     }

//     return result;
// }

