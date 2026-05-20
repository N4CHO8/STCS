import { createHmac, timingSafeEqual } from "crypto";

interface JwtPayload {
  [key: string]: unknown;
  exp?: number;
  iat?: number;
}

const toBase64Url = (value: string): string =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const fromBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
};

const signSegment = (input: string, secret: string): string =>
  createHmac("sha256", secret)
    .update(input)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

export const createJwtToken = (
  payload: JwtPayload,
  secret: string,
  expiresInSeconds: number
): string => {
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: nowInSeconds,
    exp: nowInSeconds + expiresInSeconds
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(fullPayload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = signSegment(unsignedToken, secret);

  return `${unsignedToken}.${signature}`;
};

export const verifyJwtToken = (token: string, secret: string): JwtPayload => {
  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Formato de token invalido.");
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signSegment(unsignedToken, secret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new Error("Firma invalida.");
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload)) as JwtPayload;
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < nowInSeconds) {
    throw new Error("Token expirado.");
  }

  return payload;
};
