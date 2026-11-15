import { NextRequest, NextResponse } from "next/server";
import { authorizeWorker } from "@/lib/server/media";
import { runCloudVoiceJob } from "@/lib/server/cloud-voice";
import { errorResponse } from "@/lib/server/apiResponse";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

// Maintenance/recovery entry point: process one existing leased job, never seed records.
export async function POST(request: NextRequest) {
  try {
    authorizeWorker(request);
    return NextResponse.json(await runCloudVoiceJob());
  } catch (error) {
    return errorResponse(error, "No se pudo preparar la voz en la nube.");
  }
}
