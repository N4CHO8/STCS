import { NextRequest, NextResponse } from "next/server";

import { errorResponse } from "@/lib/server/apiResponse";
import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { deletePictogram, updatePictogram } from "@/lib/server/stcsData";
import { parsePictogramInput } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pictogramId: string }> },
) {
  const authUser = await authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  try {
    const pictogram = await updatePictogram(
      authUser,
      (await params).pictogramId,
      parsePictogramInput(await request.json()),
    );

    return NextResponse.json({
      message: "Pictograma actualizado y guardado en el tablero.",
      data: pictogram,
    });
  } catch (error) {
    return errorResponse(error, "No fue posible actualizar el pictograma.");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pictogramId: string }> },
) {
  const authUser = await authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  try {
    await deletePictogram(authUser, (await params).pictogramId);

    return NextResponse.json({
      message: "Pictograma eliminado del tablero.",
    });
  } catch (error) {
    return errorResponse(error, "No fue posible eliminar el pictograma.");
  }
}
