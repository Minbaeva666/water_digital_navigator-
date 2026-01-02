import { useMemo, useRef, useState } from "react";

type SaveFn<T> = (v: T) => void;

function useDebounced<T>(fn: SaveFn<T>, ms = 800) {
  const t = useRef<number | null>(null);
  return useMemo(
    () => (v: T) => {
      if (t.current) window.clearTimeout(t.current);
      t.current = window.setTimeout(() => fn(v), ms) as unknown as number;
    },
    [fn, ms]
  );
}

export function useLocalDraftAutosave<T extends object>(key: string, initial: T) {
  void initial; 
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const saveNow = (values: T) => {
    localStorage.setItem(
      key,
      JSON.stringify({ ts: Date.now(), data: values })
    );
    setLastSavedAt(Date.now());
  };

  const saveDebounced = useDebounced<T>((v) => {
    setSaving(true);
    try {
      saveNow(v);
    } finally {
      setSaving(false);
    }
  }, 800);

  const read = (): { ts: number; data: T } | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.data ? { ts: parsed.ts, data: parsed.data as T } : null;
    } catch {
      return null;
    }
  };

  const clear = () => localStorage.removeItem(key);

  // helper to flush autosave when leaving the page
  const bindFlushOnHide = (getLatest: () => T) => {
    const flush = () => saveNow(getLatest());
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("beforeunload", flush);
    };
  };

  return { saving, lastSavedAt, saveNow, saveDebounced, read, clear, bindFlushOnHide };
}
