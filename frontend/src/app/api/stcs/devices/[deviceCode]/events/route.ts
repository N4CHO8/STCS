import { NextRequest, NextResponse } from "next/server";

import { authenticateDeviceRequest } from "@/lib/server/deviceAuth";
import { createDeviceEventFromDevice } from "@/lib/server/stcsData";
import { errorResponse } from "@/lib/server/apiResponse";
import { parseDeviceEventInput } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deviceCode: string }> },
) {
  const authError = await authenticateDeviceRequest(
    request,
    (await params).deviceCode,
  );

  if (authError) {
    return authError;
  }

  try {
    const input = parseDeviceEventInput(await request.json());
    const result = await createDeviceEventFromDevice(
      (await params).deviceCode,
      input,
    );

    return NextResponse.json(
      {
        // Installed communicators dequeue only after this explicit acknowledgement.
        // A duplicate is also acknowledged: its event is already persisted.
        accepted: true,
        externalEventId: input.externalEventId ?? null,
        message: result.created
          ? "Evento del dispositivo guardado correctamente."
          : "El evento ya estaba registrado; no se creo un duplicado.",
        data: result.event,
      },
      { status: result.created ? 201 : 200 },
    );
  } catch (error) {
    return errorResponse(
      error,
      "No fue posible guardar el evento del dispositivo.",
    );
  }
}
