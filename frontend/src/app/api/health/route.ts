import { NextResponse } from "next/server";

import { query } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await query("SELECT 1");
    const database = new URL(process.env.DATABASE_URL!);
    const isolated =
      process.env.STCS_TEST_ISOLATED === "1" &&
      ["localhost", "127.0.0.1"].includes(database.hostname);
    return NextResponse.json({
      status: "ok",
      database: "connected",
      ...(isolated ? { testDatabase: database.host + database.pathname } : {}),
    });
  } catch {
    return NextResponse.json(
      { status: "unavailable", database: "unavailable" },
      { status: 503 },
    );
  }
}
