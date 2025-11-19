export interface FaqPayload {
    /** Optional – Backend legt an / nimmt jüngste, wenn nicht vorhanden */
    id?: string;
    /** Reihenfolge im Array = Sortierung im Backend */
    items: Array<{ header: string; content: string }>;
}