import type { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "./apiResponse";
export function withApi(
  handler: (request: NextRequest) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      return errorResponse(error, "No fue posible procesar la solicitud.");
    }
  };
}
