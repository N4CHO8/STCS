import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { errorResponse } from "@/lib/server/apiResponse";
import { historyFilters } from "@/lib/server/history-filters";
import { exportDeviceEventHistory } from "@/lib/server/stcsData";

export const dynamic = "force-dynamic";

// Export has an audit side effect, so use POST and the existing CSRF protection.
export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (isAuthError(user)) return user;
  try {
    const result = await exportDeviceEventHistory(
      user,
      historyFilters(request.nextUrl.searchParams),
    );
    return new NextResponse(result.csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="historial-stcs.csv"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-STCS-Export-Id": result.id,
        "X-STCS-Export-Rows": String(result.count),
      },
    });
  } catch (error) {
    return errorResponse(error, "No fue posible exportar el historial.");
  }
}
