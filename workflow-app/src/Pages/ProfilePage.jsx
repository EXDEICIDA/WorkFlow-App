import { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { currentUser, authTokens } = useAuth();
  const [profileData, setProfileData] = useState({
    name: "Loading...",
    email: "Loading..."
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser || !authTokens) {
        setError("You must be logged in to view your profile");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/api/auth/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authTokens.access_token}`
          }
        });

        const data = await response.json();
        
        if (response.ok) {
          // Extract user data from the response
          const userData = data.user;
          
          setProfileData({
            name: userData.full_name || currentUser.email.split('@')[0],
            email: userData.email
          });
        } else {
          setError(data.error || "Failed to fetch profile data");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("An error occurred while fetching your profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, authTokens]);

  return (
    <div className="profile-container">
      <h1>Your profile</h1>

      {loading ? (
        <div className="loading-indicator">Loading profile data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="profile-section">
            <div className="profile-section-content">
              <h2>Name</h2>
              <h3>{profileData.name}</h3>
            </div>
            <button className="settings-button secondary-button">Change</button>
          </div>

          <div className="profile-section">
            <div className="profile-section-content">
              <h2>Email</h2>
              <h3>{profileData.email}</h3>
            </div>
            <button className="settings-button secondary-button">Change</button>
          </div>
        </>
      )}

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
