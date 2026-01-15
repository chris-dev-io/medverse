import { ApiError, ERROR_CODES } from "../../common/errors";
import {requireString, isRecord, requirePositiveInt, optionalFirstQueryValue} from "../../common/validators";
import { SESSION_STATUSES, ALLOWED_SESSION_REGIONS } from "../../common/constants";
import type {SessionStatus, SessionRegion, ListSessionsParams} from "./session.types";
import {HTTP_STATUS} from "../../common/httpStatus";
import {isOneOf} from "../../common/typeGuards";

export function validateRegion(input: unknown): SessionRegion {
    const region = requireString(input, "region");

    if (!isOneOf(region, ALLOWED_SESSION_REGIONS)) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_ARGUMENT,
            `region must be one of: ${ALLOWED_SESSION_REGIONS.join(", ")}`
        );
    }

    return region;
}

export function validateSessionId(input: unknown): string {
    return requireString(input, "sessionId");
}

export function validateStatus(input: unknown): SessionStatus {
    const status = requireString(input, "status");

    if (!isOneOf(status, SESSION_STATUSES)) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_ARGUMENT,
            `status must be one of: ${SESSION_STATUSES.join(", ")}`
        );
    }

    return status;
}

export function parseCreateSessionBody(body: unknown): { region: SessionRegion } {
    if (!isRecord(body)) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_ARGUMENT, "Request body must be a JSON object");
    }
    return { region: validateRegion(body.region) };
}

export function parseUpdateStatusBody(body: unknown): { sessionId: string; status: SessionStatus } {
    if (!isRecord(body)) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_ARGUMENT, "Request body must be a JSON object");
    }
    return {
        sessionId: validateSessionId(body.sessionId),
        status: validateStatus(body.status)
    };
}

export function parseListSessionsQuery(query: unknown): ListSessionsParams {
    const q = query as Record<string, unknown>;

    const statusRaw = optionalFirstQueryValue(q.status);
    const regionRaw = optionalFirstQueryValue(q.region);
    const limitRaw = optionalFirstQueryValue(q.limit);

    let status: SessionStatus | undefined;
    if (statusRaw !== undefined) {
        const s = requireString(statusRaw, "status");
        if (!isOneOf(s, SESSION_STATUSES)) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.INVALID_ARGUMENT,
                `status must be one of: ${SESSION_STATUSES.join(", ")}`
            );
        }
        status = s;
    }

    let region: SessionRegion | undefined;
    if (regionRaw !== undefined) {
        const r = requireString(regionRaw, "region");
        if (!isOneOf(r, ALLOWED_SESSION_REGIONS)) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                ERROR_CODES.INVALID_ARGUMENT,
                `region must be one of: ${ALLOWED_SESSION_REGIONS.join(", ")}`
            );
        }
        region = r;
    }

    const limit = limitRaw ? requirePositiveInt(limitRaw, "limit", 100) : 50;

    if (status && region) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_ARGUMENT,
            "Provide either 'status' or 'region', not both"
        );
    }

    return { status, region, limit };
}
