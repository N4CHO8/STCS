import { NextRequest, NextResponse } from "next/server";

import { errorResponse } from "@/lib/server/apiResponse";
import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { createPictogram } from "@/lib/server/stcsData";
import { parsePictogramInput } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authUser = await authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  try {
    const pictogram = await createPictogram(
      authUser,
      parsePictogramInput(await request.json()),
    );

    return NextResponse.json(
      {
        message: "Pictograma agregado y guardado en el tablero.",
        data: pictogram,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "No fue posible agregar el pictograma.");
  }
}
