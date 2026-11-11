import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { errorResponse } from "@/lib/server/apiResponse";
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (isAuthError(user)) return user;
  try {
    await query(
      "UPDATE app_sessions SET revoked_at=NOW() WHERE id=$1 AND user_id=$2",
      [user.sid, user.sub],
    );
    return NextResponse.json({ message: "Sesión cerrada." });
  } catch (e) {
    return errorResponse(e, "No se pudo cerrar la sesión en el servidor.");
  }
}
