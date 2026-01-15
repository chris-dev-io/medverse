import { getFirestore } from "firebase-admin/firestore";
import {ApiError, ERROR_CODES} from "../../common/errors";
import { generateSessionId } from "../../common/ids";
import { nowTimestamp } from "../../common/time";
import type {ListSessionsParams, Session, SessionRegion, SessionStatus} from "./session.types";
import { SessionRepo } from "./session.repo";
import {HTTP_STATUS} from "../../common/httpStatus";

export class SessionService {
    private readonly repo: SessionRepo;

    constructor(repo: SessionRepo = new SessionRepo(getFirestore())) {
        this.repo = repo;
    }

    async createSession(region: SessionRegion): Promise<Session> {
        const sessionId = generateSessionId();
        const ts = nowTimestamp();

        const session: Session = {
            sessionId,
            region,
            status: "pending",
            createdAt: ts,
            updatedAt: ts
        };

        return await this.repo.create(session);
    }

    async getSession(sessionId: string): Promise<Session> {
        const session = await this.repo.getById(sessionId);
        if (!session) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, "Session not found");
        }
        return session;
    }

    async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<Session> {
        const updatedAt = nowTimestamp();
        const updated = await this.repo.updateStatus(sessionId, status, updatedAt);
        if (!updated) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, "Session not found");
        }
        return updated;
    }

    async listSessions(params: ListSessionsParams): Promise<Session[]> {
        return await this.repo.list(params);
    }
}
