import { Request, Response, NextFunction } from "express";
import { sendContactMessageFromGuest } from "../services/email/sendMail";

export const ContactController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, message } = req.body as {
        name?: string;
        email?: string;
        message?: string;
      };

      if (!email || !message) {
        return res
          .status(400)
          .json({ message: "E-Mail und Nachricht sind erforderlich." });
      }

      await sendContactMessageFromGuest({ name, email, message });

      return res.status(204).send(); 
    } catch (err) {
      next(err);
    }
  },
};
