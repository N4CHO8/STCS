import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const base = process.env.STCS_WORKER_URL,
  token = process.env.STCS_MEDIA_WORKER_KEY;
const python = process.env.STCS_TTS_PYTHON,
  model = process.env.STCS_TTS_MODEL;
if (!base || !token || token.length < 32 || !python || !model)
  throw new Error(
    "Configure STCS_WORKER_URL, STCS_MEDIA_WORKER_KEY, STCS_TTS_PYTHON and STCS_TTS_MODEL.",
  );
const url = new URL(base);
const localHost = ["localhost", "127.0.0.1"].includes(url.hostname);
const privateHost = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(
  url.hostname,
);
if (
  url.protocol !== "https:" &&
  !(
    url.protocol === "http:" &&
    (localHost || (privateHost && process.env.STCS_ALLOW_LOCAL_HTTP === "1"))
  )
)
  throw new Error(
    "Worker requires HTTPS or explicitly authorized private development HTTP.",
  );
const headers = { "x-stcs-worker-key": token };
async function api(path, options = {}) {
  const r = await fetch(base + path, {
    ...options,
    headers: { ...headers, ...options.headers },
    signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error("Voice preparation API returned HTTP " + r.status);
  return r.json();
}
async function synthesize(text, out) {
  await new Promise((resolve, reject) => {
    const child = spawn(
      python,
      [
        fileURLToPath(new URL("./voice/synthesize.py", import.meta.url)),
        model,
        out,
      ],
      { stdio: ["pipe", "ignore", "ignore"], windowsHide: true },
    );
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Voice synthesis timed out"));
    }, 60000);
    child.once("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      code === 0 ? resolve() : reject(new Error("Voice synthesis failed"));
    });
    child.stdin.on("error", () => {});
    child.stdin.end(JSON.stringify({ text }));
  });
}
let prepared = 0;
while (true) {
  let job;
  try {
    ({ data: job } = await api("/api/internal/media-jobs", { method: "POST" }));
  } catch (error) {
    if (!process.argv.includes("--watch")) throw error;
    console.error("Voice service unavailable; reconnecting in five seconds.");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    continue;
  }
  if (!job) {
    if (!process.argv.includes("--watch")) break;
    await new Promise((r) => setTimeout(r, 5000));
    continue;
  }
  const dir = await mkdtemp(join(tmpdir(), "stcs-voice-"));
  try {
    if (job.voice !== "piper-es_ES-davefx-medium-d2c9224e1223-v1")
      throw new Error("Unsupported voice");
    const path = join(dir, "phrase.wav");
    await synthesize(job.phrase, path);
    const form = new FormData();
    form.set("lease", job.lease);
    form.set(
      "audio",
      new Blob([await readFile(path)], { type: "audio/wav" }),
      "phrase.wav",
    );
    await api("/api/internal/media-jobs/" + job.cache_key, {
      method: "POST",
      body: form,
    });
    prepared++;
    console.log("Voice prepared; job " + job.cache_key.slice(0, 12));
  } catch {
    await api("/api/internal/media-jobs/" + job.cache_key, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lease: job.lease, error: true }),
    }).catch(() => undefined); // A lost lease is reclaimed by the server after its deadline.
    console.error(
      "Voice preparation failed; retry is available in the editor.",
    );
  } finally {
    if (!resolve(dir).startsWith(resolve(tmpdir()) + sep + "stcs-voice-"))
      throw new Error("Unexpected temporary directory");
    await rm(dir, { recursive: true, force: true });
  }
  if (process.argv.includes("--once")) break;
}
console.log("Prepared audio jobs: " + prepared);
