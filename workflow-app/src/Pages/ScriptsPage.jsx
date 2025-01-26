import React, { useState, useEffect } from "react";
import axios from "axios";
import ScriptsForm from "../Components/ScriptForm";
import "./ScriptsPage.css";

const API_BASE_URL = "http://localhost:8080/api/scripts";
const languages = [
  { name: "JavaScript", color: "#F7DF1E" },
  { name: "Python", color: "#3776AB" },
  { name: "HTML", color: "#E34F26" },
  { name: "CSS", color: "#1572B6" },
  { name: "Angular", color: "#DD0031" },
  { name: "React", color: "#61DAFB" },
  { name: "C", color: "#555555" },
  { name: "Bootstrap", color: "#7952B3" },
  { name: "Java", color: "#007396" },
  { name: "C++", color: "#00599C" },
  { name: "Go", color: "#00ADD8" },
  { name: "PHP", color: "#777BB4" },
  { name: "Swift", color: "#FA7343" },
  { name: "Rust", color: "#000000" },
  { name: "Flutter", color: "#02569B" },
  { name: "Dart", color: "#0175C2" },
  { name: "C#", color: "#239120" },
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
          <div className="language-filter-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="language-filter-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
              />
            </svg>
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
          </div>
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
                      <span
                        className="language-dot"
                        style={{
                          backgroundColor: languageData
                            ? languageData.color
                            : "#888",
                          marginRight: "0.2rem",
                        }}
                      />
                      <span className="language-name">{script.language}</span>
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
