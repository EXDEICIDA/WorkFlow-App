import { useState } from "react";
import "./SettingsPage.css";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    version: "v1.0.0",
    automaticUpdates: true,
    language: "english",
    notifications: true,
    emailUpdates: true,
    autoSave: true,
    soundEffects: true,
    darkMode: false,
  });

  const handleToggle = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleLanguageChange = (e) => {
    setSettings((prev) => ({
      ...prev,
      language: e.target.value,
    }));
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="settings-section">
        <div className="settings-section-content">
          <h2>Current version: v1.0.0</h2>
          <p>App is up to date!</p>
          <button className="settings-button primary-button">
            Check for updates
          </button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-content">
          <h2>Automatic updates</h2>
          <p>Turn this off to prevent the app from checking for updates.</p>
        </div>
        <div className="settings-section-controls">
          <div className="update-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.automaticUpdates}
              onChange={() => handleToggle("automaticUpdates")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-content">
          <h2>Language</h2>
          <p>Change the display language.</p>
        </div>
        <div className="settings-section-controls">
          <select
            value={settings.language}
            onChange={handleLanguageChange}
            className="settings-select"
          >
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-content">
          <h2>Account</h2>
          <h3>Your account</h3>
          <p>You are currently signed in as user@example.com</p>
        </div>
        <div className="settings-section-controls">
          <button className="settings-button secondary-button">Manage</button>
          <button className="settings-button danger-button">Log out</button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-content">
          <h2>Advanced</h2>
          <h3>Notify if startup takes longer than expected</h3>
          <p>
            Diagnose issues with your app by seeing what is causing the app to
            load slowly.
          </p>
        </div>
        <div className="settings-section-controls">
          <div className="notification-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={() => handleToggle("notifications")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-content">
          <h2>Appearance</h2>
          <h3>Dark mode</h3>
          <p>Switch between light and dark theme.</p>
        </div>
        <div className="settings-section-controls">
          <div className="theme-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
              />
            </svg>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={() => handleToggle("darkMode")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
