import { withApi } from "@/lib/server/withApi";
import { objectInput, uuidInput, stringInput } from "@/lib/server/inputs";
import { InputValidationError } from "@/lib/server/validation";
import { canReadSensitive } from "@/lib/permissions";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  canAccessSubject,
  getDefaultAccessDecision,
} from "@/lib/server/access";
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
  createdAt: row.created_at.toISOString(),
});

async function handleGET(request: NextRequest) {
  const authUser = await authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  if (!canReadSensitive(authUser.role))
    return NextResponse.json(
      { message: "Acceso restringido" },
      { status: 403 },
    );

  const requestedUserId =
    request.nextUrl.searchParams.get("userId") ?? undefined;

  if (requestedUserId) {
    const access = await canAccessSubject(authUser, uuidInput(requestedUserId));

    if (!access.allowed) {
      return NextResponse.json(
        {
          message: "No tienes permisos para acceder a estas emociones.",
          access,
        },
        { status: 403 },
      );
    }

    const result = await query<EmotionRow>(
      `SELECT *
       FROM emotions
       WHERE user_id = $1
       ORDER BY recorded_at DESC
       LIMIT 30`,
      [requestedUserId],
    );

    return NextResponse.json({
      message: "Listado de emociones protegido por permisos.",
      total: result.rowCount,
      access,
      data: result.rows.map(mapEmotion),
    });
  }

  const access = getDefaultAccessDecision(authUser);
  const result = await query<EmotionRow>(
    `SELECT e.* FROM emotions e
     JOIN user_access ua ON ua.subject_user_id=e.user_id
     JOIN users subject ON subject.id=ua.subject_user_id
     WHERE ua.actor_user_id=$1 AND ua.relationship=$2 AND ua.approved_at IS NOT NULL AND subject.is_demo=$3 AND subject.is_private_test=$4 ORDER BY e.recorded_at DESC LIMIT 30`,
    [
      authUser.sub,
      authUser.role,
      Boolean(authUser.isDemo),
      Boolean(authUser.isPrivateTest),
    ],
  );

  return NextResponse.json({
    message: "Listado de emociones protegido por permisos.",
    total: result.rowCount,
    access,
    data: result.rows.map(mapEmotion),
  });
}

async function handlePOST(request: NextRequest) {
  const authUser = await authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  if (!canReadSensitive(authUser.role))
    return NextResponse.json(
      { message: "Acceso restringido" },
      { status: 403 },
    );

  const input = objectInput(await request.json()) as CreateEmotionInput;

  if (!input.userId || !input.emotion || typeof input.intensity !== "number") {
    return NextResponse.json(
      { message: "userId, emotion e intensity son obligatorios." },
      { status: 400 },
    );
  }

  if (input.intensity < 1 || input.intensity > 5) {
    return NextResponse.json(
      { message: "intensity debe estar entre 1 y 5." },
      { status: 400 },
    );
  }

  input.userId = uuidInput(input.userId);
  input.emotion = stringInput(input.emotion, "Emoción", 60);
  if (!Number.isInteger(input.intensity))
    throw new InputValidationError("La intensidad debe ser un entero.");
  if (input.note !== undefined)
    input.note = stringInput(input.note, "Nota", 5000, false);
  if (
    input.recordedAt !== undefined &&
    (typeof input.recordedAt !== "string" ||
      Number.isNaN(Date.parse(input.recordedAt)))
  )
    throw new InputValidationError("Fecha inválida.");
  const access = await canAccessSubject(authUser, input.userId);

  if (!access.allowed) {
    return NextResponse.json(
      {
        message: "No tienes permisos para crear emociones de este usuario.",
        access,
      },
      { status: 403 },
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
      input.recordedAt ?? null,
    ],
  );

  return NextResponse.json(
    {
      message: "Registro de emocion creado con permisos validados.",
      access,
      data: mapEmotion(result.rows[0]),
    },
    { status: 201 },
  );
}

export const GET = withApi(handleGET);
export const POST = withApi(handlePOST);
