export default function ToastContainer({ toasts }) {
  return (
    <div id="toastContainer" role="region" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.type === 'error' ? ' toast--error' : ''}`} role="alert">
          {t.message}
        </div>
      ))}
    </div>
  );
}
