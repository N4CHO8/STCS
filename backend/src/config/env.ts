import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://stcs_user:stcs_password@database:5432/stcs_db";

export const env = {
  port: toNumber(process.env.PORT ?? process.env.BACKEND_PORT, 4000),
  host: process.env.BACKEND_HOST ?? "0.0.0.0",
  databaseUrl,
  databaseSsl:
    process.env.DATABASE_SSL === "true" ||
    databaseUrl.includes("sslmode=require") ||
    databaseUrl.includes("supabase.co") ||
    databaseUrl.includes("pooler.supabase.com"),
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ?? "stcs-dev-jwt-secret-cambiar-en-produccion"
};
