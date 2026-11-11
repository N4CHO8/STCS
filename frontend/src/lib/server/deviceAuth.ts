import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { query } from "./db";

/** Each device is bound to its own credential. The legacy key only serves its explicitly named device. */
export async function authenticateDeviceRequest(
  request: NextRequest,
  deviceCode: string,
): Promise<NextResponse | null> {
  const provided = request.headers.get("x-stcs-device-key");
  if (!provided || provided.length > 512)
    return NextResponse.json(
      { message: "Dispositivo no autorizado." },
      { status: 401 },
    );
  try {
    const result = await query(
      "SELECT api_key_hash FROM devices WHERE device_code=$1",
      [deviceCode],
    );
    const row = result.rows[0];
    const legacy =
      process.env.STCS_LEGACY_DEVICE_CODE === deviceCode
        ? process.env.STCS_DEVICE_API_KEY
        : undefined;
    const expected =
      row?.api_key_hash ??
      (row && legacy
        ? createHash("sha256").update(legacy).digest("hex")
        : undefined);
    const actual = createHash("sha256").update(provided).digest("hex");
    if (
      !expected ||
      expected.length !== actual.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(actual))
    )
      return NextResponse.json(
        { message: "Dispositivo no autorizado." },
        { status: 401 },
      );
    return null;
  } catch {
    return NextResponse.json(
      { message: "No se pudo verificar el dispositivo." },
      { status: 503 },
    );
  }
}
