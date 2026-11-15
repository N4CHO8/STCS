import { NextRequest } from "next/server";
import { authenticateDeviceRequest } from "@/lib/server/deviceAuth";
import { deviceMedia } from "@/lib/server/media";
import { errorResponse } from "@/lib/server/apiResponse";
export const dynamic = "force-dynamic";
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ deviceCode: string; pictogramId: string; kind: string }>;
  },
) {
  const p = await params,
    denied = await authenticateDeviceRequest(request, p.deviceCode);
  if (denied) return denied;
  try {
    const file = await deviceMedia(
      p.deviceCode,
      p.pictogramId,
      p.kind,
      request.nextUrl.searchParams.get("v"),
    );
    return new Response(new Uint8Array(file.data), {
      headers: {
        "Content-Type":
          p.kind === "audio" ? "audio/wav" : "application/octet-stream",
        "Content-Length": String(file.data.length),
        "Cache-Control": "private, no-store",
        "X-STCS-SHA256": file.hash,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return errorResponse(e, "No se pudo obtener el archivo del dispositivo.");
  }
}
