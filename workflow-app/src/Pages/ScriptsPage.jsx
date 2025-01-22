import React, { useState } from "react";
import "./ScriptsPage.css";
import ScriptsForm from "../Components/ScriptForm.jsx";

const ScriptsPage = () => {
  const [scripts, setScripts] = useState([
    {
      id: 1,
      title: "Backup Database",
      description: "Automated daily backup of the production database",
      status: "active",
      lastRun: "2 hours ago",
    },
    {
      id: 2,
      title: "Log Cleanup",
      description: "Remove logs older than 30 days",
      status: "inactive",
      lastRun: "5 days ago",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const handleAddScript = (newScript) => {
    setScripts([...scripts, { ...newScript, id: scripts.length + 1 }]);
    setShowForm(false);
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
          onSubmit={handleAddScript} // Optional, if used
        />
      )}

      <div className="scripts-section">
        <div className="scripts-grid">
          {scripts.map((script) => (
            <div key={script.id} className="script-card">
              <div className="script-info">
                <h3 className="script-title">{script.title}</h3>
                <p className="script-description">{script.description}</p>
                <div className="script-status">
                  <div className={`status-indicator status-${script.status}`} />
                  <span>Last run: {script.lastRun}</span>
                </div>
              </div>
              <div className="script-controls">
                <button className="script-button edit-button">Edit</button>
                <button className="script-button run-button">Run</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScriptsPage;
