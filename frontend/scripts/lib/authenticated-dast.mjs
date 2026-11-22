import assert from "node:assert/strict";
import http from "node:http";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

export const isHighRiskAlert = (alert) =>
  /^(high|critical)$/i.test(String(alert.risk)) || Number(alert.risk) >= 3;

const image =
  "ghcr.io/zaproxy/zaproxy@sha256:9624669db72f54d86c4b46a7064518bd9bf79d8c61a4c31befa9923489f328af";
export async function authenticatedDast({
  origin,
  accounts,
  password,
  profiles,
}) {
  assert.equal(process.env.STCS_TEST_ISOLATED, "1");
  assert.equal(origin, "http://127.0.0.1:3400");
  assert.equal(
    (await (await fetch(origin + "/api/health")).json()).testDatabase,
    "127.0.0.1:55432/stcs_release_tests",
  );
  const name = "stcs-auth-zap-" + randomUUID();
  let container;
  const cookies = [];
  const checks = [];
  const api = (path) =>
    new Promise((done, reject) => {
      const req = http.request(
        {
          host: "127.0.0.1",
          port: 8099,
          path: "/JSON/" + path,
          headers: { Host: "zap" },
        },
        (response) => {
          let body = "";
          response.setEncoding("utf8");
          response.on("data", (chunk) => (body += chunk));
          response.on("end", () => {
            try {
              assert.equal(response.statusCode, 200);
              done(JSON.parse(body));
            } catch (e) {
              reject(e);
            }
          });
        },
      );
      req.setTimeout(5000, () => req.destroy(Error("ZAP API timeout")));
      req.on("error", reject);
      req.end();
    });
  // Send real HTTP requests through ZAP. Credentials remain in memory, never in arguments or reports.
  const proxied = (path, cookie) =>
    new Promise((done, reject) => {
      const req = http.request(
        {
          host: "127.0.0.1",
          port: 8099,
          path: "http://host.docker.internal:3400" + path,
          method: "GET",
          headers: {
            Host: "host.docker.internal:3400",
            ...(cookie ? { Cookie: cookie } : {}),
          },
        },
        (res) => {
          let body = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => {
            body += chunk;
            if (body.length > 8 * 1024 * 1024)
              req.destroy(Error("Response limit"));
          });
          res.on("end", () => done({ status: res.statusCode, body }));
        },
      );
      req.setTimeout(15000, () => req.destroy(Error("Proxy timeout")));
      req.on("error", reject);
      req.end();
    });
  try {
    container = execFileSync(
      "docker",
      [
        "run",
        "--rm",
        "-d",
        "--name",
        name,
        "-p",
        "127.0.0.1:8099:8080",
        image,
        "zap.sh",
        "-daemon",
        "-host",
        "0.0.0.0",
        "-port",
        "8080",
        "-config",
        "api.disablekey=true",
        "-config",
        "api.addrs.addr.name=.*",
        "-config",
        "api.addrs.addr.regex=true",
      ],
      { encoding: "utf8", windowsHide: true },
    ).trim();
    assert.match(container, /^[a-f0-9]{64}$/);
    let ready = false;
    for (let i = 0; i < 120; i++) {
      try {
        await api("core/view/version/");
        ready = true;
        break;
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    assert.ok(ready, "Local ZAP must become ready");
    for (const role of ["therapist", "teacher", "guardian", "admin"]) {
      const login = await fetch(origin + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: origin },
        body: JSON.stringify({ email: accounts[role], password }),
      });
      assert.equal(login.status, 200);
      const cookie = login.headers.get("set-cookie")?.split(";")[0];
      assert.ok(cookie);
      cookies.push(cookie);
      for (const [path, expected] of [
        ["/api/stcs/portal", 200],
        [
          "/api/stcs/events?profileId=" + profiles[0],
          ["therapist", "guardian"].includes(role) ? 200 : 403,
        ],
        [
          "/api/stcs/portal?profileId=" + profiles[1],
          ["therapist", "admin"].includes(role) ? 200 : 403,
        ],
      ]) {
        const result = await proxied(path, cookie);
        assert.equal(result.status, expected, role + " " + path);
        checks.push({
          role,
          path: path
            .replaceAll(profiles[0], ":assigned")
            .replaceAll(profiles[1], ":second"),
          expected,
          observed: result.status,
        });
      }
    }
    const anonymous = await proxied("/api/stcs/portal");
    assert.equal(anonymous.status, 401);
    checks.push({
      role: "anonymous",
      path: "/api/stcs/portal",
      expected: 401,
      observed: anonymous.status,
    });
    const html = await proxied("/", cookies[0]);
    assert.equal(html.status, 200);
    const assets = [
      ...html.body.matchAll(
        /(?:src|href)="(\/_next\/static\/[^"?#]+\.(?:js|css))[^" ]*"/g,
      ),
    ].map((m) => m[1]);
    for (const asset of [...new Set(assets)].slice(0, 12))
      assert.equal((await proxied(asset, cookies[0])).status, 200);
    let drained = false;
    for (let i = 0; i < 180; i++) {
      if (
        Number((await api("pscan/view/recordsToScan/")).recordsToScan) === 0
      ) {
        drained = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    assert.ok(drained, "Passive scan queue must finish");
    const alerts = (
      await api(
        "core/view/alerts/?baseurl=" +
          encodeURIComponent("http://host.docker.internal:3400"),
      )
    ).alerts;
    const high = alerts.filter(isHighRiskAlert);
    assert.equal(high.length, 0, "Treat high-risk findings before closing");
    const report = {
      generatedAt: new Date().toISOString(),
      scope:
        "Authenticated passive ZAP scan of actual local HTTP/API and assets, four roles plus anonymous; no active attack scan",
      image,
      zapVersion: (await api("core/view/version/")).version,
      checks,
      assetsScanned: Math.min(new Set(assets).size, 12),
      alerts: alerts.map((a) => ({
        id: a.pluginId,
        name: a.alert,
        risk: a.risk,
        confidence: a.confidence,
        description: a.description,
        solution: a.solution,
        reference: a.reference,
      })),
      limitations: [
        "Local fictitious data only; not production or a full pentest",
        "Fixed API cases and linked assets; no exhaustive SPA crawler",
        "Style CSP unsafe-inline remains a documented residual finding if reported",
      ],
    };
    await mkdir("../.codex-work/arreglos-locales-20261116", {
      recursive: true,
    });
    await writeFile(
      "../.codex-work/arreglos-locales-20261116/seguridad-autenticada.json",
      JSON.stringify(report, null, 2) + "\n",
    );
    console.log(
      JSON.stringify({
        authenticatedDastChecks: checks.length,
        alerts: report.alerts.map((a) => ({
          id: a.id,
          risk: a.risk,
          name: a.name,
        })),
        highRisk: high.length,
      }),
    );
  } finally {
    try {
      for (const cookie of cookies) {
        const r = await fetch(origin + "/api/auth/logout", {
          method: "POST",
          headers: { Cookie: cookie, Origin: origin },
        });
        assert.equal(r.status, 200);
      }
    } finally {
      if (container) {
        assert.match(container, /^[a-f0-9]{64}$/);
        execFileSync("docker", ["stop", container], {
          stdio: "ignore",
          windowsHide: true,
        });
      }
    }
  }
}
