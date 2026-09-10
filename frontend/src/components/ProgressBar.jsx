// src/components/ProgressBar.jsx
// Horizontal progress indicator (0-100) with quartile tone mapping:
// 0–25 critical-red, 26–50 amber, 51–75 government blue, 76–100 green.
// Colors come from semantic tokens — never arbitrary.

function ProgressBar({ label, progress }) {
  const value = Math.max(0, Math.min(100, Number(progress) || 0));
  const tone =
    value < 25
      ? "progress__fill--bad"
      : value < 50
        ? "progress__fill--warn"
        : value < 75
          ? "progress__fill--info"
          : "progress__fill--good";
  return (
    <div className="progress" role="group" aria-label={`${label}: ${value} percent`}>
      <div className="progress__top">
        <span className="progress__label">{label}</span>
        <span className="progress__value num">{value}%</span>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={label}
      >
        <div className={`progress__fill ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default ProgressBar;
