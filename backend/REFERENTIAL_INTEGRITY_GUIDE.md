# Referential Integrity Protection - Implementation Guide

## Overview

This guide explains how to prevent cascade deletes that break data consistency. The solution combines:
1. **Backend validation** - Check references before deletion
2. **Database constraints** - Use appropriate `onDelete` rules
3. **Clear error messages** - Inform users why deletion isn't possible

---

## 1. Database Schema (Prisma onDelete Rules)

### Current Issues to Fix

The current schema has some risky `onDelete` configurations:

```prisma
// ❌ RISKY: Cascade delete can orphan records
organizationId   Organization? @relation(..., onDelete: Cascade)
parentId         TaxonomyNode? @relation(..., onDelete: SetNull)

// ✅ SAFER: Restrict prevents orphaning
organizationId   Organization @relation(..., onDelete: Restrict)
```

### Recommended Strategy

| Rule | Use Case | Effect |
|------|----------|--------|
| `Cascade` | ✅ Safe when child is owned by parent only (1:1 relationship, no other references) | Deletes child when parent deleted |
| `SetNull` | ✅ Safe for optional foreign keys | Sets FK to NULL when parent deleted |
| `Restrict` | ✅ **RECOMMENDED** - Prevents deletion if children exist | Blocks deletion, triggers P2003 error |
| `NoAction` | ⚠️ Use carefully | Like Restrict, but checked at end of transaction |

### Recommended Prisma Schema Updates

```prisma
// ============================================================================
// USER RELATIONS
// ============================================================================

model User {
  id String @id @default(cuid())
  // ... other fields ...

  // ✅ Users who were created by this user
  createdUsers           User[]              @relation("UserCreatedBy")
  createdBy              User?               @relation("UserCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  createdById            String?

  // ✅ Users this user moderated
  moderatedUsers         User[]              @relation("UserModerated")
  moderatedBy            User?               @relation("UserModerated", fields: [moderatedById], references: [id], onDelete: SetNull)
  moderatedById          String?

  // ✅ Digital solutions owned by this user (RESTRICT - check references first)
  ownedSolutions         DigitalSolution[]   @relation("UserOwnsSolutions")

  // ✅ Digital solutions presented by this user (RESTRICT)
  presentedSolutions     DigitalSolution[]   @relation("SolutionPresentedBy")

  // ✅ Organization this user belongs to
  organization           Organization?       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  organizationId         String?
}

// ============================================================================
// ORGANIZATION RELATIONS
// ============================================================================

model Organization {
  id String @id @default(cuid())
  // ... other fields ...

  // ✅ Users in this organization
  users                  User[]              @relation()

  // ✅ Digital solutions owned by this org (RESTRICT - check before delete)
  ownedSolutions         DigitalSolution[]   @relation("OrganizationOwnsSolutions")

  // ✅ Municipality profile (Cascade is OK - profile is owned by org only)
  municipalityProfile    MunicipalityProfile?

  // ✅ Region and Country (RESTRICT)
  region                 Region?             @relation(fields: [regionId], references: [id], onDelete: SetNull)
  regionId               String?

  country                Country             @relation(fields: [countryId], references: [code], onDelete: Restrict)
  countryId              String

  @@index([regionId])
  @@index([countryId])
}

// ============================================================================
// TAXONOMY NODE RELATIONS
// ============================================================================

model TaxonomyNode {
  id String @id @default(cuid())
  // ... other fields ...

  // ✅ Child nodes (RESTRICT - check children before delete)
  children               TaxonomyNode[]      @relation("TaxonomyParent")
  parent                 TaxonomyNode?       @relation("TaxonomyParent", fields: [parentId], references: [id], onDelete: SetNull)
  parentId               String?

  // ✅ Used in digital solutions (RESTRICT - check before delete)
  digitalSolutions       DigitalSolutionTaxonomy[]

  @@index([parentId])
  @@index([sort, nameDe])
}

// ============================================================================
// DIGITAL SOLUTION RELATIONS
// ============================================================================

model DigitalSolution {
  id String @id @default(cuid())
  // ... other fields ...

  // ✅ Owner: Either organization OR user (RESTRICT to prevent orphaning)
  organization           Organization?       @relation("OrganizationOwnsSolutions", fields: [organizationId], references: [id], onDelete: Restrict)
  organizationId         String?

  user                   User?               @relation("UserOwnsSolutions", fields: [userId], references: [id], onDelete: Restrict)
  userId                 String?

  // ✅ Presented by user (SetNull - graceful degradation)
  presentedByUser        User?               @relation("SolutionPresentedBy", fields: [presentedByUserId], references: [id], onDelete: SetNull)
  presentedByUserId      String?

  // ✅ Created by user (SetNull - track who created but don't block)
  createdBy              User?               @relation("SolutionCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  createdById            String?

  // ✅ Taxonomy selections (CASCADE - these belong to solution)
  taxonomySelections     DigitalSolutionTaxonomy[] @relation("DigitalSolutionTaxonomies")

  // ✅ Images (CASCADE - these belong to solution)
  images                 Image[]             @relation("DigitalSolutionImages")

  @@index([organizationId])
  @@index([userId])
  @@index([presentedByUserId])
}

// ============================================================================
// DIGITAL SOLUTION TAXONOMY
// ============================================================================

model DigitalSolutionTaxonomy {
  id String @id @default(cuid())

  // ✅ CASCADE - These belong to the solution only
  digitalSolution        DigitalSolution     @relation("DigitalSolutionTaxonomies", fields: [digitalSolutionId], references: [id], onDelete: Cascade)
  digitalSolutionId      String

  // ✅ RESTRICT - Don't delete taxonomy if used in solutions
  taxonomyNode           TaxonomyNode        @relation(fields: [taxonomyNodeId], references: [id], onDelete: Restrict)
  taxonomyNodeId         String

  @@unique([digitalSolutionId, taxonomyNodeId])
  @@index([taxonomyNodeId])
}

// ============================================================================
// REGION AND COUNTRY
// ============================================================================

model Region {
  id String @id @default(cuid())
  // ... other fields ...

  // ✅ Organizations in this region (RESTRICT - check before delete)
  organizations          Organization[]

  // ✅ Country (RESTRICT - can't delete region if it has a country)
  country                Country             @relation(fields: [countryId], references: [code], onDelete: Restrict)
  countryId              String

  @@index([countryId])
}

model Country {
  code String @id

  // ✅ Regions and organizations (RESTRICT)
  regions                Region[]
  organizations          Organization[]
}
```

---

## 2. Backend Implementation

### Step 1: Use the Reference Checker

```typescript
import { checkUserReferences } from "../utils/referenceIntegrityChecker";

// In your delete endpoint:
const refCheck = await checkUserReferences(userId);

if (refCheck.hasReferences) {
  return res.status(409).json({
    error: "Deletion is not possible, this user is already in use.",
    details: refCheck.references,
    message: refCheck.message,
  });
}
```

### Step 2: Handle Database Errors (Fallback)

Even with frontend checks, always handle Prisma errors:

```typescript
try {
  await prisma.user.delete({ where: { id } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2003") {
      // Foreign key constraint violation
      return res.status(409).json({
        error: "Deletion is not possible, this item is already in use.",
        reason: "foreign_key_constraint",
      });
    }
    if (error.code === "P2014") {
      // Relation violation
      return res.status(409).json({
        error: "Deletion is not possible, this item is already in use.",
        reason: "relation_violation",
      });
    }
  }
  throw error;
}
```

### Step 3: Transaction Safety

Use transactions to ensure consistency:

```typescript
await prisma.$transaction(async (tx) => {
  // Check references within transaction
  const refs = await tx.user.count({ where: { createdById: userId } });
  if (refs > 0) {
    throw new Error("User still has dependent records");
  }

  // Safe to delete
  await tx.user.delete({ where: { id: userId } });
});
```

---

## 3. API Error Response Format

### Standardized Error Response

```json
{
  "status": 409,
  "error": "Deletion is not possible, this item is already in use.",
  "details": {
    "entityId": "user_123",
    "entityType": "User",
    "references": {
      "ownedSolutions": 5,
      "createdUsers": 3,
      "moderatedUsers": 2,
      "createdOrganizations": 1
    },
    "message": "Deletion is not possible, this user is already in use. Solutions owned: 5, Users created: 3, Users moderated: 2, Organizations created: 1"
  },
  "suggestion": "Please reassign these items or archive them instead of deleting."
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request (missing ID) |
| 404 | Entity not found |
| 409 | Conflict (entity is in use) ← **Use this** |
| 500 | Server error |

---

## 4. Frontend Implementation

### Display Error to User

```typescript
try {
  await deleteUser(userId);
} catch (error) {
  if (error.response?.status === 409) {
    const { details, suggestion } = error.response.data;
    
    showErrorMessage(
      "Cannot delete this user",
      <div>
        <p>{details.message}</p>
        <details>
          <summary>What's preventing deletion:</summary>
          <ul>
            {Object.entries(details.references).map(([key, count]) => 
              count > 0 && <li key={key}>{key}: {count}</li>
            )}
          </ul>
        </details>
        <p><em>{suggestion}</em></p>
      </div>
    );
  }
}
```

---

## 5. Implementation Checklist

- [ ] Add `referenceIntegrityChecker.ts` utility to backend/src/utils/
- [ ] Update Prisma schema with recommended `onDelete` rules
- [ ] Update User deletion endpoint with reference checks
- [ ] Update Organization deletion endpoint with reference checks
- [ ] Update TaxonomyNode deletion endpoint with reference checks
- [ ] Update Region deletion endpoint with reference checks
- [ ] Add error handling for Prisma P2003/P2014 errors
- [ ] Update frontend to display 409 errors to users
- [ ] Test deletion flows with various dependent records
- [ ] Document in admin panel which items can't be deleted

---

## 6. Testing Example

```typescript
// Test: User with solutions should not be deletable
describe("deleteUser", () => {
  it("should prevent deletion if user owns solutions", async () => {
    const user = await createUser();
    const solution = await createSolution({ userId: user.id });

    const response = await DELETE(`/api/users/${user.id}`);

    expect(response.status).toBe(409);
    expect(response.body.error).toContain("already in use");
    expect(response.body.details.references.ownedSolutions).toBe(1);
  });

  it("should allow deletion if user has no references", async () => {
    const user = await createUser();

    const response = await DELETE(`/api/users/${user.id}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain("successfully deleted");
  });
});
```

---

## Key Benefits

✅ **Data Integrity** - No orphaned records  
✅ **User-Friendly** - Clear error messages explain what's blocking deletion  
✅ **Admin Control** - Admins understand why deletion isn't possible  
✅ **Database Safety** - Multiple layers of protection  
✅ **Audit Trail** - References tracked before deletion attempt  

---

## Files to Update

1. **backend/prisma/schema.prisma** - Update onDelete rules (provide schema changes)
2. **backend/src/controllers/user.controller.ts** - Use checkUserReferences()
3. **backend/src/controllers/organization.controller.ts** - Use checkOrganizationReferences()
4. **backend/src/controllers/taxonomyNodes.controller.ts** - Use checkTaxonomyNodeReferences()
5. **backend/src/utils/referenceIntegrityChecker.ts** - Created ✅
6. **frontend** - Display 409 errors nicely

---

## Questions to Consider

1. Should users be archived instead of deleted?
2. Should entities have a soft-delete (isDeleted flag) instead?
3. Who should be able to see what references exist?
4. Should deletion require approval workflow?
