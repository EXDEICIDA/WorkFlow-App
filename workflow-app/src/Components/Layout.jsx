// components/Layout.jsx
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const isAuthPage = location.pathname === "/" || location.pathname === "/login" || !currentUser;

  // Add useEffect to update layout when authentication state changes
  useEffect(() => {
    // Force layout recalculation when auth state changes
    if (!isAuthPage) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // Trigger layout recalculation
        window.dispatchEvent(new Event('resize'));
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, isAuthPage]);

  return (
    <div className="app">
      {!isAuthPage && <Sidebar />}
      <main className={`main-content ${!isAuthPage ? "" : "no-sidebar"}`}>
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
