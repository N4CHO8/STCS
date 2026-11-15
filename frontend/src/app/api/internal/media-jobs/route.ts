import { NextRequest, NextResponse } from "next/server";
import { authorizeWorker, claimAudioJob } from "@/lib/server/media";
import { errorResponse } from "@/lib/server/apiResponse";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    authorizeWorker(request);
    return NextResponse.json(
      { data: await claimAudioJob() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e, "No se pudo solicitar la preparación de voz.");
  }
}
