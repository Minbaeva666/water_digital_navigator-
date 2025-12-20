import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, {
  JsonWebTokenError,
  TokenExpiredError,
  SignOptions,
  Secret,
} from "jsonwebtoken";
import { PrismaClient, Role, TokenType, AccountState } from "@prisma/client";
import { ROLE_PERMISSIONS } from "../config/permissions/rolePermissions";
import { ROLE_NAVIGATION } from "../config/permissions/roleNavigation";
import crypto from "crypto";

const prisma = new PrismaClient();

// Secrets sauber typisieren
const ACCESS_SECRET: Secret = process.env.ACCESS_SECRET as string;
const REFRESH_SECRET: Secret = process.env.REFRESH_SECRET as string;

// Ablaufzeiten
const ACCESS_EXPIRES_IN: SignOptions["expiresIn"] = "15m";
const REFRESH_EXPIRES_IN: SignOptions["expiresIn"] = "7d";

// Hilfsfunktion: Refresh-Cookie setzen
function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Browser-Expiry; Server prüft zusätzlich exp & DB
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// Helper: SHA-256 hex
const sha256 = (s: string) =>
  crypto.createHash("sha256").update(s).digest("hex");

// exp aus einem (soeben signierten) JWT lesen
function getJwtExpMs(token: string): number | null {
  const decoded = jwt.decode(token) as jwt.JwtPayload | null;
  if (!decoded?.exp) return null;
  return decoded.exp * 1000;
}

/**
 * LOGIN
 * - Zugangsdaten prüfen
 * - Prüfen, ob E-Mail verifiziert / Account freigeschaltet
 * - Access-Token signieren
 * - Refresh-Token signieren + HASH in DB speichern
 * - Refresh-Cookie setzen
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({
      error: "Email and password required.",
      reason: "missing_credentials",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        password: true,
        accountState: true,
        emailVerifiedAt: true,
        organization: { select: { id: true, name: true } },
      },
    });

    if (!user || user.password == null) {
      res.status(401).json({
        error: "Invalid login details.",
        reason: "invalid_credentials",
      });
      return;
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.status(401).json({
        error: "Invalid login details.",
        reason: "invalid_credentials",
      });
      return;
    }

    // ❗ Блокируем вход, если e-mail ещё не подтверждён / аккаунт не в состоянии REGISTERED
    if (user.accountState !== AccountState.REGISTERED) {
      res.status(403).json({
        error: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.",
        reason: "email_not_verified",
        accountState: user.accountState,
      });
      return;
    }

    const payload = {
      id: user.id,
      role: user.role as Role,
      organizationId: user.organizationId ?? null,
    };

    const accessToken = jwt.sign(payload, ACCESS_SECRET, {
      expiresIn: ACCESS_EXPIRES_IN,
    });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES_IN,
    });

    const expMs =
      getJwtExpMs(refreshToken) ??
      Date.now() + 7 * 24 * 60 * 60 * 1000;
    const refreshHash = sha256(refreshToken);

    // Optional: nur eine Session pro User -> alte Einträge löschen
    await prisma.token.deleteMany({
      where: { userId: user.id, tokenType: TokenType.REFRESH_TOKEN },
    });

    await prisma.token.create({
      data: {
        tokenHash: refreshHash, // WICHTIG: Hash speichern
        tokenType: TokenType.REFRESH_TOKEN,
        userId: user.id,
        expiresAt: new Date(expMs),
      },
    });

    setRefreshCookie(res, refreshToken);

    const role = user.role as Role;
    const permissions = ROLE_PERMISSIONS[role] ?? [];
    const navigation = ROLE_NAVIGATION[role] ?? [];

    res.status(200).json({
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role,
        organization: user.organization
          ? { id: user.organization.id, name: user.organization.name }
          : null,
        accountState: user.accountState,
        emailVerifiedAt: user.emailVerifiedAt,
      },
      navigation,
      permissions,
    });
  } catch (error) {
    console.error(
      "Login error:",
      (error as any)?.code,
      (error as any)?.message,
      error
    );
    res.status(500).json({
      error: "Server error during login.",
      reason: "login_failed",
    });
  }
};

/**
 * REFRESH (Rotation bei jedem Refresh)
 * - Cookie lesen + JWT verifizieren
 * - DB-Eintrag per HASH suchen (muss existieren & nicht abgelaufen)
 * - Access-Token neu ausstellen
 * - Refresh-Token rotieren: alten HASH löschen, neuen HASH speichern, Cookie neu setzen
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const raw = req.cookies?.refreshToken;

  if (!raw) {
    res.status(401).json({
      error: "No refresh token available.",
      reason: "no_refresh_token",
    });
    return;
  }

  try {
    const decoded = jwt.verify(raw, REFRESH_SECRET) as jwt.JwtPayload;

    if (!decoded?.id || !decoded?.role) {
      res.status(401).json({
        error: "Invalid refresh token payload.",
        reason: "refresh_token_invalid_payload",
      });
      return;
    }

    const currentHash = sha256(raw);

    // Muss in DB existieren (Rotation/Logout invalidieren den alten)
    const row = await prisma.token.findUnique({
      where: { tokenHash: currentHash },
    });
    if (!row || row.tokenType !== TokenType.REFRESH_TOKEN) {
      res.status(401).json({
        error: "Refresh token not recognized.",
        reason: "refresh_token_invalid",
      });
      return;
    }

    // Ablauf zusätzlich zur JWT-Prüfung gegen DB prüfen
    if (row.expiresAt.getTime() <= Date.now()) {
      await prisma.token.delete({ where: { id: row.id } });
      res.status(401).json({
        error: "Refresh token expired.",
        reason: "refresh_token_expired",
      });
      return;
    }

    const payload = {
      id: decoded.id as string,
      role: decoded.role as Role,
      organizationId: (decoded as any).organizationId ?? null,
    };

    const newAccessToken = jwt.sign(payload, ACCESS_SECRET, {
      expiresIn: ACCESS_EXPIRES_IN,
    });
    const newRefreshToken = jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES_IN,
    });
    const newExpMs =
      getJwtExpMs(newRefreshToken) ??
      Date.now() + 7 * 24 * 60 * 60 * 1000;
    const newHash = sha256(newRefreshToken);

    // Rotation: alten Datensatz löschen, neuen anlegen (Transaktion)
    await prisma.$transaction([
      prisma.token.delete({ where: { id: row.id } }),
      prisma.token.create({
        data: {
          tokenHash: newHash, // neuen Hash speichern
          tokenType: TokenType.REFRESH_TOKEN,
          userId: row.userId,
          expiresAt: new Date(newExpMs),
        },
      }),
    ]);

    setRefreshCookie(res, newRefreshToken);
    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    const reason =
      error instanceof TokenExpiredError
        ? "refresh_token_expired"
        : error instanceof JsonWebTokenError
        ? "refresh_token_invalid"
        : "refresh_failed";
    res.status(401).json({ error: "Token invalid or expired.", reason });
  }
};

/**
 * LOGOUT
 * - Refresh-Token-Cookie löschen
 * - passenden HASH-Datensatz entfernen
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const raw = req.cookies?.refreshToken as string | undefined;

    if (raw) {
      await prisma.token.deleteMany({
        where: {
          tokenHash: sha256(raw),
          tokenType: TokenType.REFRESH_TOKEN,
        },
      });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({ message: "Logout successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Server error during logout.",
      reason: "logout_failed",
    });
  }
};

/**
 * ME
 */
export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Not authorized.", reason: "no_token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        accountState: true,
        emailVerifiedAt: true,
        organization: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      res.status(404).json({
        error: "User not found.",
        reason: "user_not_found",
      });
      return;
    }

    const role = user.role as Role;
    const navigation = ROLE_NAVIGATION[role] ?? [];
    const permissions = ROLE_PERMISSIONS[role] ?? [];

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role,
        accountState: user.accountState,
        emailVerifiedAt: user.emailVerifiedAt,
        organization: user.organization
          ? { id: user.organization.id, name: user.organization.name }
          : null,
      },
      navigation,
      permissions,
    });
  } catch (error) {
    console.error("auth/me failed:", error);
    res.status(500).json({ error: "Server error.", reason: "me_failed" });
  }
};
