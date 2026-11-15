import { after } from "next/server";
import { claimAudioJob, completeAudioJob } from "./media";
import { MEDIA_AUDIO_LIMIT } from "@/lib/media-contract";
import { ServiceUnavailableError } from "./errors";

// Short, demand-driven cloud work replaces a permanently running desktop worker.
// The lease and phrase cache remain in PostgreSQL, never in function memory.
export async function runCloudVoiceJob() {
  const endpoint =
    process.env.STCS_VOICE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/voice`
      : null);
  const key = process.env.STCS_MEDIA_WORKER_KEY;
  if (!endpoint || !key || key.length < 32)
    throw new ServiceUnavailableError("La voz en la nube no está configurada.");
  const target = new URL(endpoint);
  if (
    target.protocol !== "https:" &&
    !(
      process.env.STCS_TEST_ISOLATED === "1" &&
      ["127.0.0.1", "localhost"].includes(target.hostname)
    )
  )
    throw new Error("Cloud voice requires HTTPS");
  let job: Awaited<ReturnType<typeof claimAudioJob>> = null;
  try {
    job = await claimAudioJob();
    if (!job) return { prepared: false };
    const response = await fetch(endpoint, {
      method: "POST",
      redirect: "error",
      headers: {
        "Content-Type": "application/json",
        "x-stcs-worker-key": key,
        ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET
          ? {
              "x-vercel-protection-bypass":
                process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
            }
          : {}),
      },
      body: JSON.stringify({ text: job.phrase, voice: job.voice }),
      signal: AbortSignal.timeout(65000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Voice provider unavailable");
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > MEDIA_AUDIO_LIMIT)
      throw new Error("Voice size limit exceeded");
    await completeAudioJob(job.cache_key, job.lease, bytes);
    return { prepared: true };
  } catch {
    if (job)
      await completeAudioJob(job.cache_key, job.lease, null).catch(
        () => undefined,
      );
    throw new ServiceUnavailableError("No se pudo preparar la voz. Reintenta.");
  }
}
export function scheduleVoicePreparation() {
  if (!process.env.STCS_VOICE_URL && !process.env.VERCEL_URL) return;
  after(async () => {
    try {
      await runCloudVoiceJob();
    } catch {
      console.error("STCS cloud voice preparation failed; retry is available.");
    }
  });
}
