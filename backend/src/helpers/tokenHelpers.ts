// src/helpers/tokenHelpers.ts
import crypto from "crypto";
import { PrismaClient, TokenType } from "@prisma/client";
import { NotFoundError } from "../errors/NotFoundError";

const prisma = new PrismaClient();

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Ищет токен по СЫРОМУ значению из ссылки (?token=...) и типу токена.
 * Внутри сам считает sha256 и ищет по полю tokenHash.
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

