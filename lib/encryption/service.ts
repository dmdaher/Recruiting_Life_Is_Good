import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be exactly 32 characters");
  }
  return Buffer.from(key, "utf-8");
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Output format: iv:authTag:ciphertext (all base64 encoded)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf-8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Decrypt a ciphertext string encrypted with encrypt().
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const parts = ciphertext.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted value format. Expected iv:authTag:ciphertext");
  }

  const iv = Buffer.from(parts[0], "base64");
  const authTag = Buffer.from(parts[1], "base64");
  const encrypted = parts[2];

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "base64", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
}

/**
 * Check if a value looks like it's already encrypted (has the iv:tag:cipher format).
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(":");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

/**
 * Encrypt a field value, or return as-is if already encrypted.
 */
export function encryptField(value: string | null | undefined): string | null {
  if (!value) return null;
  if (isEncrypted(value)) return value;
  return encrypt(value);
}

/**
 * Decrypt a field value, or return as-is if not encrypted.
 */
export function decryptField(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!isEncrypted(value)) return value;
  try {
    return decrypt(value);
  } catch {
    // If decryption fails, return the raw value (may be unencrypted data from seed)
    return value;
  }
}
