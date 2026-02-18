# Practical Implementation: Before & After

## Example 1: Delete User Endpoint

### ❌ BEFORE (Current - Has Issues)

```typescript
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    // Direct delete without checking references
    // ❌ This can leave orphaned digital solutions
    // ❌ This can orphan users created by this user
    
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: "User deleted." });
  } catch (error) {
    // Only catches database errors, message isn't user-friendly
    next(error);
  }
};
```

### ✅ AFTER (Protected)

```typescript
import { checkUserReferences } from "../utils/referenceIntegrityChecker";
import { ReferentialIntegrityError } from "../errors/ReferentialIntegrityError";

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params as { id?: string };

  if (!id) {
    res.status(400).json({ error: "userId is required." });
    return;
  }

  try {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    // 2. CHECK REFERENCES BEFORE DELETION ✅
    const refCheck = await checkUserReferences(id);
    
    if (refCheck.hasReferences) {
      throw new ReferentialIntegrityError(
        "Deletion is not possible, this user is already in use.",
        {
          entityId: id,
          entityType: "User",
          references: refCheck.references,
          suggestion: "Please reassign or remove all references before deletion.",
        }
      );
    }

    // 3. Safe to delete - no references found
    await prisma.$transaction(async (tx) => {
      // Clean up any tokens
      await tx.token.deleteMany({ where: { userId: id } });
      
      // Delete user
      await tx.user.delete({ where: { id } });
    });

    res.status(200).json({ 
      message: "User successfully deleted.",
      deletedUser: { id, email: user.email }
    });
  } catch (error) {
    if (error instanceof ReferentialIntegrityError) {
      return res.status(409).json(error.toJSON());
    }
    
    // Handle database constraint errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003" || error.code === "P2014") {
        return res.status(409).json({
          error: "Deletion is not possible, this user is already in use.",
          reason: "database_constraint",
        });
      }
    }

    console.error(`Error deleting user ${id}:`, error);
    next(error);
  }
};
```

---

## Example 2: Delete Organization Endpoint

### ❌ BEFORE (Current)

```typescript
export const deleteOrganization = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Just delete - cascade will delete everything
    // ❌ Orphans digital solution records
    // ❌ Loses audit trail
    // ❌ No user feedback
    
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      res.status(404).json({ error: "Organization not found." });
      return;
    }

    // Cascade deletes - dangerous!
    await prisma.organization.delete({ where: { id } });

    res.status(200).json({ message: "Organization deleted." });
  } catch (error) {
    next(error);
  }
};
```

### ✅ AFTER (Protected)

```typescript
import { checkOrganizationReferences } from "../utils/referenceIntegrityChecker";
import { ReferentialIntegrityError } from "../errors/ReferentialIntegrityError";
import path from "path";
import fs from "fs";

export const deleteOrganization = async (req, res, next) => {
  const { id } = req.params as { id?: string };

  if (!id) {
    res.status(400).json({ error: "Organization ID is required." });
    return;
  }

  try {
    // 1. Check organization exists
    const org = await prisma.organization.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!org) {
      res.status(404).json({ error: "Organization not found." });
      return;
    }

    // 2. CHECK REFERENCES BEFORE DELETION ✅
    const refCheck = await checkOrganizationReferences(id);
    
    if (refCheck.hasReferences) {
      throw new ReferentialIntegrityError(
        "Deletion is not possible, this organization is already in use.",
        {
          entityId: id,
          entityType: "Organization",
          references: refCheck.references,
          suggestion: 
            refCheck.references.users > 0
              ? `Remove all ${refCheck.references.users} user(s) from this organization first.`
              : `Reassign or archive all ${refCheck.references.solutions} digital solution(s) first.`,
        }
      );
    }

    // 3. Safe to delete - clean up files and delete
    await prisma.$transaction(async (tx) => {
      // Find any orphaned solutions (shouldn't exist if references were checked)
      const solutions = await tx.digitalSolution.findMany({
        where: { organizationId: id },
        select: { id: true },
      });

      // Clean up upload directories
      for (const { id: solutionId } of solutions) {
        const uploadDir = path.join(
          process.cwd(),
          "public",
          "uploads",
          "digitalSolutions",
          solutionId
        );
        if (fs.existsSync(uploadDir)) {
          try {
            fs.rmSync(uploadDir, { recursive: true, force: true });
          } catch (err) {
            console.warn(`Could not delete ${uploadDir}:`, err);
          }
        }
        
        await tx.image.deleteMany({ where: { digitalSolutionId: solutionId } });
        await tx.digitalSolution.delete({ where: { id: solutionId } });
      }

      // Delete organization
      await tx.organization.delete({ where: { id } });
    });

    res.status(200).json({
      success: true,
      message: `Organization "${org.name}" successfully deleted.`,
      deletedOrganization: { id, name: org.name }
    });
  } catch (error) {
    if (error instanceof ReferentialIntegrityError) {
      return res.status(409).json(error.toJSON());
    }

    console.error(`Error deleting organization ${id}:`, error);
    next(error);
  }
};
```

---

## Example 3: API Responses

### Scenario 1: User owned digital solutions - Can't delete

```json
{
  "status": 409,
  "error": "Deletion is not possible, this user is already in use.",
  "name": "ReferentialIntegrityError",
  "details": {
    "entityId": "user_abc123",
    "entityType": "User",
    "references": {
      "ownedSolutions": 5,
      "createdOrganizations": 2,
      "presentedSolutions": 0,
      "moderatedUsers": 0,
      "createdUsers": 0
    },
    "suggestion": "Please reassign or remove these 5 digital solutions before deletion."
  }
}
```

### Scenario 2: Organization with active users - Can't delete

```json
{
  "status": 409,
  "error": "Deletion is not possible, this organization is already in use.",
  "details": {
    "entityId": "org_xyz789",
    "entityType": "Organization",
    "references": {
      "users": 12,
      "solutions": 8,
      "municipalityProfile": false
    },
    "suggestion": "Remove all 12 users from this organization first."
  }
}
```

### Scenario 3: Taxonomy node used in solutions - Can't delete

```json
{
  "status": 409,
  "error": "Deletion is not possible, this taxonomy node is already in use.",
  "details": {
    "entityId": "tax_node_456",
    "entityType": "TaxonomyNode",
    "references": {
      "childNodes": 0,
      "usedInSolutions": 23
    },
    "suggestion": "This node is used in 23 digital solutions. Please update these solutions to use a different option first."
  }
}
```

### Scenario 4: Safe to delete - No references

```json
{
  "status": 200,
  "message": "User successfully deleted.",
  "deletedUser": {
    "id": "user_abc123",
    "email": "old_user@example.com"
  }
}
```

---

## Frontend: Displaying Errors to Users

```typescript
// React example
const handleDeleteUser = async (userId: string) => {
  try {
    await userService.deleteUser(userId);
    message.success("User deleted successfully!");
    // Redirect or refresh
  } catch (error) {
    if (error.response?.status === 409) {
      const { error: title, details, suggestion } = error.response.data;
      
      Modal.confirm({
        title: "Cannot Delete User",
        okText: "OK",
        cancelButtonProps: { style: { display: 'none' } },
        content: (
          <div style={{ textAlign: 'left' }}>
            <p><strong style={{ color: '#d32f2f' }}>{details.message}</strong></p>
            
            <Collapse items={[{
              key: '1',
              label: 'What\'s preventing deletion?',
              children: (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {Object.entries(details.references as Record<string, number>)
                    .filter(([_, count]) => count > 0)
                    .map(([key, count]) => (
                      <li key={key} style={{ marginBottom: 4 }}>
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {count}
                      </li>
                    ))}
                </ul>
              ),
            }]} />
            
            <p style={{ marginTop: 16, fontStyle: 'italic', color: '#666' }}>
              {suggestion}
            </p>
          </div>
        ),
      });
    } else {
      message.error("Failed to delete user");
    }
  }
};
```

---

## Deployment Checklist

- [ ] Deploy referenceIntegrityChecker.ts
- [ ] Update user.controller.ts deleteUser endpoint
- [ ] Update organization.controller.ts deleteOrganization endpoint
- [ ] Update taxonomyNodes.controller.ts deletion endpoint
- [ ] Add ReferentialIntegrityError class
- [ ] Test with actual references
- [ ] Update frontend to handle 409 errors
- [ ] Update admin UI to disable delete buttons when references exist
- [ ] Document for end-users
- [ ] Monitor error logs for P2003/P2014 database errors
