import { initializeApp, getApps, deleteApp, type App } from "firebase-admin/app";
import { getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";
import { SessionRepo } from "../src/modules/sessions/session.repo";
import type { Session } from "../src/modules/sessions/session.types";

jest.setTimeout(30_000);

function makeSession(
    sessionId: string,
    region: Session["region"],
    status: Session["status"],
    createdAtMs: number
): Session {
    const ts = Timestamp.fromMillis(createdAtMs);
    return {
        sessionId,
        region,
        status,
        createdAt: ts,
        updatedAt: ts
    };
}

async function clearSessions(db: Firestore): Promise<void> {
    const snap = await db.collection("sessions").get();
    if (snap.empty) return;

    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
}

describe("SessionRepo integration (Firestore emulator)", () => {
    let app: App | undefined;
    let db: Firestore;
    let repo: SessionRepo;

    beforeAll(() => {
        if (!process.env.FIRESTORE_EMULATOR_HOST) {
            process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
        }

        if (getApps().length === 0) {
            app = initializeApp({ projectId: "demo-medverse" });
        } else {
            app = getApps()[0]!;
        }

        db = getFirestore(app);
        repo = new SessionRepo(db);
    });

    beforeEach(async () => {
        await clearSessions(db);
    });

    afterAll(async () => {
        try {
            if (app) {
                await deleteApp(app);
            }
        } catch {
            // ignore
        }
    });

    test("list(): orders by createdAt desc", async () => {
        await repo.create(makeSession("a", "eu-central", "pending", 1000));
        await repo.create(makeSession("b", "eu-central", "pending", 3000));
        await repo.create(makeSession("c", "us-east", "active", 2000));

        const out = await repo.list({ limit: 10 });

        expect(out.map((s) => s.sessionId)).toEqual(["b", "c", "a"]);
    });

    test("list(): filters by status when provided", async () => {
        await repo.create(makeSession("a", "eu-central", "pending", 1000));
        await repo.create(makeSession("b", "us-east", "active", 2000));
        await repo.create(makeSession("c", "eu-central", "active", 3000));

        const out = await repo.list({ status: "active", limit: 10 });

        expect(out.map((s) => s.sessionId)).toEqual(["c", "b"]);
    });

    test("list(): filters by region when status is not provided", async () => {
        await repo.create(makeSession("a", "eu-central", "pending", 1000));
        await repo.create(makeSession("b", "us-east", "active", 2000));
        await repo.create(makeSession("c", "eu-central", "active", 3000));

        const out = await repo.list({ region: "eu-central", limit: 10 });

        expect(out.map((s) => s.sessionId)).toEqual(["c", "a"]);
    });

    test("list(): respects limit", async () => {
        await repo.create(makeSession("a", "eu-central", "pending", 1000));
        await repo.create(makeSession("b", "eu-central", "pending", 2000));
        await repo.create(makeSession("c", "eu-central", "pending", 3000));

        const out = await repo.list({ limit: 2 });

        expect(out.map((s) => s.sessionId)).toEqual(["c", "b"]);
    });
});
