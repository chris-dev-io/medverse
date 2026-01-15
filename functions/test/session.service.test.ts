import { Timestamp } from "firebase-admin/firestore";
import { SessionService } from "../src/modules/sessions/session.service";
import type { SessionRepo } from "../src/modules/sessions/session.repo";
import type { Session, SessionRegion, SessionStatus, ListSessionsParams } from "../src/modules/sessions/session.types";

class FakeSessionRepo implements Pick<SessionRepo, "create" | "getById" | "updateStatus" | "list"> {
    private store = new Map<string, Session>();

    async create(session: Session): Promise<Session> {
        this.store.set(session.sessionId, session);
        return session;
    }

    async getById(sessionId: string): Promise<Session | null> {
        return this.store.get(sessionId) ?? null;
    }

    async updateStatus(sessionId: string, status: SessionStatus, updatedAt: Timestamp): Promise<Session | null> {
        const current = this.store.get(sessionId);
        if (!current) return null;

        const updated: Session = { ...current, status, updatedAt };
        this.store.set(sessionId, updated);
        return updated;
    }

    async list(params: ListSessionsParams): Promise<Session[]> {
        let all = Array.from(this.store.values());

        if (params.status) {
            all = all.filter((s) => s.status === params.status);
        } else if (params.region) {
            all = all.filter((s) => s.region === params.region);
        }

        all.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

        return all.slice(0, params.limit);
    }
}

function makeService() {
    const repo = new FakeSessionRepo();
    const service = new SessionService(repo as unknown as SessionRepo);
    return { service, repo };
}

async function createDeterministicSession(
    service: SessionService,
    region: SessionRegion,
    createdAtMs: number
): Promise<Session> {
    const createdAt = Timestamp.fromMillis(createdAtMs);
    const s = await service.createSession(region);
    return { ...s, createdAt, updatedAt: createdAt };
}

describe("SessionService", () => {
    test("createSession creates a pending session with createdAt and updatedAt", async () => {
        const { service } = makeService();

        const s = await service.createSession("eu-central");

        expect(s.sessionId).toBeTruthy();
        expect(s.region).toBe("eu-central");
        expect(s.status).toBe("pending");
        expect(s.createdAt).toBeInstanceOf(Timestamp);
        expect(s.updatedAt).toBeInstanceOf(Timestamp);
    });

    test("getSession throws NOT_FOUND when session does not exist", async () => {
        const { service } = makeService();

        await expect(service.getSession("missing")).rejects.toMatchObject({
            status: 404,
            code: "NOT_FOUND"
        });
    });

    test("updateSessionStatus updates status and updatedAt", async () => {
        const { repo } = makeService();

        const service = new SessionService(repo as unknown as SessionRepo);

        const created = await service.createSession("us-east");
        await repo.create(created);

        const out = await service.updateSessionStatus(created.sessionId, "active");

        expect(out.status).toBe("active");
        expect(out.updatedAt.toMillis()).toBeGreaterThanOrEqual(created.updatedAt.toMillis());
    });

    test("listSessions returns all sessions ordered by newest createdAt", async () => {
        const { service, repo } = makeService();

        const a = await createDeterministicSession(service, "eu-central", 1000);
        const b = await createDeterministicSession(service, "eu-central", 3000);
        const c = await createDeterministicSession(service, "us-east", 2000);

        await repo.create(a);
        await repo.create(b);
        await repo.create(c);

        const out = await service.listSessions({ limit: 10 });

        expect(out.map((s) => s.createdAt.toMillis())).toEqual([3000, 2000, 1000]);
    });

    test("listSessions filters by status", async () => {
        const { service, repo } = makeService();

        const a = await createDeterministicSession(service, "eu-central", 1000);
        const b: Session = {
            ...a,
            sessionId: "b",
            status: "active",
            createdAt: Timestamp.fromMillis(2000),
            updatedAt: Timestamp.fromMillis(2000)
        };

        await repo.create(a);
        await repo.create(b);

        const out = await service.listSessions({ status: "active", limit: 10 });

        expect(out).toHaveLength(1);
        expect(out[0].status).toBe("active");
    });

    test("listSessions filters by region", async () => {
        const { service, repo } = makeService();

        const a = await createDeterministicSession(service, "eu-central", 1000);
        const b = await createDeterministicSession(service, "us-east", 2000);

        await repo.create(a);
        await repo.create(b);

        const out = await service.listSessions({ region: "us-east", limit: 10 });

        expect(out).toHaveLength(1);
        expect(out[0].region).toBe("us-east");
    });

    test("listSessions respects limit", async () => {
        const { service, repo } = makeService();

        const a = await createDeterministicSession(service, "eu-central", 1000);
        const b = await createDeterministicSession(service, "eu-central", 2000);
        const c = await createDeterministicSession(service, "eu-central", 3000);

        await repo.create(a);
        await repo.create(b);
        await repo.create(c);

        const out = await service.listSessions({ limit: 2 });

        expect(out).toHaveLength(2);
        expect(out.map((s) => s.createdAt.toMillis())).toEqual([3000, 2000]);
    });
});
