// src/components/RiskBadge.jsx
// A small colored tag that shows risk level: "High", "Medium", or "Low".
// Props: level (string)

function RiskBadge({ level }) {
  // Pick color based on risk level
  const colorMap = {
    High:   { bg: "#fde8e8", text: "#e74c3c" },
    Medium: { bg: "#fef3e2", text: "#f39c12" },
    Low:    { bg: "#e8f8ef", text: "#27ae60" },
  };

  // Use the matching color, or gray if level is unknown
  const colors = colorMap[level] || { bg: "#f0f0f0", text: "#666" };

  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "bold",
      backgroundColor: colors.bg,
      color: colors.text,
    }}>
      {level} Risk
    </span>
  );
}

export default RiskBadge;
