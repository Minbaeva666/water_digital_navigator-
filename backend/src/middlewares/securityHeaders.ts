import helmet from "helmet";
import { Request, Response, NextFunction } from "express";

const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        clientOrigin,
        "https://nominatim.openstreetmap.org",
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      formAction: ["'self'"],
    },
    reportOnly: false,
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: "deny" },
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

const permissionsPolicyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()"
  );
  next();
};

export const securityHeadersMiddleware = [
  helmetMiddleware,
  permissionsPolicyMiddleware,
];
