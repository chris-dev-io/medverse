import type { Request } from "express";
import { HTTP_STATUS } from "./httpStatus";
import { log } from "./logging";

export const ERROR_CODES = {
    INVALID_ARGUMENT: "INVALID_ARGUMENT",
    NOT_FOUND: "NOT_FOUND",
    METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
    UNAUTHORIZED: "UNAUTHORIZED",
    INTERNAL: "INTERNAL"
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class ApiError extends Error {
    public readonly status: number;
    public readonly code: ErrorCode;

    constructor(status: number, code: ErrorCode, message: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

export type HttpError = {
    status: number;
    body: { error: { code: ErrorCode; message: string } };
};

export function toHttpError(err: unknown): HttpError {
    if (err instanceof ApiError) {
        return {
            status: err.status,
            body: { error: { code: err.code, message: err.message } }
        };
    }

    return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        body: { error: { code: ERROR_CODES.INTERNAL, message: "Internal server error" } }
    };
}

export function logHttpError(
    context: string,
    req: Request,
    err: unknown,
    httpErr: HttpError
): void {
    if (httpErr.status >= 500) {
        log.error(`${context} error`, err);
        return;
    }

    if (httpErr.status >= 400) {
        log.warn(`${context} request rejected`, {
            status: httpErr.status,
            code: httpErr.body.error.code,
            message: httpErr.body.error.message,
            method: req.method,
            path: req.path
        });
        return;
    }
}

