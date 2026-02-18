# Quick Start: Referential Integrity Protection

## TL;DR - What to Do

### 1. Add Utility File ✅
Already created: `backend/src/utils/referenceIntegrityChecker.ts`

```typescript
import { checkUserReferences } from "../utils/referenceIntegrityChecker";

const refCheck = await checkUserReferences(userId);
if (refCheck.hasReferences) {
  res.status(409).json({
    error: "Deletion is not possible, this item is already in use.",
    details: refCheck.references,
    message: refCheck.message,
  });
  return;
}
```

### 2. Add Error Class ✅
Already created: `backend/src/errors/ReferentialIntegrityError.ts`

```typescript
import { ReferentialIntegrityError } from "../errors/ReferentialIntegrityError";

throw new ReferentialIntegrityError(
  "Deletion is not possible, this item is already in use.",
  {
    entityId: id,
    references: { solutions: 5, organizations: 2 },
    suggestion: "Please reassign these items first.",
  }
);
```

### 3. Update Deletion Endpoints

Choose which entities to protect:
- [ ] Users - Use `checkUserReferences()`
- [ ] Organizations - Use `checkOrganizationReferences()`
- [ ] Taxonomy Nodes - Use `checkTaxonomyNodeReferences()`
- [ ] Regions - Use `checkRegionReferences()`
- [ ] Countries - Use `checkCountryReferences()`

Example for User deletion in `backend/src/controllers/user.controller.ts`:

```typescript
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  if (!id) {
    res.status(400).json({ error: "userId fehlt." });
    return;
  }

  try {
    // Check existence
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) {
      res.status(404).json({ error: "User nicht gefunden." });
      return;
    }

    // ✅ ADD THIS CHECK
    const refCheck = await checkUserReferences(id);
    if (refCheck.hasReferences) {
      res.status(409).json({
        error: "Deletion is not possible, this user is already in use.",
        details: refCheck.references,
        message: refCheck.message,
      });
      return;
    }

    // DELETE
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "User erfolgreich gelöscht." });
  } catch (error) {
    // Handle P2003 (foreign key) and P2014 (relation) errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003" || error.code === "P2014") {
        res.status(409).json({ 
          error: "Deletion is not possible, this item is already in use." 
        });
        return;
      }
    }
    next(error);
  }
};
```

---

## Available Check Functions

| Function | Checks For | Usage |
|----------|-----------|-------|
| `checkUserReferences()` | Owned solutions, created users, moderated users, created orgs | deleteUser |
| `checkOrganizationReferences()` | Users, solutions, municipality profile | deleteOrganization |
| `checkTaxonomyNodeReferences()` | Child nodes, used in solutions | deleteTaxonomyNode |
| `checkRegionReferences()` | Organizations using this region | deleteRegion |
| `checkCountryReferences()` | Organizations and regions | deleteCountry |
| `checkExpertVideoReferences()` | Authors | deleteExpertVideo |

---

## Database Constraints (Prisma Schema)

### Current Status
- Some relations use `Cascade` (risky!)
- Some relations use `SetNull` or `Restrict` (better)

### Recommended Changes

Update `backend/prisma/schema.prisma`:

```prisma
// ❌ CHANGE FROM:
organizationId   Organization? @relation(..., onDelete: Cascade)

// ✅ CHANGE TO:
organizationId   Organization @relation(..., onDelete: Restrict)
```

See `REFERENTIAL_INTEGRITY_GUIDE.md` for full schema recommendations.

---

## API Error Response

When deletion is blocked:

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "status": 409,
  "error": "Deletion is not possible, this item is already in use.",
  "details": {
    "references": {
      "ownedSolutions": 5,
      "createdOrganizations": 2
    },
    "message": "Deletion is not possible. This user owns 5 solutions and created 2 organizations."
  }
}
```

---

## Frontend: Show User-Friendly Error

```typescript
// React/Ant Design example
try {
  await deleteUser(userId);
  messageApi.success("Deleted!");
} catch (error) {
  if (error.response?.status === 409) {
    const { error: title, details } = error.response.data;
    messageApi.error({
      content: (
        <div>
          <p>{title}</p>
          <p>{details.message}</p>
        </div>
      ),
    });
  }
}
```

---

## Prisma Error Codes (Fallback)

Even with frontend checks, these can occur:

| Code | Meaning | Status |
|------|---------|--------|
| P2003 | Foreign key constraint failed | 409 |
| P2014 | Required relation violation | 409 |
| P2002 | Unique constraint failed | 409 |
| P2025 | Record not found | 404 |

---

## Files to Update

1. ✅ `backend/src/utils/referenceIntegrityChecker.ts` (CREATED)
2. ✅ `backend/src/errors/ReferentialIntegrityError.ts` (CREATED)
3. ✅ `REFERENTIAL_INTEGRITY_GUIDE.md` (CREATED)
4. ✅ `DELETION_BEFORE_AFTER.md` (CREATED)
5. 🔄 `backend/src/controllers/user.controller.ts` (UPDATE deleteUser)
6. 🔄 `backend/src/controllers/organization.controller.ts` (UPDATE deleteOrganization)
7. 🔄 `backend/src/controllers/taxonomyNodes.controller.ts` (UPDATE delete endpoint)
8. 🔄 `backend/prisma/schema.prisma` (UPDATE onDelete rules)
9. 🔄 Frontend error handling (UPDATE to show 409 errors)

---

## Testing

```bash
# Test 1: Try to delete user with solutions
curl -X DELETE http://localhost:3000/api/users/user_with_solutions

# Expected response:
# {
#   "status": 409,
#   "error": "Deletion is not possible, this item is already in use.",
#   "details": { "ownedSolutions": 5 }
# }

# Test 2: Delete user with no references
curl -X DELETE http://localhost:3000/api/users/isolated_user

# Expected response:
# {
#   "status": 200,
#   "message": "User successfully deleted."
# }
```

---

## Examples

See `DELETION_BEFORE_AFTER.md` for:
- Before/after code comparisons
- Full endpoint implementations  
- API response examples
- Frontend integration code

---

## Questions?

**Q: Do I need to update Prisma schema?**  
A: Yes, changing `onDelete` rules to `Restrict` reinforces the protection at the database level.

**Q: What if I want to allow deletions with CASCADE?**  
A: Then those entities MUST be owned exclusively by the parent. Use Cascade only when children have no other references.

**Q: Should I use soft deletes (isDeleted flag)?**  
A: That's a separate architectural decision. This solution prevents accidental hard deletes.

**Q: Can I bulk delete with checks?**  
A: Yes, check each entity individually before deleting, or use a transaction to check all then delete.

**Q: What about audit logging?**  
A: Add logging before deletion: `console.log("Deleting:", entity)`. Consider audit table for compliance needs.
