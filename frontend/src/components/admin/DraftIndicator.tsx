export function DraftIndicator({ saving, lastSavedAt }: { saving: boolean; lastSavedAt: number | null }) {
  return (
    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
      {saving
        ? "Autosave…"
        : lastSavedAt
        ? `Draft saved: ${new Date(lastSavedAt).toLocaleTimeString()}`
        : "Changes saved locally."}
    </div>
  );
}
