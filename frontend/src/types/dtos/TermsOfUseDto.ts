export interface TermsOfUseDto {
    id: string;
    content: string;           // Markdown-fähiger Klartext
    createdAt: string;         // ISO-String
    updatedAt: string;         // ISO-String
    updatedBy?: TermsEditorDto | null; // Wer die letzte Version gespeichert hat (optional)
}

export interface TermsEditorDto {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
}

/**
 * Optionales DTO, falls auch die Akzeptanzen anzeigen.
 * (Nicht zwingend für den Editor nötig – nur als Vorbereitung.)
 */
export interface UserTermsOfUseAcceptanceDto {
    id: string;
    userId: string;
    termsId: string;
    acceptedAt: string;        // ISO-String
    ip?: string | null;
    userAgent?: string | null;
}