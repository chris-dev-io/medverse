/**
 * Infrastructure constants
 */
export const CLOUD_FUNCTIONS_REGION = "us-central1";

/**
 * Firestore
 */
export const COLLECTIONS = {
    SESSIONS: "sessions"
} as const;

/**
 * Session domain
 */
export const SESSION_STATUSES = ["pending", "active", "completed", "failed"] as const;

export const ALLOWED_SESSION_REGIONS = ["eu-central", "us-east"] as const;

export const AUTH = {
    API_KEY_HEADER: "x-api-key",
    ENV_API_KEY_NAME: "MEDVERSE_API_KEY"
} as const;

