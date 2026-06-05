import { createHmac, timingSafeEqual } from "crypto";

export interface JwtPayload {
  exp?: number;
  iat?: number;
}

interface JwtHeader {
  alg?: string;
  typ?: string;
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

export const createJwtToken = <T extends object>(
  payload: T,
  secret: string,
  expiresInSeconds: number
): string => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
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

export const verifyJwtToken = <T extends JwtPayload = JwtPayload>(
  token: string,
  secret: string
): T => {
  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Formato de token invalido.");
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const header = JSON.parse(fromBase64Url(encodedHeader)) as JwtHeader;

  if (header.alg !== "HS256" || header.typ !== "JWT") {
    throw new Error("Algoritmo de token no permitido.");
  }

  const expectedSignature = signSegment(unsignedToken, secret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new Error("Firma invalida.");
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload)) as T;
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < nowInSeconds) {
    throw new Error("Token expirado.");
  }

  return payload;
};
