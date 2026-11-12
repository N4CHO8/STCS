import assert from "node:assert/strict";

// Tests may inspect Set-Cookie; browser JavaScript never receives this token.
export function testSession(response, body) {
  assert.equal(
    body.token,
    undefined,
    "Login must not expose its credential in JSON",
  );
  const cookie = response.headers.get("set-cookie");
  if (!body.user || !body.expiresAt || !cookie) return body;
  assert.match(cookie ?? "", /HttpOnly/i);
  assert.match(cookie, /SameSite=Strict/i);
  const token = cookie.match(/(?:^|,\s*)stcs-session=([^;]+)/)?.[1];
  assert.ok(token, "A successful login must set its HttpOnly session cookie");
  return { ...body, token: decodeURIComponent(token) };
}
