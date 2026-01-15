import { logger } from "firebase-functions";

export const log = {
    info: (message: string, data?: unknown) => logger.info(message, data),
    warn: (message: string, data?: unknown) => logger.warn(message, data),
    error: (message: string, data?: unknown) => logger.error(message, data)
};
