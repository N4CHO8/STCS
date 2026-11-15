import { scheduleVoicePreparation } from "@/lib/server/cloud-voice";
import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import {
  pictogramForUser,
  audioForPhrase,
  prepareAudioForUser,
  withAudioState,
  phraseKey,
} from "@/lib/server/media";
import { InputValidationError } from "@/lib/server/validation";
import { errorResponse } from "@/lib/server/apiResponse";
export const dynamic = "force-dynamic";
type Params = { params: Promise<{ pictogramId: string }> };
export async function GET(request: NextRequest, { params }: Params) {
  const user = await authenticateRequest(request);
  if (isAuthError(user)) return user;
  try {
    const p = await pictogramForUser(user, (await params).pictogramId);
    if (request.nextUrl.searchParams.has("status")) {
      scheduleVoicePreparation();
      return NextResponse.json({
        data: (await withAudioState([{ id: p.id, message: p.message }]))[0],
      });
    }
    const expected = request.nextUrl.searchParams.get("v");
    if (expected && expected !== phraseKey(p.message))
      throw new InputValidationError(
        "La frase cambió. Actualiza el tablero antes de escucharla.",
      );
    const audio = await audioForPhrase(p.message);
    return new Response(new Uint8Array(audio.data), {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    return errorResponse(e, "No se pudo obtener la voz.");
  }
}
export async function POST(request: NextRequest, { params }: Params) {
  const user = await authenticateRequest(request);
  if (isAuthError(user)) return user;
  try {
    const data = await prepareAudioForUser(user, (await params).pictogramId);
    scheduleVoicePreparation();
    return NextResponse.json({ data });
  } catch (e) {
    return errorResponse(e, "No se pudo preparar la voz.");
  }
}
