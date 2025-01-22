import React, { useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faJs,
  faPython,
  faHtml5,
  faCss3Alt,
  faJava,
  faPhp,
  faSwift,
  faRust,
} from "@fortawesome/free-brands-svg-icons";

const languages = [
  { name: "JavaScript", icon: faJs },
  { name: "Python", icon: faPython },
  { name: "TypeScript", icon: null },
  { name: "HTML", icon: faHtml5 },
  { name: "CSS", icon: faCss3Alt },
  { name: "SQL", icon: null },
  { name: "Java", icon: faJava },
  { name: "C++", icon: null },
  { name: "Ruby", icon: null },
  { name: "Go", icon: null },
  { name: "PHP", icon: faPhp },
  { name: "Swift", icon: faSwift },
  { name: "Kotlin", icon: null },
  { name: "Rust", icon: faRust },
];

const ScriptsForm = ({ onClose, onSubmit }) => {
  const [scriptData, setScriptData] = useState({
    title: "",
    language: languages[0].name,
    code: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!scriptData.title.trim()) {
      alert("Title is required!");
      return;
    }

    try {
      console.log("Sending script data:", scriptData);
      await onSubmit(scriptData);
      onClose();
    } catch (error) {
      console.error("Error submitting script:", error);
      alert(error.message || "Failed to create script");
    }
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-container">
        <div className="task-form-header">
          <h2>Create New Script</h2>
          <button className="close-button" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="close-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Script Title</label>
            <input
              type="text"
              id="title"
              value={scriptData.title}
              onChange={(e) =>
                setScriptData({ ...scriptData, title: e.target.value })
              }
              placeholder="Enter script title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="language">Language</label>
            <div className="language-select-container">
              <select
                id="language"
                value={scriptData.language}
                onChange={(e) =>
                  setScriptData({
                    ...scriptData,
                    language: e.target.value,
                  })
                }
              >
                {languages.map(({ name, icon }) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {languages.find((lang) => lang.name === scriptData.language)
                ?.icon && (
                <FontAwesomeIcon
                  icon={
                    languages.find((lang) => lang.name === scriptData.language)
                      .icon
                  }
                  className="language-icon"
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="code">Code</label>
            <textarea
              id="code"
              value={scriptData.code}
              onChange={(e) =>
                setScriptData({ ...scriptData, code: e.target.value })
              }
              placeholder="Enter your code here..."
              className="code-editor"
              rows="8"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={scriptData.description}
              onChange={(e) =>
                setScriptData({ ...scriptData, description: e.target.value })
              }
              placeholder="Add a description..."
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Script
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ScriptsForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ScriptsForm;
