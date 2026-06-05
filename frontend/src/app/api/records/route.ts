import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { canAccessSubject, getDefaultAccessDecision } from "@/lib/server/access";
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
          message: "No tienes permisos para acceder a estos registros.",
          access
        },
        { status: 403 }
      );
    }

    const result = await query<RecordRow>(
      `SELECT *
       FROM records
       WHERE user_id = $1
       ORDER BY observed_at DESC
       LIMIT 30`,
      [requestedUserId]
    );

    return NextResponse.json({
      message: "Listado de registros protegido por permisos.",
      total: result.rowCount,
      access,
      data: result.rows.map(mapRecord)
    });
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

  return NextResponse.json({
    message: "Listado de registros protegido por permisos.",
    total: result.rowCount,
    access,
    data: result.rows.map(mapRecord)
  });
}

export async function POST(request: NextRequest) {
  const authUser = authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  const input = (await request.json()) as CreateRecordInput;

  if (!input.userId || !input.category || !input.title) {
    return NextResponse.json(
      { message: "userId, category y title son obligatorios." },
      { status: 400 }
    );
  }

  const access = await canAccessSubject(authUser, input.userId);

  if (!access.allowed) {
    return NextResponse.json(
      {
        message: "No tienes permisos para crear registros de este usuario.",
        access
      },
      { status: 403 }
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
      input.observedAt ?? null
    ]
  );

  return NextResponse.json(
    {
      message: "Registro de comportamiento creado con permisos validados.",
      access,
      data: mapRecord(result.rows[0])
    },
    { status: 201 }
  );
}
