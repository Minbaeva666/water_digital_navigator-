import express from "express";
import { Request, Response, NextFunction } from "express";
import { authenticate } from "../middlewares/login/authMiddelware";
import { requirePermission } from "../middlewares/requirePermission";
import {
  createDigitalSolution,
  deleteDigitalSolution,
  getActiveDigitalSolutions,
  getActiveDigitalSolutionsWithTitleImage,
  getAllCoordinates,
  getDetailImagesByDigitalSolution,
  getDigitalSolutionById,
  getDigitalSolutions,
  getMyDigitalSolutions,
  getTitleImageByDigitalSolution,
  updateDigitalSolution,
  updateDigitalSolutionDetailImages,
  updateDigitalSolutionTitleImage,
  uploadDigitalSolutionDetailImages,
  uploadDigitalSolutionTitleImage,
} from "../controllers/digitalSolution.controller";
import { multerMemory, multerMiddleware } from "../middlewares/upload/multerMiddleware";

interface MulterErrorRequest extends Request {
  multerError?: Error;
}

// Helper: single upload mit multerError
const wrapMulterSingle =
  (field: string): express.RequestHandler =>
  (req: MulterErrorRequest, res: Response, next: NextFunction) => {
    multerMemory.single(field)(req, res, (err) => {
      if (err) req.multerError = err;
      next();
    });
  };

// Helper: array upload mit multerError
const wrapMulterArray =
  (field: string, maxCount: number): express.RequestHandler =>
  (req: MulterErrorRequest, res: Response, next: NextFunction) => {
    multerMemory.array(field, maxCount)(req, res, (err) => {
      if (err) req.multerError = err;
      next();
    });
  };

const router = express.Router();

/**
 * --------- Upload / Bilder (id in Pfad mit Präfix "digital-solution") ----------
 */

// Titelbild aktualisieren (Admin/Mod)
router.put(
  "/digital-solution/:id/title-image",
  authenticate,
  requirePermission("digital_solution.edit"),
  multerMiddleware.single("titleImage"),
  updateDigitalSolutionTitleImage
);

// Detailbilder aktualisieren (Admin/Mod)
router.put(
  "/digital-solution/:id/detail-images",
  authenticate,
  requirePermission("digital_solution.edit"),
  multerMiddleware.array("detailImages", 10),
  updateDigitalSolutionDetailImages
);

// Titelbild hochladen bei Neuanlage (Admin/User)
router.post(
  "/digital-solution/:id/title-image-upload",
  authenticate,
  requirePermission("digital_solution.create"),
  wrapMulterSingle("titleImage"),
  uploadDigitalSolutionTitleImage
);

// Detailbilder hochladen bei Neuanlage (Admin/User)
router.post(
  "/digital-solution/:id/detail-images-upload",
  authenticate,
  requirePermission("digital_solution.create"),
  wrapMulterArray("detailImages", 10),
  uploadDigitalSolutionDetailImages
);

/**
 * --------- Öffentliche / halböffentliche Helfer-Routen ----------
 */

// Einzeltitelbild per query ?digitalSolutionId=...
router.get("/title-image", getTitleImageByDigitalSolution);

// Detailbilder per query ?digitalSolutionId=...
router.get("/detail-images", getDetailImagesByDigitalSolution);

// Karte / Koordinaten
router.get("/all-coordinates", getAllCoordinates);

// Liste aktiver Lösungen (für Atlas / Startseite)
router.get("/active-with-title-image", getActiveDigitalSolutionsWithTitleImage);
router.get("/active", getActiveDigitalSolutions);

/**
 * --------- CRUD / Listen (mit Auth & Rechten) ----------
 */

// ⚠ ВАЖНО: /my ДОЛЖЕН БЫТЬ ВЫШЕ /:id

// Мои цифровые решения (User sieht nur eigene)
router.get(
  "/my",
  authenticate,
  requirePermission("digital_solution.read"),
  getMyDigitalSolutions
);

// Liste aller digitalen Lösungen (Admin/Mod)
router.get(
  "/", getDigitalSolutions
);

// Anlegen (Admin/Mod/User – зависит von ROLE_PERMISSIONS)
router.post(
  "/",
  authenticate,
  requirePermission("digital_solution.create"),
  createDigitalSolution
);

// Aktualisieren (Admin/Mod/User nur eigene, согласно requirePermission + checkScopedPermission)
router.put(
  "/:id",
  authenticate,
  requirePermission("digital_solution.edit"),
  updateDigitalSolution
);

// Details einer Lösung (Admin/Mod; ggf. auch User, если так задумано)
router.get(
  "/:id",
  getDigitalSolutionById
);

// Löschen (Admin/Mod – путь такой же, как у тебя был)
router.delete(
  "/digital-solution/:id",
  authenticate,
  requirePermission("digital_solution.delete"),
  deleteDigitalSolution
);

export default router;
