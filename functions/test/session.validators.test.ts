import {
    parseCreateSessionBody,
    parseUpdateStatusBody,
    parseListSessionsQuery
} from "../src/modules/sessions/session.validators";

describe("session.validators", () => {
    test("parseCreateSessionBody accepts valid region", () => {
        const out = parseCreateSessionBody({ region: "eu-central" });
        expect(out.region).toBe("eu-central");
    });

    test("parseCreateSessionBody rejects invalid region", () => {
        expect(() => parseCreateSessionBody({ region: "moon" })).toThrow();
    });

    test("parseCreateSessionBody rejects non-object body", () => {
        expect(() => parseCreateSessionBody("nope")).toThrow();
    });

    test("parseUpdateStatusBody accepts valid status", () => {
        const out = parseUpdateStatusBody({ sessionId: "abc", status: "active" });
        expect(out.sessionId).toBe("abc");
        expect(out.status).toBe("active");
    });

    test("parseUpdateStatusBody rejects empty sessionId", () => {
        expect(() => parseUpdateStatusBody({ sessionId: "   ", status: "active" })).toThrow();
    });

    test("parseUpdateStatusBody rejects invalid status", () => {
        expect(() => parseUpdateStatusBody({ sessionId: "abc", status: "wrong" })).toThrow();
    });

    test("parseListSessionsQuery defaults limit to 50", () => {
        const out = parseListSessionsQuery({});
        expect(out.limit).toBe(50);
        expect(out.status).toBeUndefined();
        expect(out.region).toBeUndefined();
    });

    test("parseListSessionsQuery accepts status only", () => {
        const out = parseListSessionsQuery({ status: "active" });
        expect(out.status).toBe("active");
        expect(out.region).toBeUndefined();
    });

    test("parseListSessionsQuery accepts region only", () => {
        const out = parseListSessionsQuery({ region: "eu-central" });
        expect(out.region).toBe("eu-central");
        expect(out.status).toBeUndefined();
    });

    test("parseListSessionsQuery rejects providing both status and region", () => {
        expect(() => parseListSessionsQuery({ status: "active", region: "eu-central" })).toThrow();
    });

    test("parseListSessionsQuery parses limit and caps it at 100", () => {
        const out = parseListSessionsQuery({ limit: "999" });
        expect(out.limit).toBe(100);
    });

    test("parseListSessionsQuery rejects invalid limit", () => {
        expect(() => parseListSessionsQuery({ limit: "-1" })).toThrow();
        expect(() => parseListSessionsQuery({ limit: "abc" })).toThrow();
    });
});
