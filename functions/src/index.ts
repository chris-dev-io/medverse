import { initFirebaseAdmin } from "./common/firebaseAdmin";
import { setGlobalOptions } from "firebase-functions/v2";
import {
    createSessionHandler,
    getSessionHandler,
    updateSessionStatusHandler,
    listSessionsHandler
} from "./modules/sessions/session.handlers";
import {CLOUD_FUNCTIONS_REGION} from "./common/constants";

initFirebaseAdmin();

setGlobalOptions({ region: CLOUD_FUNCTIONS_REGION });

export const createSession = createSessionHandler;
export const getSession = getSessionHandler;
export const updateSessionStatus = updateSessionStatusHandler;
export const listSessions = listSessionsHandler;
