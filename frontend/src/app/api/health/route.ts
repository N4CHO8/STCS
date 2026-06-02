import { NextResponse } from "next/server";

import { query } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await query("SELECT 1");

  return NextResponse.json({
    status: "ok",
    database: "connected"
  });
}
