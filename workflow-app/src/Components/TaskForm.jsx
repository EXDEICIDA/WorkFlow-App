import React, { useState } from "react";
import "./TaskForm.css";

const TaskForm = ({ onClose, onSubmit }) => {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(taskData);
    onClose();
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-container">
        <div className="task-form-header">
          <h2>Create New Task</h2>
          <button className="close-button" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="close-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Task Title</label>
            <input
              type="text"
              id="title"
              value={taskData.title}
              onChange={(e) =>
                setTaskData({ ...taskData, title: e.target.value })
              }
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={taskData.description}
              onChange={(e) =>
                setTaskData({ ...taskData, description: e.target.value })
              }
              placeholder="Enter task description"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <div className="priority-buttons">
              <button
                type="button"
                data-priority="low"
                className={`priority-btn ${
                  taskData.priority === "low" ? "active" : ""
                }`}
                onClick={() => setTaskData({ ...taskData, priority: "low" })}
              >
                Low
              </button>
              <button
                type="button"
                data-priority="medium"
                className={`priority-btn ${
                  taskData.priority === "medium" ? "active" : ""
                }`}
                onClick={() => setTaskData({ ...taskData, priority: "medium" })}
              >
                Medium
              </button>
              <button
                type="button"
                data-priority="high"
                className={`priority-btn ${
                  taskData.priority === "high" ? "active" : ""
                }`}
                onClick={() => setTaskData({ ...taskData, priority: "high" })}
              >
                High
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
