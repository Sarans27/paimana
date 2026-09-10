// src/components/Feedback.jsx
// Shared state blocks: one visual language for every error and empty
// state in the app. Messages must stay human-readable — raw API errors,
// stack traces, and sensitive data never reach these components.

export function ErrorState({ title, message, onRetry, retryLabel = "Try Again" }) {
  return (
    <div className="state state--error" role="alert">
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry ? (
        <p className="state__actions">
          <button type="button" className="btn btn--primary" onClick={onRetry}>
            {retryLabel}
          </button>
        </p>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="state">
      <h2>{title}</h2>
      <p>{message}</p>
      {onAction ? (
        <p className="state__actions">
          <button type="button" className="btn btn--primary" onClick={onAction}>
            {actionLabel}
          </button>
        </p>
      ) : null}
    </div>
  );
}
