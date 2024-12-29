import React from 'react';
import flowCentricIcon from '../assets/flow-centric-icon.png';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <img src={flowCentricIcon} alt="Flow Centric" className="header-icon" />
          <h1 className="header-title">Flow  Centric</h1>
        </div>
        <div className="header-right">
          {/* Add additional header elements here if needed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
