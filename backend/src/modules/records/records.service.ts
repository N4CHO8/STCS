import { v4 as uuidv4 } from "uuid";

import { query } from "../../config/database";
import { CreateRecordInput, RecordItem } from "../../models/Record";

interface RecordRow {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string | null;
  observed_at: Date;
  created_at: Date;
}

const mapRecord = (row: RecordRow): RecordItem => ({
  id: row.id,
  userId: row.user_id,
  category: row.category,
  title: row.title,
  description: row.description,
  observedAt: row.observed_at.toISOString(),
  createdAt: row.created_at.toISOString()
});

export const listRecords = async (): Promise<RecordItem[]> => {
  const result = await query<RecordRow>(
    "SELECT * FROM records ORDER BY observed_at DESC LIMIT 30"
  );

  return result.rows.map(mapRecord);
};

export const createRecord = async (
  input: CreateRecordInput
): Promise<RecordItem> => {
  const result = await query<RecordRow>(
    `INSERT INTO records (id, user_id, category, title, description, observed_at, created_at)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamp, NOW()), NOW())
     RETURNING *`,
    [
      uuidv4(),
      input.userId,
      input.category,
      input.title,
      input.description ?? null,
      input.observedAt ?? null
    ]
  );

  return mapRecord(result.rows[0]);
};
