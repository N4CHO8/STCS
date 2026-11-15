import { NextRequest } from "next/server";
import { authenticateRequest, isAuthError } from "@/lib/server/auth";
import { imageForUser } from "@/lib/server/media";
import { errorResponse } from "@/lib/server/apiResponse";
export const dynamic = "force-dynamic";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> },
) {
  const user = await authenticateRequest(request);
  if (isAuthError(user)) return user;
  try {
    return new Response(
      new Uint8Array(await imageForUser(user, (await params).imageId)),
      {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (e) {
    return errorResponse(e, "No se pudo obtener la imagen.");
  }
}
