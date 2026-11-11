import { Pool, QueryResult, QueryResultRow, types } from "pg";
import { rootCertificates } from "node:tls";
import { SUPABASE_CA } from "./supabase-ca";
// Legacy timestamp columns store UTC without an offset. Node must not interpret them as the workstation's local time.
types.setTypeParser(1114, (value) => new Date(value.replace(" ", "T") + "Z"));

const globalForPool = globalThis as unknown as {
  stcsPool?: Pool;
};

const createPool = (): Pool => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL no esta configurada.");
  }

  const shouldUseSsl =
    process.env.DATABASE_SSL === "true" ||
    databaseUrl.includes("sslmode=require") ||
    databaseUrl.includes("supabase.co") ||
    databaseUrl.includes("pooler.supabase.com");

  const parsed = new URL(databaseUrl);
  // pg-connection-string SSL parameters must not override verified TLS below.
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
    parsed.searchParams.delete(key);
  const connectionString = parsed.toString();

  return new Pool({
    connectionString,
    ssl: shouldUseSsl
      ? { rejectUnauthorized: true, ca: [...rootCertificates, SUPABASE_CA] }
      : undefined,
    connectionTimeoutMillis: 10000,
  });
};

const getPool = (): Pool => {
  if (!globalForPool.stcsPool) {
    globalForPool.stcsPool = createPool();
  }

  return globalForPool.stcsPool;
};

export const query = async <T extends QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> => getPool().query<T>(text, params);

/** Keep multi-row account/assignment edits atomic; never share a pooled transaction. */
export const transaction = async <T>(
  run: (client: import("pg").PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
