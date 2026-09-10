// src/components/Navbar.jsx
// PAIMANA navigation bar — blue background, orange active links.

import { NavLink } from "react-router-dom";

// PAIMANA Design Tokens
const BLUE = "#0B3D91";
const ORANGE = "#E8620C";

const navStyle = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
  padding: "14px 24px",
  backgroundColor: BLUE,
  color: "white",
  flexWrap: "wrap",
};

const brandStyle = {
  fontSize: "20px",
  fontWeight: "bold",
  letterSpacing: "1px",
  marginRight: "auto",
};

function getLinkStyle({ isActive }) {
  return {
    color: isActive ? ORANGE : "rgba(255,255,255,0.85)",
    textDecoration: "none",
    fontWeight: isActive ? "bold" : "normal",
    fontSize: "15px",
    padding: "4px 0",
    borderBottom: isActive ? `2px solid ${ORANGE}` : "2px solid transparent",
    transition: "color 0.2s, border-bottom 0.2s",
  };
}

function Navbar() {
  return (
    <nav style={navStyle}>
      <span style={brandStyle}>🏛 PAIMANA</span>

      <NavLink to="/login" end style={getLinkStyle}>
        Login
      </NavLink>

      <NavLink to="/projects" style={getLinkStyle}>
        Projects
      </NavLink>

      <NavLink to="/map" style={getLinkStyle}>
        Map
      </NavLink>

      <NavLink to="/public" style={getLinkStyle}>
        Public
      </NavLink>

      <NavLink to="/admin" style={getLinkStyle}>
        Admin
      </NavLink>
    </nav>
  );
}

export default Navbar;