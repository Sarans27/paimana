// src/components/StatCard.jsx
// Enterprise monitoring statistic: icon + label hierarchy, large tabular
// value, optional supporting metric. No trend UI — the dataset has no
// trend data, and none is invented.
// Props: label, value, color (explicit accent), type (semantic accent:
//   "info" | "success" | "warning" | "danger"), hint, icon (glyph).

const TYPE_ACCENTS = {
  info: "var(--gov-blue)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

function StatCard({ label, value, color, type, hint, icon }) {
  const accent = color || (type && TYPE_ACCENTS[type]) || undefined;

  return (
    <div
      className="card stat"
      style={accent ? { borderLeftColor: accent } : undefined}
    >
      <div className="stat__top">
        {icon ? (
          <span
            className="stat__icon"
            style={accent ? { color: accent, borderColor: accent } : undefined}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
        <p className="stat__label">{label}</p>
      </div>
      <p className="stat__value" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      {hint ? <p className="stat__hint">{hint}</p> : null}
    </div>
  );
}

export default StatCard;
