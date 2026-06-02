import { Pool, QueryResult, QueryResultRow } from "pg";

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

  const connectionString = shouldUseSsl
    ? databaseUrl
        .replace("?sslmode=require&", "?")
        .replace("&sslmode=require", "")
        .replace("?sslmode=require", "")
    : databaseUrl;

  return new Pool({
    connectionString,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined
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
  params?: unknown[]
): Promise<QueryResult<T>> => getPool().query<T>(text, params);
