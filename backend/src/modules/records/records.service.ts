import { v4 as uuidv4 } from "uuid";

import { query } from "../../config/database";
import { CreateRecordInput, RecordItem } from "../../models/Record";
import {
  AccessDecision,
  canAccessSubject,
  getDefaultAccessDecision
} from "../access/access.service";
import { AuthTokenPayload } from "../auth/auth.types";

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

interface ProtectedResult<T> {
  access: AccessDecision;
  data: T;
}

export const listRecords = async (
  authUser: AuthTokenPayload,
  requestedUserId?: string
): Promise<ProtectedResult<RecordItem[]>> => {
  if (requestedUserId) {
    const access = await canAccessSubject(authUser, requestedUserId);

    if (!access.allowed) {
      return { access, data: [] };
    }

    const result = await query<RecordRow>(
      `SELECT *
       FROM records
       WHERE user_id = $1
       ORDER BY observed_at DESC
       LIMIT 30`,
      [requestedUserId]
    );

    return { access, data: result.rows.map(mapRecord) };
  }

  const access = getDefaultAccessDecision(authUser);
  const result =
    authUser.role === "admin"
      ? await query<RecordRow>(
          "SELECT * FROM records ORDER BY observed_at DESC LIMIT 30"
        )
      : authUser.role === "child"
        ? await query<RecordRow>(
            `SELECT *
             FROM records
             WHERE user_id = $1
             ORDER BY observed_at DESC
             LIMIT 30`,
            [authUser.sub]
          )
        : await query<RecordRow>(
            `SELECT r.*
             FROM records r
             INNER JOIN user_access ua ON ua.subject_user_id = r.user_id
             WHERE ua.actor_user_id = $1
             ORDER BY r.observed_at DESC
             LIMIT 30`,
            [authUser.sub]
          );

  return { access, data: result.rows.map(mapRecord) };
};

export const createRecord = async (
  authUser: AuthTokenPayload,
  input: CreateRecordInput
): Promise<ProtectedResult<RecordItem | null>> => {
  const access = await canAccessSubject(authUser, input.userId);

  if (!access.allowed) {
    return { access, data: null };
  }

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

  return { access, data: mapRecord(result.rows[0]) };
};
