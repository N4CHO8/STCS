import test from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import tls from "node:tls";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { execFileSync } from "node:child_process";

test("CP-RNF01-TLS01: actual PostgreSQL adapter rejects an untrusted server certificate", async () => {
  const directory = await mkdtemp(join(tmpdir(), "stcs-tls-test-"));
  const sockets = new Set();
  let server;
  const previous = {
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL,
  };
  try {
    const openssl =
      process.env.STCS_TEST_OPENSSL ??
      (process.platform === "win32"
        ? "C:/Program Files/Git/usr/bin/openssl.exe"
        : "openssl");
    execFileSync(
      openssl,
      [
        "req",
        "-x509",
        "-newkey",
        "rsa:2048",
        "-nodes",
        "-keyout",
        join(directory, "key.pem"),
        "-out",
        join(directory, "cert.pem"),
        "-days",
        "1",
        "-subj",
        "/CN=localhost",
        "-addext",
        "subjectAltName=DNS:localhost,IP:127.0.0.1",
      ],
      { stdio: "ignore", windowsHide: true },
    );
    const secureContext = tls.createSecureContext({
      key: await readFile(join(directory, "key.pem")),
      cert: await readFile(join(directory, "cert.pem")),
    });
    server = net.createServer((socket) => {
      sockets.add(socket);
      socket.on("close", () => sockets.delete(socket));
      socket.on("error", () => {});
      socket.once("data", (request) => {
        if (request.length !== 8) {
          socket.destroy();
          return;
        }
        socket.write("S");
        const secure = new tls.TLSSocket(socket, {
          isServer: true,
          secureContext,
        });
        secure.on("error", () => secure.destroy());
      });
    });
    await new Promise((done) => server.listen(0, "127.0.0.1", done));
    process.env.DATABASE_URL =
      "postgresql://test:test@127.0.0.1:" +
      server.address().port +
      "/isolated_tls";
    process.env.DATABASE_SSL = "true";
    const { query } = await import("../src/lib/server/db.ts");
    await assert.rejects(query("SELECT 1"), (e) =>
      ["DEPTH_ZERO_SELF_SIGNED_CERT", "SELF_SIGNED_CERT_IN_CHAIN"].includes(
        e.code,
      ),
    );
  } finally {
    await globalThis.stcsPool?.end();
    delete globalThis.stcsPool;
    for (const socket of sockets) socket.destroy();
    if (server) await new Promise((done) => server.close(done));
    if (previous.url === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous.url;
    if (previous.ssl === undefined) delete process.env.DATABASE_SSL;
    else process.env.DATABASE_SSL = previous.ssl;
    assert.ok(
      resolve(directory).startsWith(resolve(tmpdir()) + sep + "stcs-tls-test-"),
    );
    await rm(directory, { recursive: true, force: true });
  }
});
