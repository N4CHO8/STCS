import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};

export const env = {
  port: toNumber(process.env.BACKEND_PORT, 4000),
  host: process.env.BACKEND_HOST ?? "0.0.0.0",
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://stcs_user:stcs_password@database:5432/stcs_db",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000"
};
