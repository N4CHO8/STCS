import { withApi } from "@/lib/server/withApi";
import { NextRequest, NextResponse } from "next/server";

import {
  authenticateRequest,
  isAuthError,
  mapUser,
  UserRow,
} from "@/lib/server/auth";
import { query } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export const GET = withApi(async (request: NextRequest) => {
  const authUser = await authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  const result = await query<UserRow>("SELECT * FROM users WHERE id = $1", [
    authUser.sub,
  ]);

  if (!result.rowCount) {
    return NextResponse.json(
      { message: "Usuario no encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      message: "Usuario autenticado obtenido correctamente.",
      user: mapUser(result.rows[0]),
      expiresIn: "2h",
      expiresAt: new Date(authUser.exp! * 1000).toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});
