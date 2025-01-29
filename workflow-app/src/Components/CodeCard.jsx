// CodeCard.jsx
import { useState } from "react";
import { Check, Copy, ChevronDown } from "lucide-react";
import "./CodeCard.css";
import PropTypes from "prop-types";

const languages = [
  { name: "JavaScript", color: "#F7DF1E" },
  { name: "Python", color: "#3776AB" },
  { name: "HTML", color: "#E34F26" },
  { name: "CSS", color: "#1572B6" },
  { name: "Angular", color: "#DD0031" },
  { name: "React", color: "#61DAFB" },
  { name: "C", color: "#555555" },
  { name: "Bootstrap", color: "#7952B3" },
  { name: "Java", color: "#2C241B" },
  { name: "C++", color: "#00599C" },
  { name: "Go", color: "#00ADD8" },
  { name: "PHP", color: "#777BB4" },
  { name: "Swift", color: "#FA7343" },
  { name: "Rust", color: "#000000" },
  { name: "Flutter", color: "#02569B" },
  { name: "Dart", color: "#0175C2" },
  { name: "C#", color: "#239120" },
];

const CodeCard = ({ code, language, onLanguageChange }) => {
  const [showLanguages, setShowLanguages] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentLang = languages.find((l) => l.name === language) || {
    name: language,
    color: "#888",
  };

  return (
    <div className="code-card">
      <div className="code-card-header">
        <div className="language-selector">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="language-button"
          >
            <div
              className="language-dot"
              style={{ backgroundColor: currentLang.color }}
            />
            <span>{language}</span>
            <ChevronDown className="chevron-icon" />
          </button>

          {showLanguages && (
            <div className="language-dropdown">
              {languages.map((lang) => (
                <button
                  key={lang.name}
                  className="language-option"
                  onClick={() => {
                    onLanguageChange(lang.name);
                    setShowLanguages(false);
                  }}
                >
                  <div
                    className="language-dot small"
                    style={{ backgroundColor: lang.color }}
                  />
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleCopy} className="copy-button">
          {copied ? <Check className="icon" /> : <Copy className="icon" />}
        </button>
      </div>

      <div className="code-content">
        <pre>{code}</pre>
      </div>
    </div>
  );
};

CodeCard.propTypes = {
  code: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  onLanguageChange: PropTypes.func.isRequired,
};

export default CodeCard;
