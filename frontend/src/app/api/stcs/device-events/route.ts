import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { createDeviceEvent } from "@/lib/server/stcsData";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authUser = authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  const input = (await request.json()) as {
    eventType?: string;
    actionLabel?: string;
    context?: string;
    pictogramId?: string;
    category?: string;
    emotion?: string;
    intensity?: number;
    source?: string;
  };

  if (!input.eventType || !input.actionLabel) {
    return NextResponse.json(
      { message: "eventType y actionLabel son obligatorios." },
      { status: 400 }
    );
  }

  try {
    const event = await createDeviceEvent(authUser, {
      eventType: input.eventType,
      actionLabel: input.actionLabel,
      context: input.context,
      pictogramId: input.pictogramId,
      category: input.category,
      emotion: input.emotion,
      intensity: input.intensity,
      source: input.source
    });

    return NextResponse.json(
      {
        message: "Evento del ESP32 guardado en la base de datos.",
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
