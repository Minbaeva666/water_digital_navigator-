import express from "express";
import { Request, Response, NextFunction } from "express";
import {authenticate} from "../middlewares/login/authMiddelware";
import {requirePermission} from "../middlewares/requirePermission";
import {
    createDigitalSolution,
    deleteDigitalSolution, getActiveDigitalSolutions, getActiveDigitalSolutionsWithTitleImage, getAllCoordinates,
    getDetailImagesByDigitalSolution,
    getDigitalSolutionById,
    getDigitalSolutions,
    getTitleImageByDigitalSolution,
    updateDigitalSolution, updateDigitalSolutionDetailImages,
    updateDigitalSolutionTitleImage,
    uploadDigitalSolutionDetailImages,
    uploadDigitalSolutionTitleImage
} from "../controllers/digitalSolution.controller";
import {multerMemory, multerMiddleware} from "../middlewares/upload/multerMiddleware";


interface MulterErrorRequest extends Request {
    multerError?: Error;
}

const wrapMulterSingle =
    (field: string): express.RequestHandler =>
        (req: MulterErrorRequest, res: Response, next: NextFunction) => {
            multerMemory.single(field)(req, res, (err) => {
                if (err) req.multerError = err;
                next();
            });
        };

// Helper, um array-Uploads zu wrappen und multerError zu setzen
const wrapMulterArray =
    (field: string, maxCount: number): express.RequestHandler =>
        (req: MulterErrorRequest, res: Response, next: NextFunction) => {
            multerMemory.array(field, maxCount)(req, res, (err) => {
                if (err) req.multerError = err;
                next();
            });
        };

const router = express.Router();



router.put("/digital-solution/:id/title-image", authenticate, requirePermission("digital_solution.edit"), multerMiddleware.single("titleImage"), updateDigitalSolutionTitleImage);

router.put("/digital-solution/:id/detail-images", authenticate, requirePermission("digital_solution.edit"), multerMiddleware.array("detailImages", 10), updateDigitalSolutionDetailImages);

router.post("/digital-solution/:id/title-image-upload",
    authenticate,
    requirePermission("digital_solution.create"),
    wrapMulterSingle("titleImage"),
    uploadDigitalSolutionTitleImage
);

router.post("/digital-solution/:id/detail-images-upload",
    authenticate,
    requirePermission("digital_solution.create"),
    wrapMulterArray("detailImages", 10),
    uploadDigitalSolutionDetailImages
);


router.get("/title-image", getTitleImageByDigitalSolution);
router.get("/detail-images", getDetailImagesByDigitalSolution);
router.get("/all-coordinates", getAllCoordinates);

router.get('/active-with-title-image', getActiveDigitalSolutionsWithTitleImage);
router.get("/active", getActiveDigitalSolutions);

router.get('/:id', getDigitalSolutionById);
router.put("/:id", authenticate, requirePermission("digital_solution.edit"), updateDigitalSolution);


router.post('/', authenticate, requirePermission("digital_solution.create"), createDigitalSolution);
router.get('/', getDigitalSolutions);


router.delete("/digital-solution/:id", authenticate, requirePermission("digital_solution.delete"), deleteDigitalSolution);


export default router;
