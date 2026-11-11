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

interface RecordRow {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string | null;
  observed_at: Date;
  created_at: Date;
}

interface CreateRecordInput {
  userId?: string;
  category?: string;
  title?: string;
  description?: string;
  observedAt?: string;
}

const mapRecord = (row: RecordRow) => ({
  id: row.id,
  userId: row.user_id,
  category: row.category,
  title: row.title,
  description: row.description,
  observedAt: row.observed_at.toISOString(),
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
          message: "No tienes permisos para acceder a estos registros.",
          access,
        },
        { status: 403 },
      );
    }

    const result = await query<RecordRow>(
      `SELECT *
       FROM records
       WHERE user_id = $1
       ORDER BY observed_at DESC
       LIMIT 30`,
      [requestedUserId],
    );

    return NextResponse.json({
      message: "Listado de registros protegido por permisos.",
      total: result.rowCount,
      access,
      data: result.rows.map(mapRecord),
    });
  }

  const access = getDefaultAccessDecision(authUser);
  const result = await query<RecordRow>(
    `SELECT r.* FROM records r
     JOIN user_access ua ON ua.subject_user_id=r.user_id
     JOIN users subject ON subject.id=ua.subject_user_id
     WHERE ua.actor_user_id=$1 AND ua.relationship=$2 AND ua.approved_at IS NOT NULL AND subject.is_demo=$3 ORDER BY r.observed_at DESC LIMIT 30`,
    [authUser.sub, authUser.role, Boolean(authUser.isDemo)],
  );

  return NextResponse.json({
    message: "Listado de registros protegido por permisos.",
    total: result.rowCount,
    access,
    data: result.rows.map(mapRecord),
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

  const input = objectInput(await request.json()) as CreateRecordInput;

  if (!input.userId || !input.category || !input.title) {
    return NextResponse.json(
      { message: "userId, category y title son obligatorios." },
      { status: 400 },
    );
  }

  input.userId = uuidInput(input.userId);
  input.category = stringInput(input.category, "Categoría", 60);
  input.title = stringInput(input.title, "Título", 150);
  if (input.description !== undefined)
    input.description = stringInput(
      input.description,
      "Descripción",
      5000,
      false,
    );
  if (
    input.observedAt !== undefined &&
    (typeof input.observedAt !== "string" ||
      Number.isNaN(Date.parse(input.observedAt)))
  )
    throw new InputValidationError("Fecha inválida.");
  const access = await canAccessSubject(authUser, input.userId);

  if (!access.allowed) {
    return NextResponse.json(
      {
        message: "No tienes permisos para crear registros de este usuario.",
        access,
      },
      { status: 403 },
    );
  }

  const result = await query<RecordRow>(
    `INSERT INTO records (id, user_id, category, title, description, observed_at, created_at)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamp, NOW()), NOW())
     RETURNING *`,
    [
      randomUUID(),
      input.userId,
      input.category,
      input.title,
      input.description ?? null,
      input.observedAt ?? null,
    ],
  );

  return NextResponse.json(
    {
      message: "Registro de comportamiento creado con permisos validados.",
      access,
      data: mapRecord(result.rows[0]),
    },
    { status: 201 },
  );
}

export const GET = withApi(handleGET);
export const POST = withApi(handlePOST);
