import { NextResponse } from "next/server";

import { StcsConflictError, StcsNotFoundError } from "./stcsData";
import { InputValidationError } from "./validation";

export const errorResponse = (error: unknown, fallbackMessage: string) => {
  const status =
    error instanceof InputValidationError || error instanceof SyntaxError
      ? 400
      : error instanceof StcsNotFoundError
        ? 404
        : error instanceof StcsConflictError
          ? 409
          : 500;

  return NextResponse.json(
    {
      message: error instanceof Error ? error.message : fallbackMessage
    },
    { status }
  );
};
