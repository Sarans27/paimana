// src/layouts/MainLayout.jsx
// Wraps every page with the government header + content area + footer.
// A skip link precedes the navigation so keyboard users can jump
// straight to the page content.

import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar />
      <main className="content" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <span>PAIMANA · Infrastructure project monitoring (demonstration build)</span>
          <span>Base map © OpenStreetMap contributors</span>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
