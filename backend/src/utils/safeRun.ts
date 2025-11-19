export async function safeRun<T>(
    fn: () => Promise<T>,
    onError?: (error: unknown) => Promise<void> | void,
    onSuccess?: (result: T) => Promise<void> | void
): Promise<T | undefined> {
    try {
        const result = await fn();

        if (onSuccess) {
            await onSuccess(result);
        }

        return result;
    } catch (error: unknown) {
        if (onError) {
            await onError(error);
        } else {
            console.error('[safeRun] Unhandled error:', formatError(error));
        }
        return undefined;
    }
}

// Optional: zentrale Fehlerformatierung
function formatError(error: unknown): string {
    if (error instanceof Error) {
        return `${error.name}: ${error.message}\n${error.stack}`;
    }
    return String(error);
}