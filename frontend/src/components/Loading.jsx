// src/components/Loading.jsx
// A reusable loading indicator shown while data is being fetched.
// Used by any page that loads data from the API.

function Loading() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 20px",
      color: "#888",
    }}>
      {/* Simple spinning animation using CSS */}
      <div style={{
        width: "40px",
        height: "40px",
        border: "4px solid #e0e0e0",
        borderTop: "4px solid #4a90d9",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }} />
      <p style={{ marginTop: "16px", fontSize: "16px" }}>Loading...</p>

      {/* The @keyframes rule defines the spin animation.
          We put it in a <style> tag so it works without a separate CSS file. */}
      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Loading;