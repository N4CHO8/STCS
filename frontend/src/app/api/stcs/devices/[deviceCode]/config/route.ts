import { NextRequest, NextResponse } from "next/server";

import { authenticateDeviceRequest } from "@/lib/server/deviceAuth";
import { getDeviceBoardConfig } from "@/lib/server/stcsData";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { deviceCode: string } }
) {
  const authError = authenticateDeviceRequest(request);

  if (authError) {
    return authError;
  }

  try {
    const config = await getDeviceBoardConfig(params.deviceCode);

    return NextResponse.json({
      message: "Configuracion del dispositivo obtenida correctamente.",
      data: config
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No fue posible obtener la configuracion del dispositivo."
      },
      { status: 500 }
    );
  }
}
