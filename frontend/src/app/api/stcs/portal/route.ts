import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { getPortal, mutatePortal } from "@/lib/server/portal";
import { errorResponse } from "@/lib/server/apiResponse";
import { InputValidationError } from "@/lib/server/validation";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (isAuthError(user)) return user;
  try {
    return NextResponse.json(
      { data: await getPortal(user) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e, "No se pudo cargar el portal.");
  }
}
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (isAuthError(user)) return user;
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new InputValidationError("Solicitud inválida.");
    await mutatePortal(user, body);
    return NextResponse.json({ message: "Cambios guardados." });
  } catch (e) {
    if ((e as { code?: string }).code === "23505")
      return NextResponse.json(
        {
          message:
            "Ya existe una cuenta con ese correo o una asignación incompatible.",
        },
        { status: 409 },
      );
    return errorResponse(e, "No se pudieron guardar los cambios.");
  }
}
