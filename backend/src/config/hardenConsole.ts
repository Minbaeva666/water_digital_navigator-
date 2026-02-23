import logger from './loggerConfig';

const safeSerialize = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value instanceof Error) {
        return JSON.stringify({
            name: value.name,
            message: value.message,
            stack: value.stack,
        });
    }
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

const joinArgs = (args: unknown[]) => args.map(safeSerialize).join(' ');

export function hardenConsoleInProduction(): void {
    if (process.env.NODE_ENV !== 'production') {
        return;
    }

    console.log = (...args: unknown[]) => {
        logger.info(joinArgs(args));
    };

    console.info = (...args: unknown[]) => {
        logger.info(joinArgs(args));
    };

    console.warn = (...args: unknown[]) => {
        logger.warn(joinArgs(args));
    };

    console.error = (...args: unknown[]) => {
        logger.error(joinArgs(args));
    };
}
