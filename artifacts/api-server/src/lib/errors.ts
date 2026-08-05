import type { Response } from "express";

export const ErrorCode = {
  NOT_FOUND:          "NOT_FOUND",
  UNAUTHORIZED:       "UNAUTHORIZED",
  FORBIDDEN:          "FORBIDDEN",
  INVALID_INPUT:      "INVALID_INPUT",
  INVALID_SIGNATURE:  "INVALID_SIGNATURE",
  RPC_ERROR:          "RPC_ERROR",
  CONFLICT:           "CONFLICT",
  INTERNAL:           "INTERNAL",
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

const STATUS_MAP: Record<ErrorCode, number> = {
  NOT_FOUND:          404,
  UNAUTHORIZED:       401,
  FORBIDDEN:          403,
  INVALID_INPUT:      400,
  INVALID_SIGNATURE:  401,
  RPC_ERROR:          502,
  CONFLICT:           409,
  INTERNAL:           500,
};

export function apiError(
  res: Response,
  code: ErrorCode,
  message: string,
  statusOverride?: number,
  extra?: Record<string, unknown>
): void {
  const status = statusOverride ?? STATUS_MAP[code];
  res.status(status).json({ error: { code, message, ...extra } });
}
