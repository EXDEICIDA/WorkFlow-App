// components/Layout.jsx
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const isAuthPage = location.pathname === "/" || location.pathname === "/login" || !currentUser;

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
