import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { limitedForm, uploadImage, mediaProfile } from "@/lib/server/media";
import { MEDIA_UPLOAD_LIMIT } from "@/lib/media-contract";
import { InputValidationError } from "@/lib/server/validation";
import { errorResponse } from "@/lib/server/apiResponse";
import { limitAttempts } from "@/lib/server/sessions";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (isAuthError(user)) return user;
  try {
    await mediaProfile(user, true);
    await limitAttempts("image-upload:" + user.sub, 30);
    const form = await limitedForm(request, MEDIA_UPLOAD_LIMIT + 65536);
    const file = form.get("image");
    if (!(file instanceof File))
      throw new InputValidationError("Selecciona una imagen.");
    return NextResponse.json(
      { data: await uploadImage(user, file) },
      { status: 201 },
    );
  } catch (e) {
    return errorResponse(e, "No se pudo subir la imagen.");
  }
}
