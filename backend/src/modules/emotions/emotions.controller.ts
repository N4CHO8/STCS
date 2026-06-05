import { Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import { CreateEmotionInput } from "../../models/Emotion";
import { AuthenticatedRequest } from "../auth/auth.types";
import { createEmotion, listEmotions } from "./emotions.service";

const getRequestedUserId = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

export const getEmotions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.authUser) {
    res.status(401).json({ message: "No se pudo identificar al usuario autenticado." });
    return;
  }

  const result = await listEmotions(
    req.authUser,
    getRequestedUserId(req.query.userId)
  );

  if (!result.access.allowed) {
    res.status(403).json({
      message: "No tienes permisos para acceder a estas emociones.",
      access: result.access
    });
    return;
  }

  res.json({
    message: "Listado de emociones protegido por permisos.",
    total: result.data.length,
    access: result.access,
    data: result.data
  });
};

export const postEmotion = async (
  req: AuthenticatedRequest<ParamsDictionary, unknown, CreateEmotionInput>,
  res: Response
): Promise<void> => {
  const { userId, emotion, intensity } = req.body;

  if (!req.authUser) {
    res.status(401).json({ message: "No se pudo identificar al usuario autenticado." });
    return;
  }

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

  const result = await createEmotion(req.authUser, req.body);

  if (!result.access.allowed) {
    res.status(403).json({
      message: "No tienes permisos para crear emociones de este usuario.",
      access: result.access
    });
    return;
  }

  res.status(201).json({
    message: "Registro de emocion creado con permisos validados.",
    access: result.access,
    data: result.data
  });
};
