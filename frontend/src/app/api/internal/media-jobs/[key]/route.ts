import { NextRequest, NextResponse } from "next/server";
import {
  authorizeWorker,
  completeAudioJob,
  limitedForm,
} from "@/lib/server/media";
import { MEDIA_AUDIO_LIMIT } from "@/lib/media-contract";
import { errorResponse } from "@/lib/server/apiResponse";
import { InputValidationError } from "@/lib/server/validation";
export const dynamic = "force-dynamic";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    authorizeWorker(request);
    const key = (await params).key;
    if (request.headers.get("content-type")?.startsWith("application/json")) {
      const body = await request.json();
      await completeAudioJob(key, String(body.lease), null);
    } else {
      const form = await limitedForm(request, MEDIA_AUDIO_LIMIT + 65536),
        audio = form.get("audio");
      if (!(audio instanceof File) || audio.size > MEDIA_AUDIO_LIMIT)
        throw new InputValidationError("Falta un WAV válido.");
      await completeAudioJob(
        key,
        String(form.get("lease")),
        Buffer.from(await audio.arrayBuffer()),
      );
    }
    return NextResponse.json({ accepted: true });
  } catch (e) {
    return errorResponse(e, "No se pudo guardar la voz preparada.");
  }
}
