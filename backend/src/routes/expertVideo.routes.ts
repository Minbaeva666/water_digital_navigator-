import express from "express";
import { authenticate } from "../middlewares/login/authMiddelware";
import { requirePermission } from "../middlewares/requirePermission";
import { multerMemory } from "../middlewares/upload/multerMiddleware";
import {
  getLatestExpertVideos,
  getExpertVideos,
  getExpertVideoById,
  createExpertVideo,
  updateExpertVideo,
  deleteExpertVideo,
  uploadExpertVideoThumbnail,
} from "../controllers/expertVideo.controller";

interface MulterErrorRequest extends express.Request {
  multerError?: Error;
}

const wrapMulterSingle =
  (field: string): express.RequestHandler =>
  (req: MulterErrorRequest, res, next) => {
    multerMemory.single(field)(req, res, (err) => {
      if (err) req.multerError = err;
      next();
    });
  };

const router = express.Router();

router.get("/latest", getLatestExpertVideos);

router.get("/", getExpertVideos);
router.get("/:id", getExpertVideoById);
router.post("/", authenticate, requirePermission("expert_video.create"), createExpertVideo);
router.put("/:id", authenticate, requirePermission("expert_video.edit"), updateExpertVideo);
router.delete("/:id", authenticate, requirePermission("expert_video.delete"), deleteExpertVideo);

router.post(
  "/:id/thumbnail-upload",
  authenticate,
  requirePermission("expert_video.edit"),
  wrapMulterSingle("thumbnail"),
  uploadExpertVideoThumbnail
);

export default router;
