// src/pages/Login.jsx
// PAIMANA Login page — styled form with branding.
// No real authentication yet — clicking "Sign In" navigates to /admin.

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BLUE = "#0B3D91";
const ORANGE = "#E8620C";

const pageStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "calc(100vh - 100px)",
  padding: "20px",
};

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "40px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  textAlign: "center",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "bold",
  color: BLUE,
  margin: "0 0 4px",
};

const subtitleStyle = {
  fontSize: "14px",
  color: "#6B7280",
  margin: "0 0 32px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  fontSize: "15px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  outline: "none",
  marginBottom: "16px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  fontSize: "16px",
  fontWeight: "bold",
  backgroundColor: ORANGE,
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "background-color 0.2s",
};

const noteStyle = {
  marginTop: "20px",
  fontSize: "12px",
  color: "#9CA3AF",
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    // e.preventDefault() stops the form from reloading the page
    e.preventDefault();
    // No real auth — just navigate to admin dashboard
    navigate("/admin");
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Brand */}
        <p style={{ fontSize: "40px", margin: "0 0 8px" }}>🏛</p>
        <h1 style={titleStyle}>PAIMANA</h1>
        <p style={subtitleStyle}>
          Project Assessment, Intelligence, Monitoring<br />
          & National Analytics
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#C45209")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = ORANGE)}
          >
            Sign In →
          </button>
        </form>

        <p style={noteStyle}>
          Authentication is not connected yet.<br />
          Click "Sign In" to continue to the Admin Dashboard.
        </p>
      </div>
    </div>
  );
}

export default Login;