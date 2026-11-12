import { isAdultRole } from "@/lib/permissions";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { UserRow } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { limitAttempts } from "@/lib/server/sessions";
import { objectInput, stringInput } from "@/lib/server/inputs";
import { errorResponse } from "@/lib/server/apiResponse";

import { sessionResponse } from "@/lib/server/sessionCookie";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const input = objectInput(await request.json());
    const email = stringInput(input.email, "El correo", 120).toLowerCase();
    if (
      typeof input.password !== "string" ||
      !input.password ||
      Buffer.byteLength(input.password) > 72
    )
      return NextResponse.json(
        { message: "Contraseña inválida." },
        { status: 400 },
      );
    const password = input.password;
    await limitAttempts("login:" + email);
    const result = await query<UserRow>(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase()],
    );

    if (!result.rowCount) {
      return NextResponse.json(
        { message: "Credenciales invalidas." },
        { status: 401 },
      );
    }

    const user = result.rows[0];
    if (!user.is_active || !isAdultRole(user.role))
      return NextResponse.json(
        { message: "Credenciales invalidas." },
        { status: 401 },
      );
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Credenciales invalidas." },
        { status: 401 },
      );
    }

    // Only explicitly provisioned demo identities skip email verification. Domain names and JWT claims never grant this exception.
    if (!user.credential_verified_at && !user.is_demo)
      return NextResponse.json(
        {
          message: "Activa tu cuenta verificando el correo antes de ingresar.",
        },
        { status: 403 },
      );
    return sessionResponse(request, user, "Inicio de sesión exitoso.");
  } catch (error) {
    return errorResponse(
      error,
      "No fue posible iniciar sesión. Intenta nuevamente.",
    );
  }
}
