/*Scripts form jsx here */
import React, { useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes

const languages = [
  "JavaScript",
  "Python",
  "TypeScript",
  "HTML",
  "CSS",
  "SQL",
  "Java",
  "C++",
  "Ruby",
  "Go",
  "PHP",
  "Swift",
  "Kotlin",
  "Rust",
];

const ScriptsForm = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(languages[0]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>Add New Script</h2>
          <button className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter script title..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Language</label>
            <select
              className="form-input"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Code</label>
            <textarea
              className="form-input code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code here..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea
              className="form-input description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
            />
          </div>

          <button className="primary-button">Save Script</button>
        </form>
      </div>
    </div>
  );
};
ScriptsForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ScriptsForm;
