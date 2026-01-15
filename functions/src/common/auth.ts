import type { Request } from "express";
import { ApiError, ERROR_CODES } from "./errors";
import { HTTP_STATUS } from "./httpStatus";
import { AUTH } from "./constants";

export function requireApiKey(req: Request, expected: string | undefined): void {
    if (!expected) {
        throw new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL,
            "API key is not configured"
        );
    }

    const provided = req.header(AUTH.API_KEY_HEADER);

    if (!provided || provided !== expected) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.UNAUTHORIZED,
            "Missing or invalid API key"
        );
    }
}
