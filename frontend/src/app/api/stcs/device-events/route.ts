import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from "@/lib/server/auth";
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (isAuthError(user)) return user;
  if (user.role === "admin" || user.role === "teacher")
    return NextResponse.json(
      { message: "Acceso restringido." },
      { status: 403 },
    );
  return NextResponse.json(
    {
      message:
        "Esta ruta fue retirada. Los eventos del ESP requieren su credencial de dispositivo.",
    },
    { status: 410 },
  );
}
