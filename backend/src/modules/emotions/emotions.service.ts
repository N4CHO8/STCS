import { v4 as uuidv4 } from "uuid";

import { query } from "../../config/database";
import { CreateEmotionInput, Emotion } from "../../models/Emotion";
import {
  AccessDecision,
  canAccessSubject,
  getDefaultAccessDecision
} from "../access/access.service";
import { AuthTokenPayload } from "../auth/auth.types";

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

interface ProtectedResult<T> {
  access: AccessDecision;
  data: T;
}

export const listEmotions = async (
  authUser: AuthTokenPayload,
  requestedUserId?: string
): Promise<ProtectedResult<Emotion[]>> => {
  if (requestedUserId) {
    const access = await canAccessSubject(authUser, requestedUserId);

    if (!access.allowed) {
      return { access, data: [] };
    }

    const result = await query<EmotionRow>(
      `SELECT *
       FROM emotions
       WHERE user_id = $1
       ORDER BY recorded_at DESC
       LIMIT 30`,
      [requestedUserId]
    );

    return { access, data: result.rows.map(mapEmotion) };
  }

  const access = getDefaultAccessDecision(authUser);
  const result =
    authUser.role === "admin"
      ? await query<EmotionRow>(
          "SELECT * FROM emotions ORDER BY recorded_at DESC LIMIT 30"
        )
      : authUser.role === "child"
        ? await query<EmotionRow>(
            `SELECT *
             FROM emotions
             WHERE user_id = $1
             ORDER BY recorded_at DESC
             LIMIT 30`,
            [authUser.sub]
          )
        : await query<EmotionRow>(
            `SELECT e.*
             FROM emotions e
             INNER JOIN user_access ua ON ua.subject_user_id = e.user_id
             WHERE ua.actor_user_id = $1
             ORDER BY e.recorded_at DESC
             LIMIT 30`,
            [authUser.sub]
          );

  return { access, data: result.rows.map(mapEmotion) };
};

export const createEmotion = async (
  authUser: AuthTokenPayload,
  input: CreateEmotionInput
): Promise<ProtectedResult<Emotion | null>> => {
  const access = await canAccessSubject(authUser, input.userId);

  if (!access.allowed) {
    return { access, data: null };
  }

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

  return { access, data: mapEmotion(result.rows[0]) };
};
