// Exercise the real watch loop against a disposable loopback transport, without TTS or records.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
assert.equal(process.env.STCS_TEST_ISOLATED, "1");
let requests = 0,
  worker;
let completed;
const recovered = new Promise((resolve) => {
  completed = resolve;
});
const server = createServer((req, res) => {
  requests++;
  res.setHeader("Content-Type", "application/json");
  res.statusCode = requests === 1 ? 503 : 200;
  res.end(JSON.stringify({ data: null }));
  if (requests === 2) completed();
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
let timeout;
try {
  worker = spawn(process.execPath, ["scripts/media-worker.mjs", "--watch"], {
    env: {
      ...process.env,
      STCS_WORKER_URL: `http://127.0.0.1:${server.address().port}`,
      STCS_MEDIA_WORKER_KEY: "isolated-worker-transport-key-123456789",
      STCS_TTS_PYTHON: process.execPath,
      STCS_TTS_MODEL: "unused-no-jobs",
    },
    stdio: "ignore",
    windowsHide: true,
  });
  await Promise.race([
    recovered,
    new Promise((_, reject) => {
      timeout = setTimeout(
        () => reject(new Error("Worker did not reconnect after 503")),
        12000,
      );
    }),
  ]);
  assert.equal(worker.exitCode, null);
  assert.ok(requests >= 2);
  console.log(
    "PASS: actual worker survives 503 and reconnects to the loopback API. No audio jobs or data created.",
  );
} finally {
  clearTimeout(timeout);
  worker?.kill();
  await new Promise((resolve) => server.close(resolve));
}
