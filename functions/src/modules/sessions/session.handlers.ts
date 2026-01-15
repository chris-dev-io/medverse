import { onRequest } from "firebase-functions/v2/https";
import { logHttpError, toHttpError } from "../../common/errors";
import { requireMethod, readJsonBody, sendJson } from "../../common/http";
import { SessionService } from "./session.service";
import {
    parseCreateSessionBody,
    parseListSessionsQuery,
    parseUpdateStatusBody,
    validateSessionId
} from "./session.validators";
import { initFirebaseAdmin } from "../../common/firebaseAdmin";
import { HTTP_STATUS } from "../../common/httpStatus";
import {log} from "../../common/logging";
import {requireApiKey} from "../../common/auth";
import { MEDVERSE_API_KEY } from "../../common/secrets";

initFirebaseAdmin();
const service = new SessionService();

export const createSessionHandler = onRequest({ secrets: [MEDVERSE_API_KEY] }, async (req, res) => {
    try {
        requireMethod(req, "POST");
        requireApiKey(req, MEDVERSE_API_KEY.value());

        const body = await readJsonBody(req);
        const { region } = parseCreateSessionBody(body);

        const session = await service.createSession(region);
        log.info("session created", {sessionId: session.sessionId, region: session.region});
        sendJson(res, HTTP_STATUS.CREATED, session);
    } catch (err) {
        const httpErr = toHttpError(err);
        logHttpError("createSession", req, err, httpErr);
        sendJson(res, httpErr.status, httpErr.body);
    }
});

export const getSessionHandler = onRequest({ secrets: [MEDVERSE_API_KEY] }, async (req, res) => {
    try {
        requireMethod(req, "GET");
        requireApiKey(req, MEDVERSE_API_KEY.value());

        const sessionId = validateSessionId(req.query.sessionId);
        const session = await service.getSession(sessionId);

        sendJson(res, HTTP_STATUS.OK, session);
    } catch (err) {
        const httpErr = toHttpError(err);
        logHttpError("getSession", req, err, httpErr);
        sendJson(res, httpErr.status, httpErr.body);
    }
});

export const updateSessionStatusHandler = onRequest({ secrets: [MEDVERSE_API_KEY] }, async (req, res) => {
    try {
        requireMethod(req, "PATCH");
        requireApiKey(req, MEDVERSE_API_KEY.value());

        const body = await readJsonBody(req);
        const { sessionId, status } = parseUpdateStatusBody(body);

        const session = await service.updateSessionStatus(sessionId, status);
        log.info("session status updated", {sessionId, status});
        sendJson(res, HTTP_STATUS.OK, session);
    } catch (err) {
        const httpErr = toHttpError(err);
        logHttpError("updateSessionStatus", req, err, httpErr);
        sendJson(res, httpErr.status, httpErr.body);
    }
});

export const listSessionsHandler = onRequest({ secrets: [MEDVERSE_API_KEY] }, async (req, res) => {
    try {
        requireMethod(req, "GET");
        requireApiKey(req, MEDVERSE_API_KEY.value());

        const { status, region, limit } = parseListSessionsQuery(req.query);

        const sessions = await service.listSessions({ status, region, limit });
        sendJson(res, HTTP_STATUS.OK, sessions);
    } catch (err) {
        const httpErr = toHttpError(err);
        logHttpError("listSessions", req, err, httpErr);
        sendJson(res, httpErr.status, httpErr.body);
    }
});
