import { Request, Response, NextFunction } from "express";
import path from "path";
import { mkdir } from "fs/promises";
import { writeFile } from "node:fs/promises";
import fs from "fs";
import { randomUUID } from "crypto";
import {
  ExpertVideoService,
  ExpertVideoCreateDto,
  ExpertVideoUpdateDto,
} from "../services/expertVideo/expertVideo.service";

interface MulterErrorRequest extends Request {
  file?: Express.Multer.File;
  multerError?: Error;
}

// ---------- READ ----------
export async function getLatestExpertVideos(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 4;
    const videos = await ExpertVideoService.getLatest(limit);
    res.json(videos);
  } catch (err) {
    next(err);
  }
}

export async function getExpertVideos(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;

    const result = await ExpertVideoService.list(page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getExpertVideoById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "expertVideoId fehlt." });
      return;
    }

    const video = await ExpertVideoService.getById(id);
    if (!video) {
      res.status(404).json({ message: "ExpertVideo not found" });
      return;
    }
    res.json(video);
  } catch (err) {
    next(err);
  }
}

// ---------- CREATE / UPDATE / DELETE ----------

export async function createExpertVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = req.body as ExpertVideoCreateDto;
    const video = await ExpertVideoService.create(body);
    res.status(201).json(video);
  } catch (err) {
    next(err);
  }
}

export async function updateExpertVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "expertVideoId fehlt." });
      return;
    }
    const body = req.body as ExpertVideoUpdateDto;
    const video = await ExpertVideoService.update(id, body);
    res.json(video);
  } catch (err) {
    next(err);
  }
}

export async function deleteExpertVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "expertVideoId fehlt." });
      return;
    }
    await ExpertVideoService.delete(id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}


export const uploadExpertVideoThumbnail = async (
  req: MulterErrorRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id?: string };
    const file = req.file;

    if (!id) {
      res.status(400).json({ error: "expertVideoId fehlt." });
      return;
    }

    if (req.multerError) {
      res
        .status(400)
        .json({ error: `Upload fehlgeschlagen: ${req.multerError.message}` });
      return;
    }

    if (!file) {
      res.status(400).json({ error: "Kein Thumbnail hochgeladen." });
      return;
    }

    const folder = path.join(
      process.cwd(),
      "public",
      "uploads",
      "expertVideos",
      id
    );

    await mkdir(folder, { recursive: true });

    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    const filename = `${randomUUID()}${ext}`;
    const absolutePath = path.join(folder, filename);

    await writeFile(absolutePath, file.buffer!);

    const publicDir = path.join(process.cwd(), "public");
    const webPath =
      "/" + path.relative(publicDir, absolutePath).split(path.sep).join("/");

    const updated = await ExpertVideoService.updateThumbnailUrl(id, webPath);

    res.status(201).json(updated);
  } catch (error) {
    console.error("Error uploading expert video thumbnail:", error);
    next(error);
  }
}
