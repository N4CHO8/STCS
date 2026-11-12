import { NextRequest, NextResponse } from "next/server";

/** Cookies authenticate browsers; reject cross-origin writes before touching data. */
export function proxy(request: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method))
    return NextResponse.next();
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  const cookieSession = request.cookies.has("stcs-session");
  let sameOrigin = !origin;
  if (origin) {
    try {
      const source = new URL(origin);
      // Next normalizes loopback URLs; Host is the browser's actual destination.
      sameOrigin =
        source.host === (request.headers.get("host") ?? request.nextUrl.host) &&
        source.protocol === request.nextUrl.protocol;
    } catch {
      sameOrigin = false;
    }
  }
  if (!sameOrigin || site === "cross-site" || (cookieSession && !origin)) {
    return NextResponse.json(
      { message: "Origen de solicitud no permitido." },
      { status: 403 },
    );
  }
  return NextResponse.next();
}
export const config = { matcher: "/api/:path*" };
