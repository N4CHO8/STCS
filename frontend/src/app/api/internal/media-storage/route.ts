import { NextRequest, NextResponse } from "next/server";
import { authorizeWorker } from "@/lib/server/media";
import { errorResponse } from "@/lib/server/apiResponse";
import { ServiceUnavailableError } from "@/lib/server/errors";
export const dynamic = "force-dynamic";

// Explicit release maintenance only. Never called by login or normal user flows.
export async function POST(request: NextRequest) {
  try {
    authorizeWorker(request);
    const url = process.env.SUPABASE_URL,
      key = process.env.SUPABASE_SECRET_KEY,
      bucket = process.env.STCS_MEDIA_BUCKET;
    if (!url || !key || bucket !== "stcs-media")
      throw new ServiceUnavailableError("Configura Storage privado de STCS.");
    const headers = {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    };
    let response = await fetch(`${url}/storage/v1/bucket/${bucket}`, {
      headers,
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (response.status === 404 || response.status === 400) {
      response = await fetch(`${url}/storage/v1/bucket`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: bucket,
          name: bucket,
          public: false,
          file_size_limit: 2097152,
          allowed_mime_types: [
            "image/png",
            "application/octet-stream",
            "audio/wav",
          ],
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok)
        throw new ServiceUnavailableError(
          "No se pudo crear el bucket privado.",
        );
      response = await fetch(`${url}/storage/v1/bucket/${bucket}`, {
        headers,
        cache: "no-store",
      });
    }
    if (!response.ok)
      throw new ServiceUnavailableError(
        "No se pudo verificar Storage privado.",
      );
    const info = await response.json();
    if (info.public !== false)
      throw new ServiceUnavailableError(
        "El bucket debe ser privado antes de usarlo.",
      );
    return NextResponse.json({ bucket, private: true });
  } catch (error) {
    return errorResponse(error, "No se pudo preparar Storage.");
  }
}
