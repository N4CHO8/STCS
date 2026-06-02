import { Pool, QueryResult, QueryResultRow } from "pg";

import { env } from "./env";

const removeSslModeParameter = (databaseUrl: string): string =>
  databaseUrl
    .replace("?sslmode=require&", "?")
    .replace("&sslmode=require", "")
    .replace("?sslmode=require", "");

export const pool = new Pool({
  connectionString: env.databaseSsl
    ? removeSslModeParameter(env.databaseUrl)
    : env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : undefined
});

export const query = async <T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> => pool.query<T>(text, params);

export const testDatabaseConnection = async (): Promise<boolean> => {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
    return true;
  } finally {
    client.release();
  }
};
