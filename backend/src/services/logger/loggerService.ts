import logger from '../../config/loggerConfig';

export const logService = {
    info: (message: string, meta?: object) => {
        logger.info(message, meta);
    },
    error: (message: string, error: Error, meta?: object) => {
        logger.error(`${message}: ${error.message}`, {
            ...meta,
            stack: error.stack
        });
    },
    warn: (message: string, meta?: object) => {
        logger.warn(message, meta);
    },
    debug: (message: string, meta?: object) => {
        logger.debug(message, meta);
    }
};