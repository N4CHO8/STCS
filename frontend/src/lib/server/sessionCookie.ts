import { NextRequest, NextResponse } from "next/server";
import { query } from "./db";
import { verifyJwtToken } from "./jwt";
import { getJwtSecret, type UserRow } from "./auth";
import { createSession } from "./sessions";

export const SESSION_COOKIE = "stcs-session";

/** Only the browser receives the credential, through an HttpOnly cookie. */
export async function sessionResponse(
  request: NextRequest,
  user: UserRow,
  message: string,
) {
  const session = await createSession(user);
  const previous = request.cookies.get(SESSION_COOKIE)?.value;
  if (previous) {
    let old: { sub: string; sid: string } | undefined;
    try {
      old = verifyJwtToken<{ sub: string; sid: string; exp?: number }>(
        previous,
        getJwtSecret(),
      );
    } catch {
      /* Expired cookies need no revocation. */
    }
    if (old)
      await query(
        "UPDATE app_sessions SET revoked_at=NOW() WHERE id=$1 AND user_id=$2",
        [old.sid, old.sub],
      );
  }
  const { token, ...publicSession } = session;
  const response = NextResponse.json(
    { message, ...publicSession },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "strict",
    path: "/",
    maxAge: 7200,
  });
  return response;
}

export function expireSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
