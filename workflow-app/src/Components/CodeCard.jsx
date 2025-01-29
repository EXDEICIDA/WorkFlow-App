import { useState } from "react";
import PropTypes from "prop-types";
import { Check, Copy, ChevronDown } from "lucide-react";

const CodeCard = ({ code, language, onLanguageChange }) => {
  const [showLanguages, setShowLanguages] = useState(false);
  const [copied, setCopied] = useState(false);

  const languages = [
    { name: "JavaScript", color: "#F7DF1E" },
    { name: "Python", color: "#3776AB" },
    { name: "HTML", color: "#E34F26" },
    { name: "CSS", color: "#1572B6" },
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-zinc-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <div className="relative">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="flex items-center gap-2 text-zinc-300 hover:text-white"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  languages.find((l) => l.name === language)?.color || "#888",
              }}
            />
            <span>{language}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showLanguages && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-800 rounded-md shadow-lg border border-zinc-700">
              {languages.map((lang) => (
                <button
                  key={lang.name}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                  onClick={() => {
                    onLanguageChange(lang.name);
                    setShowLanguages(false);
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: lang.color }}
                  />
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-zinc-400 hover:text-white"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
        <pre className="whitespace-pre-wrap">{code}</pre>
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
