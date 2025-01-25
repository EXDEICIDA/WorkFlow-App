import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ScriptsForm from "../Components/ScriptForm";
import "./ScriptsPage.css";
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
  faCss,
  faAngular,
  faReact,
  faFlutter,
  faBootstrap,
  faCodiepie,
} from "@fortawesome/free-brands-svg-icons";

const API_BASE_URL = "http://localhost:8080/api/scripts";
const languages = [
  { name: "JavaScript", icon: faJs, color: "#F7DF1E" },
  { name: "Python", icon: faPython, color: "#3776AB" },
  { name: "HTML", icon: faHtml5, color: "#E34F26" },
  { name: "CSS", icon: faCss3Alt, color: "#1572B6" },
  { name: "Angular", icon: faAngular, color: "#DD0031" },
  { name: "React", icon: faReact, color: "#61DAFB" },
  { name: "SQL", icon: faCodiepie, color: "#003B57" },
  { name: "Bootstrap", icon: faBootstrap, color: "#7952B3" },
  { name: "Java", icon: faJava, color: "#007396" },
  { name: "C++", icon: faCodiepie },
  { name: "Go", icon: faGolang, color: "#00ADD8" },
  { name: "PHP", icon: faPhp, color: "#777BB4" },
  { name: "Swift", icon: faSwift, color: "#FA7343" },
  { name: "Kotlin", icon: faCodiepie },
  { name: "Rust", icon: faRust, color: "#000000" },
  { name: "Dart", icon: faCodiepie, color: "#0175C2" },
  { name: "Flutter", icon: faFlutter, color: "#02569B" },
  { name: "C#", icon: faCss },
];

const ScriptsPage = () => {
  const [scripts, setScripts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setScripts(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching scripts:", error);
      setIsLoading(false);
    }
  };

  const handleAddScript = async (newScript) => {
    try {
      const response = await axios.post(API_BASE_URL, newScript);
      setScripts([...scripts, response.data]);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding script:", error);
      alert("Failed to add script");
    }
  };

  const filteredScripts = selectedLanguage
    ? scripts.filter((script) => script.language === selectedLanguage)
    : scripts;

  return (
    <div className="scripts-container">
      <div className="header-container">
        <h1>Scripts</h1>
        <div className="header-actions">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-filter"
          >
            <option value="">All Languages</option>
            {languages.map((lang) => (
              <option key={lang.name} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </select>
          <button className="add-button" onClick={() => setShowForm(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="add-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
        </div>
      </div>

      {showForm && (
        <ScriptsForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleAddScript}
        />
      )}

      <div className="scripts-section">
        <div className="scripts-grid">
          {isLoading ? (
            <div>Loading scripts...</div>
          ) : (
            filteredScripts.map((script) => {
              const languageData = languages.find(
                (lang) => lang.name === script.language
              );

              return (
                <div key={script.id} className="script-card">
                  <div className="script-info">
                    <h3 className="script-title">{script.title}</h3>
                    <p className="script-description">{script.description}</p>
                    <div className="script-status">
                      <div className="status-indicator" />
                      <span className="language-info">
                        Language:{" "}
                        {languageData ? (
                          <FontAwesomeIcon
                            icon={languageData.icon}
                            style={{
                              color: languageData.color,
                              marginRight: "0.5rem",
                            }}
                          />
                        ) : null}
                        {script.language}
                      </span>
                    </div>
                  </div>
                  <div className="script-controls">
                    <button className="script-button edit-button">Edit</button>
                    <button className="script-button run-button">Run</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptsPage;
