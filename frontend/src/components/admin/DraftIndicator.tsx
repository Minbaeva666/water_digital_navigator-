export function DraftIndicator({ saving, lastSavedAt }: { saving: boolean; lastSavedAt: number | null }) {
  return (
    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
      {saving
        ? "Автосохранение…"
        : lastSavedAt
        ? `Черновик сохранён: ${new Date(lastSavedAt).toLocaleTimeString()}`
        : "Изменения сохраняются автоматически (локально)."}
    </div>
  );
}
