import { NextRequest, NextResponse } from "next/server";

const DEVICE_API_KEY_HEADER = "x-stcs-device-key";

export const authenticateDeviceRequest = (
  request: NextRequest
): NextResponse | null => {
  const configuredKey = process.env.STCS_DEVICE_API_KEY;

  if (!configuredKey) {
    return NextResponse.json(
      { message: "STCS_DEVICE_API_KEY no esta configurada." },
      { status: 500 }
    );
  }

  const requestKey = request.headers.get(DEVICE_API_KEY_HEADER);

  if (!requestKey || requestKey !== configuredKey) {
    return NextResponse.json(
      { message: "Dispositivo no autorizado." },
      { status: 401 }
    );
  }

  return null;
};
