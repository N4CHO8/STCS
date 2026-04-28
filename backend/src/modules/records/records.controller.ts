import { Request, Response } from "express";

import { CreateRecordInput } from "../../models/Record";
import { createRecord, listRecords } from "./records.service";

export const getRecords = async (_req: Request, res: Response): Promise<void> => {
  const records = await listRecords();

  res.json({
    message: "Listado base de registros.",
    total: records.length,
    data: records
  });
};

export const postRecord = async (
  req: Request<unknown, unknown, CreateRecordInput>,
  res: Response
): Promise<void> => {
  const { userId, category, title } = req.body;

  if (!userId || !category || !title) {
    res.status(400).json({
      message: "userId, category y title son obligatorios."
    });
    return;
  }

  const createdRecord = await createRecord(req.body);

  res.status(201).json({
    message: "Registro base de comportamiento creado.",
    data: createdRecord
  });
};
