import React from "react";
import flowCentricIcon from "../assets/flow-centric-icon.png";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <img
            src={flowCentricIcon}
            alt="Flow Centric"
            className="header-icon"
          />
          <button className="menu-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="menu-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
        <div className="header-right">
          {/* Add additional header elements here if needed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
