import { NextRequest, NextResponse } from "next/server";

import { errorResponse } from "@/lib/server/apiResponse";
import { authenticateDeviceRequest } from "@/lib/server/deviceAuth";
import { getDeviceBoardConfig } from "@/lib/server/stcsData";

export const dynamic = "force-dynamic";

export async function GET(
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
    const config = await getDeviceBoardConfig((await params).deviceCode);

    return NextResponse.json({
      message: "Configuracion del dispositivo obtenida correctamente.",
      // Hardware needs a board identifier, not the child's clinical file or identity.
      data: {
        ...config,
        device: { ...config.device, name: "Comunicador STCS" },
        profile: { id: config.profile.id },
      },
    });
  } catch (error) {
    return errorResponse(
      error,
      "No fue posible obtener la configuración del dispositivo.",
    );
  }
}
