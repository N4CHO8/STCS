import { NextRequest, NextResponse } from "next/server";

/** Cookies authenticate browsers; reject cross-origin writes before touching data. */
export function proxy(request: NextRequest) {
  // Next reads the request CSP while rendering and applies this fresh nonce to
  // its hydration scripts. Never reuse a nonce from static HTML or a client.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "media-src 'self' blob:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  const next = () => {
    const response = NextResponse.next({ request: { headers } });
    response.headers.set("Content-Security-Policy", policy);
    return response;
  };
  if (
    !request.nextUrl.pathname.startsWith("/api/") ||
    ["GET", "HEAD", "OPTIONS"].includes(request.method)
  )
    return next();
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
  return next();
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|pictograms/).*)"],
};
