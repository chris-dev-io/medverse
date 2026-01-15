import * as path from "node:path";
import * as dotenv from "dotenv";
import { CLOUD_FUNCTIONS_REGION } from "../src/common/constants";
import type { Session, SessionRegion, SessionStatus } from "../src/modules/sessions/session.types";

dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });
type ErrorResponse = { error: { code: string; message: string } };

function projectId(): string {
    return process.env.GCLOUD_PROJECT ?? "demo-medverse";
}

function baseUrl(): string {
    return `http://127.0.0.1:5001/${projectId()}/${CLOUD_FUNCTIONS_REGION}`;
}

function apiKey(): string {
    const key = process.env.MEDVERSE_API_KEY;
    if (!key) {
        throw new Error(
            "MEDVERSE_API_KEY not set. Add MEDVERSE_API_KEY=... to functions/.env for HTTP integration tests."
        );
    }
    return key;
}

async function httpJson<T>(
    url: string,
    init: RequestInit & { method: "GET" | "POST" | "PATCH" }
): Promise<{ status: number; body: T }> {
    const res = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey(),
            ...(init.headers ?? {})
        }
    });

    const text = await res.text();
    const body = (text ? JSON.parse(text) : {}) as T;

    return { status: res.status, body };
}

jest.setTimeout(60_000);

describe("Sessions HTTP integration (Functions + Firestore emulators)", () => {
    test("POST /createSession -> 201 + session payload", async () => {
        const url = `${baseUrl()}/createSession`;

        const { status, body } = await httpJson<Session>(url, {
            method: "POST",
            body: JSON.stringify({ region: "eu-central" satisfies SessionRegion })
        });

        expect(status).toBe(201);
        expect(body.sessionId).toBeTruthy();
        expect(body.region).toBe("eu-central");
        expect(body.status).toBe("pending");
        expect(body.createdAt).toBeTruthy();
        expect(body.updatedAt).toBeTruthy();
    });

    test("GET /getSession -> 200 for existing session", async () => {
        const created = await httpJson<Session>(`${baseUrl()}/createSession`, {
            method: "POST",
            body: JSON.stringify({ region: "us-east" satisfies SessionRegion })
        });

        expect(created.status).toBe(201);

        const url = `${baseUrl()}/getSession?sessionId=${encodeURIComponent(
            created.body.sessionId
        )}`;

        const { status, body } = await httpJson<Session>(url, { method: "GET" });

        expect(status).toBe(200);
        expect(body.sessionId).toBe(created.body.sessionId);
        expect(body.region).toBe("us-east");
    });

    test("PATCH /updateSessionStatus -> 200 + updated status", async () => {
        const created = await httpJson<Session>(`${baseUrl()}/createSession`, {
            method: "POST",
            body: JSON.stringify({ region: "eu-central" satisfies SessionRegion })
        });

        expect(created.status).toBe(201);

        const { status, body } = await httpJson<Session>(
            `${baseUrl()}/updateSessionStatus`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    sessionId: created.body.sessionId,
                    status: "active" satisfies SessionStatus
                })
            }
        );

        expect(status).toBe(200);
        expect(body.sessionId).toBe(created.body.sessionId);
        expect(body.status).toBe("active");
    });

    test("GET /listSessions?status=active -> only active sessions", async () => {
        await httpJson<Session>(`${baseUrl()}/createSession`, {
            method: "POST",
            body: JSON.stringify({ region: "eu-central" satisfies SessionRegion })
        });

        const s2 = await httpJson<Session>(`${baseUrl()}/createSession`, {
            method: "POST",
            body: JSON.stringify({ region: "us-east" satisfies SessionRegion })
        });

        await httpJson<Session>(`${baseUrl()}/updateSessionStatus`, {
            method: "PATCH",
            body: JSON.stringify({
                sessionId: s2.body.sessionId,
                status: "active" satisfies SessionStatus
            })
        });

        const { status, body } = await httpJson<Session[]>(
            `${baseUrl()}/listSessions?status=active&limit=50`,
            { method: "GET" }
        );

        expect(status).toBe(200);
        expect(body.length).toBeGreaterThan(0);
        expect(body.every((s) => s.status === "active")).toBe(true);
    });

    test("GET /listSessions with both status and region -> 400 INVALID_ARGUMENT", async () => {
        const { status, body } = await httpJson<ErrorResponse>(
            `${baseUrl()}/listSessions?status=pending&region=eu-central`,
            { method: "GET" }
        );

        expect(status).toBe(400);
        expect(body.error.code).toBe("INVALID_ARGUMENT");
    });

    test("Wrong method -> 405 METHOD_NOT_ALLOWED", async () => {
        const { status, body } = await httpJson<ErrorResponse>(
            `${baseUrl()}/updateSessionStatus`,
            {
                method: "POST",
                body: JSON.stringify({ sessionId: "x", status: "active" })
            }
        );

        expect(status).toBe(405);
        expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
    });
});
