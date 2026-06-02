import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { mapUser, UserRow } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { createJwtToken } from "@/lib/server/jwt";
import { getJwtSecret } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { message: "email y password son obligatorios." },
      { status: 400 }
    );
  }

  const result = await query<UserRow>("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase()
  ]);

  if (!result.rowCount) {
    return NextResponse.json({ message: "Credenciales invalidas." }, { status: 401 });
  }

  const user = result.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return NextResponse.json({ message: "Credenciales invalidas." }, { status: 401 });
  }

  const token = createJwtToken(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name
    },
    getJwtSecret(),
    60 * 60 * 2
  );

  return NextResponse.json({
    message: "Inicio de sesion exitoso.",
    token,
    expiresIn: "2h",
    user: mapUser(user)
  });
}
