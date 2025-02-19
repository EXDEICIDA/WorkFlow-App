import { useState } from "react";
import Calendar from "../Components/Calendar/Calendar";
import "./DashboardPage.css";

const DashboardPage = () => {
  const [stats] = useState({
    totalTasks: 12,
    completedTasks: 8,
    activeProjects: 3,
    upcomingDeadlines: 2,
  });

  const [recentActivities] = useState([
    { type: "add", text: "New task created", time: "2 hours ago" },
    { type: "complete", text: "Completed task", time: "5 hours ago" },
    { type: "comment", text: "Comment added to Project X", time: "Yesterday" },
    { type: "update", text: "Updated deadline for Task Y", time: "2 days ago" },
  ]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-date">
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="dashboard-overview">
        <div className="stat-card tasks">
          <div className="stat-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="stat-info">
            <h3>Total Tasks</h3>
            <div className="stat-data">
              <div className="stat-number">{stats.totalTasks}</div>
              <div className="stat-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        (stats.completedTasks / stats.totalTasks) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                  complete
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card projects">
          <div className="stat-icon">
            <svg
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3"
              />
            </svg>
          </div>
          <div className="stat-info">
            <h3>Active Projects</h3>
            <div className="stat-data">
              <div className="stat-number">{stats.activeProjects}</div>
              <div className="stat-detail">In progress</div>
            </div>
          </div>
        </div>

        <div className="stat-card deadlines">
          <div className="stat-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-info">
            <h3>Upcoming Deadlines</h3>
            <div className="stat-data">
              <div className="stat-number">{stats.upcomingDeadlines}</div>
              <div className="stat-detail">This week</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-column main">
          <div className="dashboard-section calendar-section">
            <div className="section-header">
              <h2>Calendar</h2>
              <button className="view-all-button">View All</button>
            </div>
            <Calendar />
          </div>
        </div>

        <div className="dashboard-column side">
          <div className="dashboard-section activity-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
              <button className="view-all-button">View All</button>
            </div>
            <div className="activity-list">
              {recentActivities.map((activity, index) => (
                <div className="activity-item" key={index}>
                  <div className={`activity-icon ${activity.type}`}>
                    {activity.type === "add" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                    )}
                    {activity.type === "complete" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 11l3 3L22 4" />
                      </svg>
                    )}
                    {activity.type === "comment" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    )}
                    {activity.type === "update" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 2v6h-6" />
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                        <path d="M3 22v-6h6" />
                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                      </svg>
                    )}
                  </div>
                  <div className="activity-content">
                    <p>{activity.text}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-section quick-actions-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <button className="action-button primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                New Task
              </button>
              <button className="action-button secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                </svg>
                New Project
              </button>
              <button className="action-button tertiary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
