import { Pool, QueryResult, QueryResultRow } from "pg";

import { env } from "./env";

export const pool = new Pool({
  connectionString: env.databaseUrl
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
