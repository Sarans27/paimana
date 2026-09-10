// src/components/ProgressBar.jsx
// A horizontal bar that visually shows a percentage (0-100).
// Props: label (string), progress (number 0-100)

function ProgressBar({ label, progress }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      {/* Top row: label on left, percentage on right */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "14px" }}>{label}</span>
        <span style={{ fontSize: "14px", fontWeight: "bold" }}>{progress}%</span>
      </div>

      {/* The bar background (gray) */}
      <div style={{
        width: "100%",
        height: "10px",
        backgroundColor: "#e0e0e0",
        borderRadius: "5px",
      }}>
        {/* The filled portion (colored) — width is the progress percentage */}
        <div style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: progress >= 70 ? "#27ae60" : progress >= 40 ? "#f39c12" : "#e74c3c",
          borderRadius: "5px",
        }} />
      </div>
    </div>
  );
}

export default ProgressBar;
