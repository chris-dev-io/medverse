import {
    getFirestore,
    type Firestore,
    type Timestamp,
    type DocumentReference
} from "firebase-admin/firestore";
import type {ListSessionsParams, Session, SessionStatus} from "./session.types";
import { COLLECTIONS } from "../../common/constants";

const COLLECTION = COLLECTIONS.SESSIONS;

export class SessionRepo {
    private readonly db: Firestore;

    constructor(db: Firestore = getFirestore()) {
        this.db = db;
    }

    doc(sessionId: string): DocumentReference<Session> {
        return this.db.collection(COLLECTION).doc(sessionId) as DocumentReference<Session>;
    }

    async create(session: Session): Promise<Session> {
        await this.doc(session.sessionId).set(session, { merge: false });
        return session;
    }

    async getById(sessionId: string): Promise<Session | null> {
        const snap = await this.doc(sessionId).get();
        return snap.exists ? (snap.data() as Session) : null;
    }

    async updateStatus(
        sessionId: string,
        status: SessionStatus,
        updatedAt: Timestamp
    ): Promise<Session | null> {
        const ref = this.doc(sessionId);

        return await this.db.runTransaction(async (transaction) => {
            const snap = await transaction.get(ref);
            if (!snap.exists) return null;

            const current = snap.data() as Session;

            transaction.update(ref, { status, updatedAt });

            return { ...current, status, updatedAt };
        });
    }

    async list(params: ListSessionsParams): Promise<Session[]> {
        let q = this.db.collection(COLLECTION).orderBy("createdAt", "desc").limit(params.limit);

        if (params.status) {
            q = q.where("status", "==", params.status);
        } else if (params.region) {
            q = q.where("region", "==", params.region);
        }

        const snap = await q.get();
        return snap.docs.map((d) => d.data() as Session);
    }
}
