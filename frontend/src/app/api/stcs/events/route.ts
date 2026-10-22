import { NextRequest, NextResponse } from "next/server";

import { errorResponse } from "@/lib/server/apiResponse";
import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { getDeviceEventHistory } from "@/lib/server/stcsData";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authUser = authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  try {
    const context = request.nextUrl.searchParams.get("context")?.trim() || undefined;
    const eventType = request.nextUrl.searchParams.get("eventType")?.trim() || undefined;

    if ((context?.length ?? 0) > 80 || (eventType?.length ?? 0) > 60) {
      return NextResponse.json(
        { message: "Los filtros enviados no son validos." },
        { status: 400 }
      );
    }

    const events = await getDeviceEventHistory(authUser, { context, eventType });

    return NextResponse.json({
      message: "Historial obtenido desde la base de datos.",
      total: events.length,
      data: events
    });
  } catch (error) {
    return errorResponse(error, "No fue posible obtener el historial.");
  }
}
