import type { Request, Response } from "express";
import { ApiError, ERROR_CODES } from "./errors";
import { HTTP_STATUS } from "./httpStatus";

export function requireMethod(
    req: Request,
    method: "GET" | "POST" | "PATCH"
): void {
    if (req.method !== method) {
        throw new ApiError(
            HTTP_STATUS.METHOD_NOT_ALLOWED,
            ERROR_CODES.METHOD_NOT_ALLOWED,
            `Expected ${method}`
        );
    }
}

export function sendJson(res: Response, status: number, body: unknown): void {
    res.status(status).json(body);
}

function hasBody(req: Request): req is Request & { body: unknown } {
    return "body" in req;
}

export async function readJsonBody(req: Request): Promise<unknown> {
    const body: unknown = hasBody(req) ? req.body : undefined;

    if (body === undefined || body === null) return {};

    if (typeof body === "string") {
        try {
            return JSON.parse(body) as unknown;
        } catch {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_ARGUMENT, "Invalid JSON body");
        }
    }

    return body;
}
