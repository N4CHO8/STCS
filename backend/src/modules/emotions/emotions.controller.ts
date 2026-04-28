import { Request, Response } from "express";

import { CreateEmotionInput } from "../../models/Emotion";
import { createEmotion, listEmotions } from "./emotions.service";

export const getEmotions = async (_req: Request, res: Response): Promise<void> => {
  const emotions = await listEmotions();

  res.json({
    message: "Listado base de emociones.",
    total: emotions.length,
    data: emotions
  });
};

export const postEmotion = async (
  req: Request<unknown, unknown, CreateEmotionInput>,
  res: Response
): Promise<void> => {
  const { userId, emotion, intensity } = req.body;

  if (!userId || !emotion || !intensity) {
    res.status(400).json({
      message: "userId, emotion e intensity son obligatorios."
    });
    return;
  }

  if (intensity < 1 || intensity > 5) {
    res.status(400).json({
      message: "intensity debe estar entre 1 y 5."
    });
    return;
  }

  const createdEmotion = await createEmotion(req.body);

  res.status(201).json({
    message: "Registro base de emocion creado.",
    data: createdEmotion
  });
};
