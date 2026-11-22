import { NextRequest, NextResponse } from "next/server";

import { errorResponse } from "@/lib/server/apiResponse";
import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { historyFilters } from "@/lib/server/history-filters";
import { InputValidationError } from "@/lib/server/validation";
import { getDeviceEventHistory } from "@/lib/server/stcsData";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authUser = await authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  try {
    const offset = Number(request.nextUrl.searchParams.get("offset") ?? 0);
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > 1000000)
      throw new InputValidationError("Página inválida.");
    const page = await getDeviceEventHistory(authUser, {
      offset,
      ...historyFilters(request.nextUrl.searchParams),
    });

    return NextResponse.json({
      message: "Historial obtenido desde la base de datos.",
      pageSize: 100,
      offset,
      total: page.total,
      hasMore: page.hasMore,
      data: page.events,
      contexts: page.contexts,
      eventTypes: page.eventTypes,
      devices: page.devices,
    });
  } catch (error) {
    return errorResponse(error, "No fue posible obtener el historial.");
  }
}
