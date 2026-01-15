import crypto from "crypto";

export function generateSessionId(): string {
    return crypto.randomUUID();
}
