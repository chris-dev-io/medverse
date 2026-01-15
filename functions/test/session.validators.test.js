"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const session_validators_1 = require("../src/modules/sessions/session.validators");
describe("session.validators", () => {
    test("parseCreateSessionBody accepts valid region", () => {
        const out = (0, session_validators_1.parseCreateSessionBody)({ region: "eu-central" });
        expect(out.region).toBe("eu-central");
    });
    test("parseUpdateStatusBody accepts valid status", () => {
        const out = (0, session_validators_1.parseUpdateStatusBody)({ sessionId: "abc", status: "active" });
        expect(out.sessionId).toBe("abc");
        expect(out.status).toBe("active");
    });
});
//# sourceMappingURL=session.validators.test.js.map