// src/layouts/MainLayout.jsx
// This is the LAYOUT component.
// It wraps every page with a Navbar at the top and a content area below.
// The <Outlet /> is where the current page's content appears.

import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div>
      {/* The Navbar always shows at the top */}
      <Navbar />

      {/* The <main> tag is the content area.
          <Outlet /> is the "hole" where React Router injects the current page. */}
      <main style={{ padding: "24px" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
