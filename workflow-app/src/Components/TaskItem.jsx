import React, { useState } from "react";
import "./TaskItem.css";
import PropTypes from "prop-types";
import { apiRequest } from "../services/apiService";

// TaskItem component

const TaskItem = ({ task, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isChecked, setIsChecked] = useState(task.status === "Completed");
  // We can determine completion based on status
  const isCompleted = task.status === "Completed";

  const handleEdit = async () => {
    try {
      const response = await apiRequest(
        `http://localhost:8080/api/tasks/${task.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ title: editedTitle }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();
      onUpdate(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleCheckboxChange = async (e) => {
    setIsChecked(e.target.checked);

    try {
      // When checked, move to Completed, when unchecked move back to Pending
      const newStatus = task.status === "Completed" ? "Pending" : "Completed";

      const response = await apiRequest(
        `http://localhost:8080/api/tasks/${task.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        // Revert checkbox state if request fails
        setIsChecked(!e.target.checked);
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();
      onUpdate(updatedTask);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // Check if task status is either Pending or In Progress
  const showCheckbox =
    task.status === "Pending" || task.status === "In Progress";

  return (
    <div className="task-item">
      {showCheckbox && (
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="task-checkbox"
        />
      )}
      {isEditing ? (
        <div className="edit-mode">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleEdit();
              }
            }}
            autoFocus
          />
          <div className="edit-actions">
            <button onClick={handleEdit} className="save-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="edit-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="edit-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="task-title">{task.title}</h3>
          <div className="task-actions">
            <button
              className="status-btn"
              onClick={async () => {
                const statusProgression = {
                  Pending: "In Progress",
                  "In Progress": "Completed",
                  Completed: "Pending",
                };
                const newStatus = statusProgression[task.status];

                try {
                  const response = await apiRequest(
                    `http://localhost:8080/api/tasks/${task.id}/status`,
                    {
                      method: "PUT",
                      body: JSON.stringify({ status: newStatus }),
                    }
                  );

                  if (!response.ok) {
                    throw new Error("Failed to update task status");
                  }

                  const updatedTask = await response.json();
                  onUpdate(updatedTask);
                } catch (error) {
                  console.error("Error updating task status:", error);
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
                style={{ width: "1.25rem", height: "1.25rem", color: "#666" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
            </button>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="edit-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                />
              </svg>
            </button>
            <button className="delete-btn" onClick={() => onDelete(task.id)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="delete-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

TaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default TaskItem;
