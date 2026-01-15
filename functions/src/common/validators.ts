import { ApiError, ERROR_CODES } from "./errors";
import {HTTP_STATUS} from "./httpStatus";

/**
 * Ensures a value is a string and returns the trimmed value.
 * If `allowEmpty` is false (default), rejects empty/whitespace-only strings.
 */
export function requireString(
    value: unknown,
    fieldName: string,
    allowEmpty: boolean = false
): string {
    if (typeof value !== "string") {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_ARGUMENT, `${fieldName} must be a string`);
    }

    const trimmed = value.trim();

    if (!allowEmpty && trimmed.length === 0) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_ARGUMENT, `${fieldName} must be a non-empty string`);
    }

    return trimmed;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function optionalFirstQueryValue(value: unknown): string | undefined {
    if (value === undefined) return undefined;
    if (Array.isArray(value)) return value[0];
    return typeof value === "string" ? value : undefined;
}

export function requirePositiveInt(
    value: string,
    fieldName: string,
    max?: number
): number {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_ARGUMENT,
            `${fieldName} must be a positive integer`
        );
    }
    return max ? Math.min(n, max) : n;
}
