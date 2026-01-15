import { SESSION_STATUSES, ALLOWED_SESSION_REGIONS } from "../../common/constants";
import type { Timestamp } from "firebase-admin/firestore";

export type SessionStatus = (typeof SESSION_STATUSES)[number];
export type SessionRegion = (typeof ALLOWED_SESSION_REGIONS)[number];

export interface Session {
    sessionId: string;
    region: SessionRegion;
    status: SessionStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface ListSessionsParams {
    status?: SessionStatus;
    region?: SessionRegion;
    limit: number;
}

