import {useCallback, useEffect, useRef} from "react";

export function useAbortController() {
    const ctrlRef = useRef<AbortController | null>(null);

    /** startet einen neuen Controller (bricht alten ab) und liefert helpers zurück */
    const create = useCallback(() => {
        // alten abbrechen
        ctrlRef.current?.abort();
        // neuen setzen
        const ac = new AbortController();
        ctrlRef.current = ac;

        // helpers zurückgeben
        return {
            signal: ac.signal,
            /** bricht genau diesen Controller ab (nicht irgendeinen späteren) */
            abort: () => {
                if (ctrlRef.current === ac) {
                    ctrlRef.current.abort();
                } else {
                    // falls inzwischen ein anderer aktiv ist, sicherheitshalber diesen hier auch beenden
                    ac.abort();
                }
            },
        };
    }, []);

    /** beim Unmount alle ggf. laufenden Requests abbrechen */
    useEffect(() => () => ctrlRef.current?.abort(), []);

    /** optional: manuelles Cancel aller laufenden */
    const cancelAll = useCallback(() => ctrlRef.current?.abort(), []);

    return { create, cancelAll };
}