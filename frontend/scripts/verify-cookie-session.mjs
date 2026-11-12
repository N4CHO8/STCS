import assert from "node:assert/strict";
import {
  CLOUD_DEMO_ACCOUNTS,
  CLOUD_DEMO_PASSWORD,
} from "../src/lib/cloud-demo-accounts.ts";

// Called only after the outer suite confirms localhost and its disposable DB.
export async function verifyCookieSession(base) {
  assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
  let count = 0;
  const request = async (path, options = {}, status = 200) => {
    const r = await fetch(base + path, options);
    assert.equal(r.status, status, `${path}: unexpected HTTP status`);
    count++;
    return r;
  };
  const login = async (cookie) => {
    const r = await request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: base,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify({
        email: CLOUD_DEMO_ACCOUNTS[0].email,
        password: CLOUD_DEMO_PASSWORD,
      }),
    });
    const body = await r.json();
    assert.equal(body.token, undefined);
    assert.ok(Date.parse(body.expiresAt) > Date.now());
    const set = r.headers.get("set-cookie");
    assert.match(set, /HttpOnly/i);
    assert.match(set, /SameSite=Strict/i);
    assert.match(set, /Max-Age=7200/i);
    assert.equal(r.headers.get("cache-control"), "no-store");
    return set.split(";")[0];
  };
  const first = await login();
  const second = await login(first);
  await request("/api/auth/me", { headers: { Cookie: first } }, 401);
  await request("/api/auth/me", { headers: { Cookie: second } });
  await request(
    "/api/auth/logout",
    {
      method: "POST",
      headers: { Cookie: second, Origin: "https://other.invalid" },
    },
    403,
  );
  await request(
    "/api/auth/logout",
    { method: "POST", headers: { Cookie: second } },
    403,
  );
  await request(
    "/api/stcs/portal",
    {
      method: "POST",
      headers: {
        Cookie: second,
        Origin: "https://other.invalid",
        "Content-Type": "application/json",
      },
      body: "{}",
    },
    403,
  );
  const loggedOut = await request("/api/auth/logout", {
    method: "POST",
    headers: { Cookie: second, Origin: base },
  });
  assert.match(loggedOut.headers.get("set-cookie"), /Max-Age=0/i);
  await request("/api/auth/me", { headers: { Cookie: second } }, 401);
  return count;
}
