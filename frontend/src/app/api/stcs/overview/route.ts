import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { getStcsOverview } from "@/lib/server/stcsData";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authUser = authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  try {
    const overview = await getStcsOverview(authUser);

    return NextResponse.json({
      message: "Resumen STCS obtenido desde la base de datos.",
      data: overview
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No fue posible cargar los datos de STCS."
      },
      { status: 500 }
    );
  }
}
