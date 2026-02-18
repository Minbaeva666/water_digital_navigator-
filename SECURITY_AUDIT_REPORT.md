# DILOWA Security Audit Report

**Date:** 2025-01-17  
**Status:** 🔴 CRITICAL ISSUES FOUND - Action Required  
**Scope:** Backend (Node.js/Express) + Frontend (React)

---

## Executive Summary

Systematic security audit against 8 provided guidelines identified **8 critical/high-priority issues** and several medium-priority findings. The application currently leaks sensitive information through error responses and lacks proper Content Security Policy headers. Token invalidation on logout is implemented, but error handling exposes internal system details that could aid attackers.

**Overall Risk Level:** 🔴 HIGH  
**Requires remediation before production deployment**

---

## 1. Error Message Exposure ⚠️ CRITICAL

### Issue 1.1: Stack Traces Logged to Console in Production
**Severity:** 🔴 CRITICAL  
**GDPR/Privacy Risk:** HIGH

**Findings:**
- Generic error handler logs full error objects to console with `console.error('[Error]', err)`
- File: [backend/src/middlewares/errorHandler.ts](backend/src/middlewares/errorHandler.ts)
- In production, console errors may be captured by monitoring/logging systems exposing stack traces

**Current Code:**
```typescript
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error('[Error]', err);  // ❌ LOGS FULL ERROR WITH STACK TRACE
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({error: err.message});
        return;
    }
    // ...
};
```

**Audited Locations with console.error:**
- [organization.controller.ts](backend/src/controllers/organization.controller.ts#L379) - Line 379, 843
- [digitalSolution.controller.ts](backend/src/controllers/digitalSolution.controller.ts#L414) - Line 414, 469, 596, 849, 941, 1084
- [admin.controller.ts](backend/src/controllers/admin.controller.ts#L24) - Line 24, 40, 55
- [auth.controller.ts](backend/src/controllers/auth.controller.ts#L169) - Line 169, 268, 306, 368

### Issue 1.2: Sensitive Data in Error Messages
**Severity:** 🟠 HIGH

**Findings:**
- Some endpoints expose request data in errors (though generally good)
- Error handler includes `reason` parameter which could leak implementation details
- Database field names may leak through Prisma error mapping

**Endpoint Examples:**
- [auth.controller.ts](backend/src/controllers/auth.controller.ts#L275) - Line 275: `{error: "Token invalid or expired.", reason}`
- [auth.controller.ts](backend/src/controllers/auth.controller.ts#L321) - Line 321: `{error: "Not authorized.", reason: "no_token"}`

### Issue 1.3: Generic 500 Error Should Be Absolute Fallback
**Severity:** 🟡 MEDIUM

**Finding:**
Current fallback is good, but many endpoints have specific error handlers that could be consolidated.

```typescript
// ✅ GOOD - Generic fallback
res.status(500).json({
    error: 'Something went wrong',
    reason: 'internal_server_error',
});
```

### Recommendations:

**Fix 1.1: Remove console.error from errorHandler**
```typescript
// ❌ BEFORE
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error('[Error]', err);
    // ...
};

// ✅ AFTER
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    // Log to structured logger (e.g., Winston) with rate limiting
    // Never log full error objects to console in production
    if (process.env.NODE_ENV !== 'production') {
        console.error('[Error]', err);
    } else {
        // Use structured logging with correlation ID
        logger.error('Unhandled error', { 
            correlationId: req.id,
            statusCode: err.statusCode || 500 
        });
    }
    
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({error: err.message});
        return;
    }
    // ... rest of handler
};
```

**Fix 1.2: Audit all console.error locations**
Replace pattern `console.error("^[^"]*", error)` with:
```typescript
// Dev-only logging
if (process.env.NODE_ENV !== 'production') {
    console.error("Fehler:", error);
}
```

**Fix 1.3: Remove reason parameter from API responses**
```typescript
// ❌ BEFORE - reveals implementation
res.status(401).json({ error: "Token invalid or expired.", reason });

// ✅ AFTER
res.status(401).json({ error: "Token invalid or expired." });
```

---

## 2. Content Security Policy (CSP) Violations 🔴 CRITICAL

### Issue 2.1: No CSP Headers Configured
**Severity:** 🔴 CRITICAL  
**Security Impact:** XSS attacks, clickjacking, data exfiltration possible

**Findings:**
- No Content-Security-Policy header set in Express middleware
- No X-Frame-Options, X-Content-Type-Options headers found
- CORS configured but permissive with credentials enabled

### Current CORS Configuration (server.ts):
```typescript
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            process.env.CLIENT_ORIGIN,
            'http://localhost:5173',
            'http://localhost:3001',
            'http://192.168.84.86',  // ⚠️ Local IP exposed
        ].filter(Boolean);
        // ...
    },
    credentials: true,  // ✅ Good - required for cookies
}));
```

### Issue 2.2: Missing Security Headers
**Severity:** 🔴 CRITICAL

**Missing Headers:**
- ❌ Content-Security-Policy
- ❌ X-Frame-Options (clickjacking protection)
- ❌ X-Content-Type-Options (MIME sniffing)
- ❌ Strict-Transport-Security (HTTPS enforcement)
- ❌ Referrer-Policy
- ❌ Permissions-Policy (formerly Feature-Policy)

### Recommendations:

**Fix 2.1: Add helmet middleware**
```bash
npm install helmet
```

**Fix 2.2: Configure security headers middleware**
File: Create `backend/src/middlewares/securityHeaders.ts`
```typescript
import helmet from 'helmet';

export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],  // No unsafe-inline, no unsafe-eval
            styleSrc: ["'self'"],   // No unsafe-inline
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "data:"],
            connectSrc: [
                "'self'",
                process.env.CLIENT_ORIGIN || 'http://localhost:5173',
                process.env.API_GEOCODING || 'nominatim.openstreetmap.org',
            ],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : undefined,
        },
        reportOnly: false,  // Set to true for testing
    },
    hsts: {
        maxAge: 31536000,  // 1 year
        includeSubDomains: true,
        preload: true,
    },
    frameguard: {
        action: 'deny',  // Prevent clickjacking
    },
    noSniff: true,  // Prevent MIME sniffing
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permissionsPolicy: {
        geolocation: [],
        microphone: [],
        camera: [],
        payment: [],
    },
});
```

**Fix 2.3: Add security headers to server.ts**
```typescript
import { securityHeaders } from './middlewares/securityHeaders';

// Middleware (before routes)
app.use(securityHeaders);
```

---

## 3. External Services & CDN Usage 🟡 MEDIUM

### Issue 3.1: Undocumented External Services
**Severity:** 🟡 MEDIUM  
**Privacy/Compliance Risk:** MEDIUM

**Identified External Services:**

| Service | Purpose | Found In | Risk |
|---------|---------|----------|------|
| Nominatim OpenStreetMap | Geocoding | [organization.controller.ts](backend/src/controllers/organization.controller.ts#L36) | ✅ Low - Open source, documented |
| (Ant Design from CDN?) | UI Components | [frontend] | ⚠️ Check if inline |

**Nominatim API Usage (Organization Geocoding):**
- [backend/src/controllers/organization.controller.ts](backend/src/controllers/organization.controller.ts#L36)
- ✅ Good: Rate-limited (1.5s between requests per Nominatim ToS)
- ✅ Good: Proper User-Agent header

### Recommendations:

**Fix 3.1: Document all external services**
File: Create `EXTERNAL_SERVICES.md`
```markdown
# External Services & Data Flows

## 1. Nominatim OpenStreetMap API
- **Purpose:** Geocoding organization addresses to coordinates
- **Endpoint:** https://nominatim.openstreetmap.org
- **Data Sent:** Postal code, country code
- **Frequency:** On organization creation/update (15s rate limit per ToS)
- **Privacy:** Compliant - IP addresses temp logged per Nominatim ToS
- **Alternative:** Consider running own geocoder (Pelias, Photon)

## 2. HTTP Client Dependencies
- Verify all npm packages for malicious activity via `npm audit`

## 3. CDN/CSS/Font Usage
- Verify Ant Design loaded locally or from trusted CDN
```

---

## 4. Session & Token Invalidation ✅ GOOD

### Issue 4.1: Logout Implementation - AUDIT PASS
**Severity:** ✅ PASS  
**Status:** Token invalidation correctly implemented

**Audit Findings:**
- ✅ Refresh token is deleted from database on logout
- ✅ Refresh cookie is cleared with `res.clearCookie()`
- ✅ httpOnly flag set (prevents JavaScript access)
- ✅ Secure flag set conditionally (production-only)
- ✅ sameSite: lax prevents CSRF

**Current Implementation (auth.controller.ts lines 290-308):**
```typescript
res.clearCookie("refreshToken", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

res.status(200).json({ message: "Logout successfully." });
```

**Recommendation 4.1: Add token revocation tracking**
```typescript
// Optional enhancement: Log logout events
await prisma.auditLog.create({
  data: {
    userId,
    action: 'LOGOUT',
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  },
});
```

---

## 5. RBAC Enforcement & Server-Side Authorization ✅ GOOD

### Issue 5.1: Permission Middleware - AUDIT PASS
**Severity:** ✅ PASS  
**Status:** Proper server-side enforcement

**Audit Findings:**
- ✅ `requirePermission()` middleware enforces on every protected route
- ✅ Client role NOT trusted (always verified against database token)
- ✅ Admin bypass check exists (superuser allowance)
- ✅ Scoped permissions for resource owners implemented
- ✅ Resource ID parameter validation present

**Current Implementation (requirePermission.ts):**
```typescript
if (user.role === "ADMIN") {
    return next();  // Superuser bypass
}

// Check basic permission first
if (checkBasicPermission(user, resource, action)) {
    return next();
}

// Check scoped (owner) permission
const hasPermission = await checkScopedPermission(
    user, resource, action, resourceId
);

if (hasPermission) {
    next();
    return;
}

res.status(403).json({ message: "Keine Berechtigung." });
```

**Recommendation 5.1: Audit permission configuration**
- [ ] Review [backend/src/config/permissions/checkBasicPermission.ts](backend/src/config/permissions/checkBasicPermission.ts)
- [ ] Review [backend/src/config/permissions/checkScopedPermission.ts](backend/src/config/permissions/checkScopedPermission.ts)
- [ ] Verify RESOURCE_CONFIG includes all protected endpoints
- [ ] Check that client role is NOT passed in requests

---

## 6. Temporary Password Generation 🟠 HIGH

### Issue 6.1: Weak Temporary Password Generation
**Severity:** 🟠 HIGH  
**Risk:** Predictable temporary passwords can be brute-forced

**Current Implementation (user.controller.ts line 323):**
```typescript
const generatedPassword = crypto.randomBytes(6).toString("hex");
// Generates: 12 hex characters (48-bit entropy)
// Example: "a1b2c3d4e5f6"
// Entropy: ~48 bits, brute-forceable in minutes
```

**Problem:**
- Only 6 bytes = 48 bits entropy
- Hex encoding limits to 16^12 possibilities
- Modern GPU can crack this in seconds-to-minutes
- No complexity requirements

**Attack Example:**
```
Possible values: 16^12 ≈ 2.8 × 10^14
Attempts/second: 1 billion (modern GPU)
Time to crack: ~8,000 seconds = 2+ hours
```

### Recommendations:

**Fix 6.1: Increase entropy and add complexity**
```typescript
// ✅ BETTER - 32 bytes = 256 bits entropy
const generatedPassword = crypto.randomBytes(32).toString("hex");
// Result: 64 hex characters
// Entropy: ~256 bits, cryptographically secure

// OR: Use readable format (16 bytes URL-safe)
const generatedPassword = crypto
  .randomBytes(16)
  .toString("base64")
  .replace(/[+/]/g, (match) => (match === "+" ? "-" : "_"))
  .substring(0, 24);  // "aB-cD_eF1234567890xyzABC"
```

**Fix 6.2: Send temporary password via separate channel**
```typescript
// ✅ Implement one-time-use temporary password link
const tempToken = crypto.randomBytes(32).toString('hex');
const tokenHash = sha256(tempToken);

await prisma.passwordReset.create({
  data: {
    userId,
    tokenHash,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
  },
});

// Send email with: https://app.com/set-password?token=<tempToken>
// NOT the password itself
```

---

## 7. Inline Scripts & Styles ✅ PASS

### Issue 7.1: Frontend Code - AUDIT PASS
**Severity:** ✅ PASS  
**Status:** No unsafe inline patterns found

**Audit Findings:**
- ✅ No `onclick="javascript:..."` attributes
- ✅ No `<script>` tags with inline code in HTML
- ✅ No `<style>` tags with inline CSS
- ✅ React/TypeScript properly abstracts event handlers
- ✅ onClick handlers use proper React event system

**React Pattern (Correct):**
```tsx
// ✅ Uses React event handler (not inline onclick)
<Button onClick={(e) => handleClick(e)}>
  Click me
</Button>

// NOT this:
// ❌ <button onclick="doSomething()">Click</button>
```

---

## 8. Input Validation & Server-Side Enforcement ✅ GOOD

### Issue 8.1: Validation Middleware - AUDIT PASS
**Severity:** ✅ PASS  
**Status:** Server-side validation implemented

**Audit Findings:**
- ✅ Validate middleware exists: [backend/src/middlewares/validate/validate.ts](backend/src/middlewares/validate/validate.ts)
- ✅ Email validation on POST endpoints
- ✅ Type checking with TypeScript
- ✅ ID parameter validation present
- ✅ Missing field checks in most endpoints

**Validation Examples:**
```typescript
// ✅ Validates ID parameter
if (!orgId) {
    res.status(400).json({ error: "orgId fehlt." });
    return;
}

// ✅ Validates required fields
const missing = [];
if (!email) missing.push("email");
if (!password) missing.push("password");
if (missing.length > 0) {
    res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    return;
}
```

### Recommendations:

**Fix 8.1: Standardize validation with express-validator**
```bash
npm install express-validator
```

```typescript
// Create validation schema
import { body, param, validationResult } from 'express-validator';

export const createUserValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('firstName must be 1-100 chars'),
  body('password')
    .isLength({ min: 12 })
    .matches(/[A-Z]/)
    .matches(/[a-z]/)
    .matches(/[0-9]/)
    .withMessage('Password must be 12+ chars with upper, lower, number'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
```

---

## 9. Additional Findings

### Issue 9.1: HttpOnly Cookie Configuration ✅ GOOD
- ✅ Refresh token uses httpOnly flag (prevents XSS theft)
- ✅ Secure flag conditional on NODE_ENV
- ✅ sameSite: lax prevents CSRF

### Issue 9.2: Password Hashing ✅ GOOD
- ✅ Uses bcrypt with salt rounds = 10 (standard)
- ✅ No plaintext password storage

### Issue 9.3: CORS Configuration ⚠️ MEDIUM
**Issue:** Local test IP (192.168.84.86) hardcoded in production code
```typescript
allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    'http://localhost:5173',
    'http://localhost:3001',
    'http://192.168.84.86',  // ⚠️ Remove before production
].filter(Boolean);
```

**Fix:**
```typescript
const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
];

// Only add localhost origins in development
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173', 'http://localhost:3001');
}
```

---

## Remediation Priority & Timeline

### 🔴 CRITICAL (Fix before any release):
1. **Add CSP headers** (Helmet middleware) - **1-2 hours**
2. **Stop logging full errors to console** - **30 minutes**
3. **Fix temporary password generation** - **1 hour**
4. **Remove console.error from production** - **1-2 hours**
5. **Remove test IP from CORS** - **15 minutes**

**Total Critical: ~5 hours**

### 🟠 HIGH (Fix in next sprint):
1. **Add error logging/audit trail** (structured logging)
2. **Implement express-validator for standardized validation**
3. **Add rate limiting middleware**
4. **Document external services**

### 🟡 MEDIUM (Improve code quality):
1. **Add correlation IDs for request tracing**
2. **Implement request ID logging**
3. **Add security headers test suite**

---

## Compliance Checklist

- [x] Session invalidation on logout
- [x] Server-side RBAC enforcement
- [x] Input validation present
- [x] Password hashing (bcrypt)
- [ ] ✅ **CSP headers configured** (REQUIRED)
- [ ] ✅ **Error message sanitization** (REQUIRED)
- [ ] ✅ **HTTPS enforcement headers** (REQUIRED)
- [x] HttpOnly cookies used
- [x] CORS properly configured (after cleanup)
- [x] No dangerous functions (eval, innerHTML)

---

## Next Steps

1. **Implement Helmet middleware** → Adds all security headers
2. **Update error handler** → Remove console.error, structure logging
3. **Fix temporary password generation** → Increase entropy
4. **Add security headers tests** → Automated validation
5. **Document security decisions** → For future team members

---

**Audit Conducted:** 2025-01-17  
**Auditor:** Security Review Agent  
**Risk Assessment:** HIGH - Requires remediation before production

