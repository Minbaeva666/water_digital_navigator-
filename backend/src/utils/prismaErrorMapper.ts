import { Prisma } from '@prisma/client';

function prettifyField(raw: string): string {
    // Suffix entfernen
    const withoutSuffix = raw.replace(/_key$/, '');
    // Unterstriche in Wörter trennen und jedes Wort kapitalisieren
    return withoutSuffix
        .split('_')
        .map(capitalize)
        .join(' ');
}

export function mapPrismaError(error: any): { statusCode: number; message: string } | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return null;
    }

    switch (error.code) {
        case 'P2000': {
            const match = /Column: (\w+)/.exec(error.message);
            const field = match ? prettifyField(match[1]) : 'Ein Feld';
            return {
                statusCode: 400,
                message: `${field} ist zu lang für das Datenbankfeld.`,
            };
        }

        case 'P2002': {
            const rawTarget = (error.meta as any)?.target;
            const fields = Array.isArray(rawTarget)
                ? rawTarget.map(String)
                : rawTarget
                    ? [String(rawTarget)]
                    : ['Feld'];

            // Jetzt prettifyField statt nur capitalize
            const prettyFields = fields.map(prettifyField).join(', ');
            return {
                statusCode: 400,
                message: `${prettyFields} ist bereits vergeben.`,
            };
        }

        case 'P2025':
            return {
                statusCode: 404,
                message: 'Datensatz wurde nicht gefunden',
            };

        case 'P2003':
            return {
                statusCode: 400,
                message: 'Verknüpfter Datensatz existiert nicht (Fremdschlüsselverletzung)',
            };

        case 'P2014':
            return {
                statusCode: 400,
                message: 'Fehlerhafte Beziehung oder verschachtelter Write',
            };

        case 'P2010':
            return {
                statusCode: 400,
                message: 'Fehler bei der Ausführung einer rohen Query',
            };

        default:
            return {
                statusCode: 400,
                message: 'Unbekannter Datenbankfehler: ' + error.message,
            };
    }
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
