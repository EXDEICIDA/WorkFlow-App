import React, { useState } from "react";
import { FaHome, FaInbox, FaClock, FaBook, FaList } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="workspace-title">
          <span>{!isCollapsed && "Workspace"}</span>
          <button className="collapse-btn" onClick={toggleSidebar}>
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="nav-section">
        <div className="nav-item">
          <FaHome /> {!isCollapsed && <span>Home</span>}
        </div>
        <div className="nav-item">
          <FaInbox /> {!isCollapsed && <span>Inbox</span>}
        </div>
      </div>

      {/* Favorites Section */}
      <div className="section">
        {!isCollapsed && <div className="section-header">Favorites</div>}
        <div className="nav-item">
          <AiFillStar /> {!isCollapsed && <span>Important Tasks</span>}
        </div>
        <div className="nav-item">
          <FaList /> {!isCollapsed && <span>Task Manager</span>}
        </div>
        <div className="nav-item">
          <FaBook /> {!isCollapsed && <span>Documents</span>}
        </div>
      </div>

      {/* Focus Section */}
      <div className="section">
        {!isCollapsed && <div className="section-header">Focus</div>}
        <div className="nav-item">
          <FaClock /> {!isCollapsed && <span>Focus Mode</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
