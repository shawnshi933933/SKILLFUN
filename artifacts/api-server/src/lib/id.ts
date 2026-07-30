import { nanoid } from "nanoid";

/**
 * Generate a prefixed ID. e.g. generateId("sk") → "sk_V1StGXR8_Z5jdHi6B"
 */
export function generateId(prefix: "sk" | "bd" | "cl" | "gv" | "ca"): string {
  return `${prefix}_${nanoid(20)}`;
}
