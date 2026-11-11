import { errorResponse } from "@/lib/server/apiResponse";
import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { getStcsOverview } from "@/lib/server/stcsData";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authUser = await authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  try {
    const overview = await getStcsOverview(authUser);

    return NextResponse.json({
      message: "Resumen STCS obtenido desde la base de datos.",
      data: overview,
    });
  } catch (error) {
    return errorResponse(error, "No fue posible cargar el resumen.");
  }
}
