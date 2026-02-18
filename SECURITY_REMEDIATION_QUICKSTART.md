# Security Remediation Quick Start

**Status:** 🔴 5 CRITICAL FIXES REQUIRED  
**Estimated Time:** ~5 hours  
**Priority:** Before production deployment

---

## 1️⃣ Add Helmet Security Headers (1-2 hours)

### Step 1: Install Helmet
```bash
cd backend
npm install helmet
```

### Step 2: Create Security Headers Middleware
File: `backend/src/middlewares/securityHeaders.ts`

```typescript
import helmet from 'helmet';

export const securityHeadersMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        'nominatim.openstreetmap.org',
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
  frameguard: { action: 'deny' },
  noSniff: true,
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

### Step 3: Update server.ts
File: `backend/src/server.ts`

```typescript
import { securityHeadersMiddleware } from './middlewares/securityHeaders';

// Add this BEFORE routes, after CORS
app.use(securityHeadersMiddleware);
```

**✅ Result:** All CSP headers automatically set on every response

---

## 2️⃣ Stop Logging Full Errors to Console (30 minutes)

### File: backend/src/middlewares/errorHandler.ts

**BEFORE:**
```typescript
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('[Error]', err);  // ❌ LOGS FULL ERROR
    // ...
};
```

**AFTER:**
```typescript
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Only log in development
    if (process.env.NODE_ENV !== 'production') {
        console.error('[Error]', err);
    }
    
    // Log to structured logger in production
    if (process.env.NODE_ENV === 'production') {
        // TODO: Use Winston, Pino, or similar
        // logger.error('Unhandled error', { code: err.code, statusCode: err.statusCode });
    }

    if (err instanceof ApiError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }

    const prismaMapped = mapPrismaError(err);
    if (prismaMapped) {
        res.status(prismaMapped.statusCode).json({ error: prismaMapped.message });
        return;
    }

    res.status(500).json({
        error: 'Something went wrong',
        reason: 'internal_server_error',
    });
};
```

**✅ Result:** No sensitive information logged to console in production

---

## 3️⃣ Fix Temporary Password Generation (1 hour)

### File: backend/src/controllers/user.controller.ts

**BEFORE (Line 323):**
```typescript
const generatedPassword = crypto.randomBytes(6).toString("hex");
// Generates 48-bit entropy (weak)
```

**AFTER:**
```typescript
// Generate strong 32-byte password (256-bit entropy)
const generatedPassword = crypto
  .randomBytes(32)
  .toString('base64')
  .replace(/[+/=]/g, '')  // Remove URL-unsafe chars
  .substring(0, 24);      // 24 chars = high entropy + readable
  
// Example output: "aB3cD4eF5gH6iJ7kL8mN9oPq"
```

**VERIFICATION:**
```typescript
// Test entropy:
// 64^24 ≈ 1.4 × 10^42 (impossible to brute force)
// vs old: 16^12 ≈ 2.8 × 10^14 (crackable in hours)
```

**✅ Result:** Temporary passwords now cryptographically secure

---

## 4️⃣ Remove console.error from Production (1-2 hours)

### Locations to Fix:

| File | Lines | Issue |
|------|-------|-------|
| [organization.controller.ts](backend/src/controllers/organization.controller.ts) | 271, 379, 642, 696, 750, 843, 895, 935 | console.error calls |
| [digitalSolution.controller.ts](backend/src/controllers/digitalSolution.controller.ts) | 221, 414, 469, 596, 849, 941, 1084, 1134, 1168 | console.error calls |
| [admin.controller.ts](backend/src/controllers/admin.controller.ts) | 24, 40, 55 | console.error calls |
| [auth.controller.ts](backend/src/controllers/auth.controller.ts) | 169, 268, 306, 368 | console.error calls |

### Fix Pattern:

**BEFORE:**
```typescript
console.error("Fehler beim Laden:", error);
res.status(500).json({ error: "Fehler beim Laden" });
```

**AFTER:**
```typescript
// Only log in development
if (process.env.NODE_ENV !== 'production') {
    console.error("Fehler beim Laden:", error);
}
res.status(500).json({ error: "Fehler beim Laden" });
```

**OR use sed/find-replace:**
```bash
# PowerShell in backend directory
Get-ChildItem src -Recurse -Include "*.ts" | ForEach-Object {
  (Get-Content $_) -replace 'console\.error\((.*?)\);', 'if (process.env.NODE_ENV !== "production") console.error($1);' | Set-Content $_
}
```

**✅ Result:** Console error logs only appear in development

---

## 5️⃣ Remove Test IP from CORS (15 minutes)

### File: backend/src/server.ts

**BEFORE:**
```typescript
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            process.env.CLIENT_ORIGIN,
            'http://localhost:5173',
            'http://localhost:3001',
            'http://192.168.84.86',  // ❌ TEST IP - REMOVE
        ].filter(Boolean);
        // ...
    },
    credentials: true,
}));
```

**AFTER:**
```typescript
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            process.env.CLIENT_ORIGIN,
        ];
        
        // Add dev-only origins
        if (process.env.NODE_ENV !== 'production') {
            allowedOrigins.push(
                'http://localhost:5173',
                'http://localhost:3001'
            );
        }
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
}));
```

**✅ Result:** Only production origin allowed in production

---

## Implementation Checklist

- [ ] **Helmet installed** - `npm install helmet`
- [ ] **securityHeaders.ts created** - New middleware file
- [ ] **server.ts updated** - Import and use securityHeaders
- [ ] **Error handler cleaned** - Dev-only console.error
- [ ] **Temp password fixed** - 32 bytes + base64 encoding
- [ ] **console.error fixed** - All ~30+ locations updated
- [ ] **CORS cleaned** - Test IP removed
- [ ] **Tests passing** - No breaking changes
- [ ] **ENV vars set** - NODE_ENV and CLIENT_ORIGIN configured

---

## Verification Steps

### 1. Check CSP Headers Applied
```bash
# Terminal in backend directory
curl -i http://localhost:3001/api/health | grep -i "content-security"
```

Expected output:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
```

### 2. Verify No Console Errors in Prod
```bash
NODE_ENV=production npm run dev
# Try to trigger an error
# Check console output - should be empty
```

### 3. Test CORS Restrictions
```bash
# This should work
curl -H "Origin: http://localhost:5173" http://localhost:3001/api/health

# This should fail in production
curl -H "Origin: http://192.168.84.86" http://localhost:3001/api/health
```

### 4. Test Temp Password Strength
```bash
node -e "
const crypto = require('crypto');
const pwd = crypto.randomBytes(32).toString('base64').replace(/[+/=]/g, '').substring(0, 24);
console.log('Generated:', pwd);
console.log('Length:', pwd.length);
console.log('Entropy bits: ~' + (pwd.length * Math.log2(64)));
"
```

---

## Timeline

- **Day 1 Afternoon:** Fixes 1-2 (Helmet + Error Handler) = 2-3 hours
- **Day 2 Morning:** Fixes 3-5 (Passwords + console.error + CORS) = 2-3 hours
- **Day 2 Afternoon:** Testing + Verification = 1-2 hours
- **Day 3:** Code review & production readiness

**Total: ~7-8 hours work, spread over 2-3 days**

---

## Testing After Fixes

```bash
# 1. Start backend
cd backend && npm run dev

# 2. Run security checks
npm install -g npm-audit
npm audit

# 3. Test all deletion endpoints still work
npm test -- --grep "delete"

# 4. Verify login/logout/refresh flow
npm test -- --grep "auth"

# 5. Check error responses are generic
# Trigger error and verify response doesn't include stack traces
```

---

## Questions?

Refer to [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) for full context and additional findings.

