import { randomUUID, createHash } from "node:crypto";
import { query } from "./db";
import { createJwtToken } from "./jwt";
import { getJwtSecret, mapUser, type UserRow } from "./auth";
import { RateLimitError } from "./errors";
export async function createSession(user: UserRow) {
  const sid = randomUUID();
  await query(
    "INSERT INTO app_sessions(id,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '2 hours')",
    [sid, user.id],
  );
  return {
    token: createJwtToken(
      {
        sub: user.id,
        sid,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      },
      getJwtSecret(),
      7200,
    ),
    expiresIn: "2h",
    user: mapUser(user),
  };
}
export async function limitAttempts(key: string, max = 10) {
  const hash = createHash("sha256").update(key).digest("hex");
  const result = await query<{ hits: number }>(
    `INSERT INTO app_rate_limits(key,hits,window_start) VALUES($1,1,NOW())
    ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN app_rate_limits.window_start<NOW()-INTERVAL '15 minutes' THEN 1 ELSE app_rate_limits.hits+1 END,
    window_start=CASE WHEN app_rate_limits.window_start<NOW()-INTERVAL '15 minutes' THEN NOW() ELSE app_rate_limits.window_start END RETURNING hits`,
    [hash],
  );
  if (result.rows[0].hits > max)
    throw new RateLimitError("Demasiados intentos. Espera 15 minutos.");
}
