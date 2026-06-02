import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { guardianDemoData } from "@/lib/server/portalData";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authUser = authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  if (authUser.role !== "guardian") {
    return NextResponse.json(
      { message: "No tienes permisos para acceder a este recurso." },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: "Informacion demo para cuidador obtenida correctamente.",
    data: guardianDemoData
  });
}
