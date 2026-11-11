import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { objectInput, stringInput, passwordInput } from "@/lib/server/inputs";
import { emailAuth } from "@/lib/server/emailAuth";
import { query, transaction } from "@/lib/server/db";
import { createSession, limitAttempts } from "@/lib/server/sessions";
import type { UserRow } from "@/lib/server/auth";
import { isAdultRole } from "@/lib/permissions";
import { withApi } from "@/lib/server/withApi";
export const POST = withApi(async (request: NextRequest) => {
  const input = objectInput(await request.json());
  const email = stringInput(input.email, "Correo", 120).toLowerCase();
  await limitAttempts("email:" + email, 6);
  const accounts = await query<UserRow>(
    "SELECT * FROM users WHERE email=$1 AND is_active=TRUE",
    [email],
  );
  const user = accounts.rows[0];
  if (user?.is_demo)
    return NextResponse.json(
      {
        message:
          "La cuenta demo usa su contraseña de demostración y no requiere activación.",
      },
      { status: 400 },
    );
  if (input.code === undefined) {
    // Same outward response for unknown/disabled accounts; no public registration.
    if (user && isAdultRole(user.role))
      await emailAuth("otp", { email, create_user: true });
    return NextResponse.json({
      message:
        "Si tienes una cuenta activa, recibirás un código de verificación.",
    });
  }
  const code = stringInput(input.code, "Código", 12),
    password = passwordInput(input.password);
  if (!user || !isAdultRole(user.role))
    return NextResponse.json(
      { message: "No se pudo verificar esta cuenta." },
      { status: 400 },
    );
  const verified = await emailAuth("verify", {
    email,
    token: code,
    type: "email",
  });
  if (
    verified.user?.email?.toLowerCase() !== email ||
    !verified.user.email_confirmed_at
  )
    return NextResponse.json(
      { message: "No se pudo verificar el correo." },
      { status: 400 },
    );
  const hash = await bcrypt.hash(password, 12);
  await transaction(async (c) => {
    await c.query(
      "UPDATE users SET password_hash=$2,credential_verified_at=NOW(),updated_at=NOW() WHERE id=$1",
      [user.id, hash],
    );
    await c.query("UPDATE app_sessions SET revoked_at=NOW() WHERE user_id=$1", [
      user.id,
    ]);
  });
  return NextResponse.json({
    message: "Cuenta verificada.",
    ...(await createSession(user)),
  });
});
