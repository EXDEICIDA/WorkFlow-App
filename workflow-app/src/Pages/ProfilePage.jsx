import React from "react";
import "./ProfilePage.css";

const ProfilePage = () => {
  return (
    <div className="profile-container">
      <h1>Your profile</h1>

      <div className="profile-section">
        <div className="profile-section-content">
          <h2>Name</h2>
          <h3>John Doe</h3>
        </div>
        <button className="settings-button secondary-button">Change</button>
      </div>

      <div className="profile-section">
        <div className="profile-section-content">
          <h2>Email</h2>
          <h3>example@gmail.com</h3>
        </div>
        <button className="settings-button secondary-button">Change</button>
      </div>

      <div className="profile-section">
        <div className="profile-section-content">
          <h2>Password</h2>
          <p>Change your account password.</p>
        </div>
        <button className="settings-button secondary-button">Change</button>
      </div>

      <div className="profile-section">
        <div className="profile-section-content">
          <h2>2-factor authentication</h2>
          <p>Protect your account with a second verification step.</p>
        </div>
        <button className="settings-button secondary-button">Enable</button>
      </div>

      <div className="profile-section">
        <div className="profile-section-content">
          <h2>Contact support</h2>
          <p>Reach us for account, billing, or paid service inquiries.</p>
        </div>
        <button className="settings-button secondary-button">Email us</button>
      </div>

      <div className="profile-section">
        <div className="profile-section-content">
          <h2>Log out everywhere</h2>
          <p>
            Log out on all devices for security reasons. You will need to log in
            again on each device.
          </p>
        </div>
        <button className="settings-button secondary-button">Log out</button>
      </div>

      <div className="profile-section">
        <div className="profile-section-content">
          <h2>Delete account</h2>
          <p>
            Permanently delete your account, licenses, and subscriptions. You
            will be asked for confirmation before deletion proceeds.
          </p>
        </div>
        <button className="settings-button danger-button">Delete</button>
      </div>
    </div>
  );
};

export default ProfilePage;
