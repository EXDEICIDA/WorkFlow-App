import { useState } from "react";
import "./TasksPage.css";

const TasksPage = () => {
  const [viewType, setViewType] = useState("board"); // board, list, gallery

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <div className="tasks-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="task-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
            />
          </svg>
          <h1>Task List</h1>
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${viewType === "board" ? "active" : ""}`}
          >
            <span className="view-icon">📋</span> Board View
          </button>
          <button className={`view-btn ${viewType === "list" ? "active" : ""}`}>
            <span className="view-icon">📝</span> List
          </button>
          <button
            className={`view-btn ${viewType === "gallery" ? "active" : ""}`}
          >
            <span className="view-icon">🖼️</span> Gallery
          </button>
          <button className="new-task-btn">+</button>
        </div>
      </div>

      <div className="tasks-board">
        <div className="task-column">
          <div className="column-header">
            <h3>To Do</h3>
            <span className="task-count">3</span>
          </div>
          <div className="task-list">
            <div className="task-card">Go</div>
            <div className="task-card">EAT</div>
            <div className="task-card">Read A book</div>
            <button className="add-task-btn">+ New page</button>
          </div>
        </div>

        <div className="task-column">
          <div className="column-header">
            <h3>Doing</h3>
            <span className="task-count">1</span>
          </div>
          <div className="task-list">
            <div className="task-card">Go tot he mars</div>
            <button className="add-task-btn">+ New page</button>
          </div>
        </div>

        <div className="task-column">
          <div className="column-header">
            <h3>Done 🎉</h3>
            <span className="task-count">1</span>
          </div>
          <div className="task-list">
            <div className="task-card">Study</div>
            <button className="add-task-btn">+ New page</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
