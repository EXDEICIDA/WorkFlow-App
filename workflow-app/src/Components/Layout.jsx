// components/Layout.jsx
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import PropTypes from "prop-types";

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/";

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
