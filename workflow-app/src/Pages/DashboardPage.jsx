import { useState } from "react";
import Calendar from "../components/Calendar/Calendar";
import "./DashboardPage.css";

const DashboardPage = () => {
  const [stats] = useState({
    totalTasks: 12,
    completedTasks: 8,
    activeProjects: 3,
    upcomingDeadlines: 2,
  });

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div className="card-content">
            <h3>Total Tasks</h3>
            <p className="stat-number">{stats.totalTasks}</p>
            <p className="stat-detail">{stats.completedTasks} completed</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <div className="card-content">
            <h3>Active Projects</h3>
            <p className="stat-number">{stats.activeProjects}</p>
            <p className="stat-detail">In progress</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="card-content">
            <h3>Upcoming Deadlines</h3>
            <p className="stat-number">{stats.upcomingDeadlines}</p>
            <p className="stat-detail">This week</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14"/>
                  <path d="M5 12h14"/>
                </svg>
              </div>
              <div className="activity-content">
                <p>New task created</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                </svg>
              </div>
              <div className="activity-content">
                <p>Completed task</p>
                <span className="activity-time">5 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="settings-button primary-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14"/>
                <path d="M5 12h14"/>
              </svg>
              New Task
            </button>
            <button className="settings-button secondary-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              </svg>
              New Project
            </button>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Calendar</h2>
          <Calendar />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
