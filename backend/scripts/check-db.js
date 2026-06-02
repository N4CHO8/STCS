const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const rootDir = path.resolve(__dirname, "..", "..");
const localEnvPath = path.join(rootDir, ".env");

if (fs.existsSync(localEnvPath)) {
  const envLines = fs.readFileSync(localEnvPath, "utf8").split(/\r?\n/);

  for (const line of envLines) {
    const separatorIndex = line.indexOf("=");

    if (!line || line.startsWith("#") || separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex);
    const value = line.slice(separatorIndex + 1);

    process.env[key] ??= value;
  }
}

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

const pool = new Pool({
  connectionString,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined
});

async function main() {
  const result = await pool.query("SELECT NOW() AS now");

  console.log(
    JSON.stringify(
      {
        databaseConnected: true,
        checkedAt: result.rows[0].now
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
