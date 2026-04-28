import { v4 as uuidv4 } from "uuid";

import { query } from "../../config/database";
import { CreateEmotionInput, Emotion } from "../../models/Emotion";

interface EmotionRow {
  id: string;
  user_id: string;
  emotion: string;
  intensity: number;
  note: string | null;
  recorded_at: Date;
  created_at: Date;
}

const mapEmotion = (row: EmotionRow): Emotion => ({
  id: row.id,
  userId: row.user_id,
  emotion: row.emotion,
  intensity: row.intensity,
  note: row.note,
  recordedAt: row.recorded_at.toISOString(),
  createdAt: row.created_at.toISOString()
});

export const listEmotions = async (): Promise<Emotion[]> => {
  const result = await query<EmotionRow>(
    "SELECT * FROM emotions ORDER BY recorded_at DESC LIMIT 30"
  );

  return result.rows.map(mapEmotion);
};

export const createEmotion = async (
  input: CreateEmotionInput
): Promise<Emotion> => {
  const result = await query<EmotionRow>(
    `INSERT INTO emotions (id, user_id, emotion, intensity, note, recorded_at, created_at)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamp, NOW()), NOW())
     RETURNING *`,
    [
      uuidv4(),
      input.userId,
      input.emotion,
      input.intensity,
      input.note ?? null,
      input.recordedAt ?? null
    ]
  );

  return mapEmotion(result.rows[0]);
};
