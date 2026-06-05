import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { canAccessSubject, getDefaultAccessDecision } from "@/lib/server/access";
import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { query } from "@/lib/server/db";

export const dynamic = "force-dynamic";

interface EmotionRow {
  id: string;
  user_id: string;
  emotion: string;
  intensity: number;
  note: string | null;
  recorded_at: Date;
  created_at: Date;
}

interface CreateEmotionInput {
  userId?: string;
  emotion?: string;
  intensity?: number;
  note?: string;
  recordedAt?: string;
}

const mapEmotion = (row: EmotionRow) => ({
  id: row.id,
  userId: row.user_id,
  emotion: row.emotion,
  intensity: row.intensity,
  note: row.note,
  recordedAt: row.recorded_at.toISOString(),
  createdAt: row.created_at.toISOString()
});

export async function GET(request: NextRequest) {
  const authUser = authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  const requestedUserId = request.nextUrl.searchParams.get("userId") ?? undefined;

  if (requestedUserId) {
    const access = await canAccessSubject(authUser, requestedUserId);

    if (!access.allowed) {
      return NextResponse.json(
        {
          message: "No tienes permisos para acceder a estas emociones.",
          access
        },
        { status: 403 }
      );
    }

    const result = await query<EmotionRow>(
      `SELECT *
       FROM emotions
       WHERE user_id = $1
       ORDER BY recorded_at DESC
       LIMIT 30`,
      [requestedUserId]
    );

    return NextResponse.json({
      message: "Listado de emociones protegido por permisos.",
      total: result.rowCount,
      access,
      data: result.rows.map(mapEmotion)
    });
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

  return NextResponse.json({
    message: "Listado de emociones protegido por permisos.",
    total: result.rowCount,
    access,
    data: result.rows.map(mapEmotion)
  });
}

export async function POST(request: NextRequest) {
  const authUser = authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  const input = (await request.json()) as CreateEmotionInput;

  if (!input.userId || !input.emotion || typeof input.intensity !== "number") {
    return NextResponse.json(
      { message: "userId, emotion e intensity son obligatorios." },
      { status: 400 }
    );
  }

  if (input.intensity < 1 || input.intensity > 5) {
    return NextResponse.json(
      { message: "intensity debe estar entre 1 y 5." },
      { status: 400 }
    );
  }

  const access = await canAccessSubject(authUser, input.userId);

  if (!access.allowed) {
    return NextResponse.json(
      {
        message: "No tienes permisos para crear emociones de este usuario.",
        access
      },
      { status: 403 }
    );
  }

  const result = await query<EmotionRow>(
    `INSERT INTO emotions (id, user_id, emotion, intensity, note, recorded_at, created_at)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamp, NOW()), NOW())
     RETURNING *`,
    [
      randomUUID(),
      input.userId,
      input.emotion,
      input.intensity,
      input.note ?? null,
      input.recordedAt ?? null
    ]
  );

  return NextResponse.json(
    {
      message: "Registro de emocion creado con permisos validados.",
      access,
      data: mapEmotion(result.rows[0])
    },
    { status: 201 }
  );
}
