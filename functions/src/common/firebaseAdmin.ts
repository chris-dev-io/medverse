import { initializeApp, getApps } from "firebase-admin/app";

export function initFirebaseAdmin(): void {
    if (getApps().length === 0) {
        initializeApp();
    }
}
