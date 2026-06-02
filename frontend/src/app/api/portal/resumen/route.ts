import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest, isAuthError } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authUser = authenticateRequest(request);

  if (isAuthError(authUser)) {
    return authUser;
  }

  return NextResponse.json({
    message: "Acceso autorizado al portal protegido.",
    session: {
      fullName: authUser.fullName,
      email: authUser.email,
      role: authUser.role
    }
  });
}
