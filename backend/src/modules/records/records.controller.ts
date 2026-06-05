import { Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import { CreateRecordInput } from "../../models/Record";
import { AuthenticatedRequest } from "../auth/auth.types";
import { createRecord, listRecords } from "./records.service";

const getRequestedUserId = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

export const getRecords = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.authUser) {
    res.status(401).json({ message: "No se pudo identificar al usuario autenticado." });
    return;
  }

  const result = await listRecords(
    req.authUser,
    getRequestedUserId(req.query.userId)
  );

  if (!result.access.allowed) {
    res.status(403).json({
      message: "No tienes permisos para acceder a estos registros.",
      access: result.access
    });
    return;
  }

  res.json({
    message: "Listado de registros protegido por permisos.",
    total: result.data.length,
    access: result.access,
    data: result.data
  });
};

export const postRecord = async (
  req: AuthenticatedRequest<ParamsDictionary, unknown, CreateRecordInput>,
  res: Response
): Promise<void> => {
  const { userId, category, title } = req.body;

  if (!req.authUser) {
    res.status(401).json({ message: "No se pudo identificar al usuario autenticado." });
    return;
  }

  if (!userId || !category || !title) {
    res.status(400).json({
      message: "userId, category y title son obligatorios."
    });
    return;
  }

  const result = await createRecord(req.authUser, req.body);

  if (!result.access.allowed) {
    res.status(403).json({
      message: "No tienes permisos para crear registros de este usuario.",
      access: result.access
    });
    return;
  }

  res.status(201).json({
    message: "Registro de comportamiento creado con permisos validados.",
    access: result.access,
    data: result.data
  });
};
