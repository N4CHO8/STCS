import { NextRequest, NextResponse } from "next/server";

import { authenticateDeviceRequest } from "@/lib/server/deviceAuth";
import { createDeviceEventFromDevice } from "@/lib/server/stcsData";

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
    const input = (await request.json()) as {
      eventType?: string;
      actionLabel?: string;
      context?: string;
      pictogramId?: string;
      category?: string;
      message?: string;
      emotion?: string;
      intensity?: number;
      batteryLevel?: number;
      firmwareVersion?: string;
      wifiSsid?: string;
    };

    if (!input.eventType) {
      return NextResponse.json(
        { message: "eventType es obligatorio." },
        { status: 400 }
      );
    }

    const event = await createDeviceEventFromDevice(params.deviceCode, {
      eventType: input.eventType,
      actionLabel: input.actionLabel,
      context: input.context,
      pictogramId: input.pictogramId,
      category: input.category,
      message: input.message,
      emotion: input.emotion,
      intensity: input.intensity,
      batteryLevel: input.batteryLevel,
      firmwareVersion: input.firmwareVersion,
      wifiSsid: input.wifiSsid
    });

    return NextResponse.json(
      {
        message: "Evento del dispositivo guardado correctamente.",
        data: event
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No fue posible guardar el evento del dispositivo."
      },
      { status: 500 }
    );
  }
}
