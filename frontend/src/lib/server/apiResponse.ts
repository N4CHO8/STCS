import { ForbiddenError } from "./access";
import { NextResponse } from "next/server";

import { StcsConflictError, StcsNotFoundError } from "./stcsData";
import { InputValidationError } from "./validation";
import { RateLimitError, ServiceUnavailableError } from "./errors";

export const errorResponse = (error: unknown, fallbackMessage: string) => {
  const code = (error as { code?: string })?.code;
  const unavailable =
    !!code &&
    [
      "ECONNREFUSED",
      "ECONNRESET",
      "ETIMEDOUT",
      "ENOTFOUND",
      "EAI_AGAIN",
      "57P01",
      "57P02",
      "57P03",
      "53300",
      "08006",
    ].includes(code);
  const status =
    error instanceof ServiceUnavailableError || unavailable
      ? 503
      : error instanceof RateLimitError
        ? 429
        : error instanceof ForbiddenError
          ? 403
          : error instanceof InputValidationError ||
              error instanceof SyntaxError
            ? 400
            : error instanceof StcsNotFoundError
              ? 404
              : error instanceof StcsConflictError
                ? 409
                : 500;

  return NextResponse.json(
    {
      message:
        status === 500 || unavailable
          ? fallbackMessage
          : error instanceof Error
            ? error.message
            : fallbackMessage,
    },
    { status },
  );
};
