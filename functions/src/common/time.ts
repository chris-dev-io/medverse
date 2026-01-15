import { Timestamp } from "firebase-admin/firestore";

export function nowTimestamp(): Timestamp {
    return Timestamp.now();
}
