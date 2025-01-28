import React, { useState } from "react";
import "./SearchButton.css";
import PropTypes from "prop-types";

const SearchButton = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset search when closing
      onChange("");
    }
  };

  const handleSearchChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="search-container">
      <div className={`search-wrapper ${isOpen ? "open" : ""}`}>
        <button
          onClick={toggleSearch}
          className={`search-button ${isOpen ? "open" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="search-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>

        <input
          type="text"
          value={value}
          onChange={handleSearchChange}
          placeholder="Search scripts..."
          className={`search-input ${isOpen ? "open" : ""}`}
        />
      </div>
    </div>
  );
};

SearchButton.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SearchButton;
