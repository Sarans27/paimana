// src/components/Navbar.jsx
// Government masthead: identity strip + deep-navy primary navigation
// with collapsible mobile menu. No auth state exists yet, so Login
// remains a plain route link styled as an outlined action.

import { useState } from "react";
import { NavLink } from "react-router-dom";

function getLinkClass({ isActive }) {
  return isActive ? "main-nav__link main-nav__link--active" : "main-nav__link";
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <div className="gov-strip" role="note" aria-label="Government identifier">
        <div className="gov-strip__inner">
          <span>Government of India · Infrastructure Monitoring</span>
          <span>PAIMANA — Project Assessment, Intelligence, Monitoring &amp; National Analytics</span>
        </div>
      </div>
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink to="/public" className="brand" aria-label="ProjectPulse home" onClick={close}>
            <span className="brand__emblem" aria-hidden="true">◈</span>
            <span className="brand__text">
              <span className="brand__name">ProjectPulse</span>
              <span className="brand__sub">PAIMANA Intelligence</span>
            </span>
          </NavLink>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="primary-navigation"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true">{open ? "✕" : "☰"}</span>
          </button>
          <nav
            id="primary-navigation"
            className={`main-nav${open ? " main-nav--open" : ""}`}
            aria-label="Primary"
          >
            <NavLink to="/public" className={getLinkClass} onClick={close}>Public</NavLink>
            <NavLink to="/projects" className={getLinkClass} onClick={close}>Projects</NavLink>
            <NavLink to="/map" className={getLinkClass} onClick={close}>Map</NavLink>
            <NavLink to="/admin" className={getLinkClass} onClick={close}>Dashboard</NavLink>
            <NavLink to="/login" end className={({ isActive }) => `${getLinkClass({ isActive })} main-nav__link--login`} onClick={close}>Login</NavLink>
          </nav>
        </div>
      </header>
    </>
  );
}

export default Navbar;
