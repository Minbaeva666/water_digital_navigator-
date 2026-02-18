/**
 * EXAMPLE: Updated deleteUser endpoint with referential integrity checks
 * 
 * Location: backend/src/controllers/user.controller.ts
 * 
 * Replace the existing deleteUser function with this implementation.
 */

import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/prisma";
import { checkUserReferences } from "../utils/referenceIntegrityChecker";
import { ConflictError } from "../errors/ConflictError";

export const deleteUserUPDATED = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params as { id?: string };

  if (!id) {
    res.status(400).json({ error: "userId fehlt." });
    return;
  }

  try {
    // 1) Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!user) {
      res.status(404).json({ error: "User nicht gefunden." });
      return;
    }

    // 2) CHECK REFERENCES BEFORE DELETION
    const refCheck = await checkUserReferences(id);
    
    if (refCheck.hasReferences) {
      // Return 409 Conflict with detailed information
      res.status(409).json({
        error: "Deletion is not possible, this user is already in use.",
        details: {
          userId: id,
          userEmail: user.email,
          references: refCheck.references,
          message: refCheck.message,
        },
        suggestion: "Reassign or remove the references before deletion.",
      });
      return;
    }

    // 3) SAFE TO DELETE - No references found
    await prisma.$transaction(async (tx) => {
      // Clean up any tokens associated with this user
      await tx.token.deleteMany({
        where: { userId: id },
      });
      
      // Delete the user
      await tx.user.delete({
        where: { id },
      });
    });

    res.status(200).json({ 
      message: "User erfolgreich gelöscht.",
      deletedUser: {
        id,
        email: user.email,
      }
    });
  } catch (error) {
    console.error(`Fehler beim Löschen des Users ${id}:`, error);
    next(error);
  }
};


/**
 * EXAMPLE: Updated deleteOrganization endpoint with referential integrity checks
 * 
 * Location: backend/src/controllers/organization.controller.ts
 */

import fs from "fs";
import path from "path";
import { checkOrganizationReferences } from "../utils/referenceIntegrityChecker";

export const deleteOrganizationUPDATED = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params as { id?: string };

  if (!id) {
    res.status(400).json({ error: "orgId fehlt." });
    return;
  }

  try {
    // 1) Check if organization exists
    const org = await prisma.organization.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!org) {
      res.status(404).json({ error: "Organisation nicht gefunden." });
      return;
    }

    // 2) CHECK REFERENCES BEFORE DELETION
    const refCheck = await checkOrganizationReferences(id);
    
    if (refCheck.hasReferences) {
      // Return 409 Conflict with detailed information
      res.status(409).json({
        error: "Deletion is not possible, this organization is already in use.",
        details: {
          organizationId: id,
          organizationName: org.name,
          references: refCheck.references,
          message: refCheck.message,
        },
        suggestion: 
          "Please remove all users from this organization and reassign or archive " +
          "all digital solutions before deletion.",
      });
      return;
    }

    // 3) SAFE TO DELETE - No references found
    // Optionally clean up files if there are any orphaned digital solutions
    const solutions = await prisma.digitalSolution.findMany({
      where: { organizationId: id },
      select: { id: true },
    });

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
          console.warn(`Could not delete folder ${uploadDir}:`, err);
        }
      }
      await prisma.image.deleteMany({ where: { digitalSolutionId: solutionId } });
      await prisma.digitalSolution.delete({ where: { id: solutionId } });
    }

    // Delete municipality profile if exists
    await prisma.municipalityProfile.deleteMany({ where: { organizationId: id } });

    // Delete the organization
    await prisma.organization.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: `Organisation ${org.name} successfully deleted.`,
      deletedOrganization: {
        id,
        name: org.name,
      }
    });
  } catch (error) {
    console.error(`Fehler beim Löschen der Organisation ${id}:`, error);
    next(error);
  }
};


/**
 * EXAMPLE: Updated deleteTaxonomyNode endpoint with referential integrity checks
 * 
 * Location: backend/src/controllers/taxonomyNodes.controller.ts
 */

import { checkTaxonomyNodeReferences } from "../utils/referenceIntegrityChecker";

export const deleteTaxonomyNodeUPDATED = async (req: Request, res: Response) => {
  const { nodeId } = req.params as { nodeId?: string };

  if (!nodeId) {
    res.status(400).json({ error: "nodeId fehlt." });
    return;
  }

  try {
    // 1) Check if node exists
    const node = await prisma.taxonomyNode.findUnique({
      where: { id: nodeId },
      select: { id: true, nameDe: true },
    });

    if (!node) {
      res.status(404).json({ error: "Taxonomy node nicht gefunden." });
      return;
    }

    // 2) CHECK REFERENCES BEFORE DELETION
    const refCheck = await checkTaxonomyNodeReferences(nodeId);
    
    if (refCheck.hasReferences) {
      // Return 409 Conflict with detailed information
      res.status(409).json({
        error: "Deletion is not possible, this taxonomy node is already in use.",
        details: {
          nodeId,
          nodeName: node.nameDe,
          references: refCheck.references,
          message: refCheck.message,
        },
        suggestion:
          refCheck.references.childNodes > 0
            ? "Move or delete child nodes first."
            : "Please remove this node from all digital solutions before deletion.",
      });
      return;
    }

    // 3) SAFE TO DELETE - No references found
    await prisma.taxonomyNode.delete({ where: { id: nodeId } });

    res.status(200).json({
      message: "Taxonomy node successfully deleted.",
      deletedNode: {
        id: nodeId,
        name: node.nameDe,
      }
    });
  } catch (error) {
    console.error(`Error deleting taxonomy node ${nodeId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};
