import { NextRequest, NextResponse } from "next/server";

import { authenticateDeviceRequest } from "@/lib/server/deviceAuth";
import { createDeviceEventFromDevice } from "@/lib/server/stcsData";
import { errorResponse } from "@/lib/server/apiResponse";
import { parseDeviceEventInput } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { deviceCode: string } }
) {
  const authError = authenticateDeviceRequest(request);

  if (authError) {
    return authError;
  }

  try {
    const input = parseDeviceEventInput(await request.json());
    const result = await createDeviceEventFromDevice(params.deviceCode, input);

    return NextResponse.json(
      {
        message: result.created
          ? "Evento del dispositivo guardado correctamente."
          : "El evento ya estaba registrado; no se creo un duplicado.",
        data: result.event
      },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    return errorResponse(error, "No fue posible guardar el evento del dispositivo.");
  }
}
