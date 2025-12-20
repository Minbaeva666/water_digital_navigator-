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

// ---------- ПУБЛИЧНОЕ: для главной / списка ----------

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

// список для админки
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

// одно видео
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

    // если хочешь, можно сразу удалить и файл превью
    // (пример, если thumbnailUrl хранит относительный путь /uploads/...):
    // const video = await ExpertVideoService.getById(id); // тогда нужно сохранить его ДО delete

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ---------- ЗАГРУЗКА ПРЕВЬЮ-ФОТО ----------

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

    // Multer-ошибка
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

    // 👉 Папка, где физически лежит файл:
    // backend/public/uploads/expertVideos/:id
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

    // Пишем файл из памяти (multerMemory)
    await writeFile(absolutePath, file.buffer!);

    // 👉 Формируем web-путь ОТНОСИТЕЛЬНО папки public
    const publicDir = path.join(process.cwd(), "public");
    const webPath =
      "/" + path.relative(publicDir, absolutePath).split(path.sep).join("/");

    // Сохраняем webPath в БД
    const updated = await ExpertVideoService.updateThumbnailUrl(id, webPath);

    res.status(201).json(updated);
  } catch (error) {
    console.error("Error uploading expert video thumbnail:", error);
    next(error);
  }
}
