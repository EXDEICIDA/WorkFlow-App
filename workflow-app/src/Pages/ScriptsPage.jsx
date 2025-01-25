import React, { useState, useEffect } from "react";
import axios from "axios";
import ScriptsForm from "../Components/ScriptForm";
import "./ScriptsPage.css";

const API_BASE_URL = "http://localhost:8080/api/scripts";

const ScriptsPage = () => {
  const [scripts, setScripts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="scripts-container">
      <div className="header-container">
        <h1>Scripts</h1>
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
            scripts.map((script) => (
              <div key={script.id} className="script-card">
                <div className="script-info">
                  <h3 className="script-title">{script.title}</h3>
                  <p className="script-description">{script.description}</p>
                  <div className="script-status">
                    <div className="status-indicator" />
                    <span>Language: {script.language}</span>
                  </div>
                </div>
                <div className="script-controls">
                  <button className="script-button edit-button">Edit</button>
                  <button className="script-button run-button">Run</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptsPage;
