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
  faGolang,
  faAngular,
  faReact,
  faFlutter,
  faBootstrap,
  faDartLang,
} from "@fortawesome/free-brands-svg-icons";

const languages = [
  { name: "JavaScript", icon: faJs, color: "#F7DF1E" },
  { name: "Python", icon: faPython, color: "#3776AB" },
  { name: "HTML", icon: faHtml5, color: "#E34F26" },
  { name: "CSS", icon: faCss3Alt, color: "#1572B6" },
  { name: "Angular", icon: faAngular, color: "#DD0031" },
  { name: "React", icon: faReact, color: "#61DAFB" },
  { name: "C", customIcon: "C", color: "#555555" },
  { name: "Bootstrap", icon: faBootstrap, color: "#7952B3" },
  { name: "Java", icon: faJava, color: "#007396" },
  { name: "C++", customIcon: "C++", color: "#00599C" },
  { name: "Go", icon: faGolang, color: "#00ADD8" },
  { name: "PHP", icon: faPhp, color: "#777BB4" },
  { name: "Swift", icon: faSwift, color: "#FA7343" },
  { name: "Rust", icon: faRust, color: "#000000" },
  { name: "Dart", icon: faDartLang, color: "#0175C2" },
  { name: "Flutter", icon: faFlutter, color: "#02569B" },
  { name: "C#", customIcon: "C#", color: "#8A2BE2" },
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

  const selectedLanguage = languages.find(
    (lang) => lang.name === scriptData.language
  );
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
              <div className="language-select-wrapper">
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
                  {languages.map(({ name }) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                {selectedLanguage?.customIcon ? (
                  <span
                    className="language-icon"
                    style={{
                      color: selectedLanguage.color,
                      fontSize: "1rem",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedLanguage.customIcon}
                  </span>
                ) : (
                  <FontAwesomeIcon
                    icon={selectedLanguage?.icon}
                    className="language-icon"
                    style={{
                      color: selectedLanguage?.color,
                      fontSize: "1rem",
                    }}
                  />
                )}
              </div>
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
