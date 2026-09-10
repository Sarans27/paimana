// src/components/StatCard.jsx
// A reusable card that shows a single statistic (number + label).
// Props: label (string), value (number), color (string)

function StatCard({ label, value, color }) {
  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "8px",
      padding: "20px",
      borderLeft: `4px solid ${color}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}>
      <p style={{ margin: 0, fontSize: "14px", color: "#888" }}>
        {label}
      </p>
      <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "bold", color: color }}>
        {value}
      </p>
    </div>
  );
}

export default StatCard;
