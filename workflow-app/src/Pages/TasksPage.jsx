import { useState, useEffect } from "react";
import "./TasksPage.css";
import TaskForm from "../Components/TaskForm";
import TaskItem from "../Components/TaskItem";

const TasksPage = () => {
  const [viewType, setViewType] = useState("board");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState({
    pending: [],
    inProgress: [],
    completed: [],
  });

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();

      // Group tasks by status
      const groupedTasks = {
        pending: data.filter((task) => task.status === "Pending"),
        inProgress: data.filter((task) => task.status === "In Progress"),
        completed: data.filter((task) => task.status === "Completed"),
      };

      setTasks(groupedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskSubmit = async (taskData) => {
    try {
      console.log("Sending task data:", taskData); // Debug log

      const response = await fetch("http://localhost:8080/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData); // Debug log
        throw new Error(errorData.error || "Failed to create task");
      }

      const newTask = await response.json();
      console.log("Task created:", newTask); // Debug log

      // Refresh tasks after creating new one
      fetchTasks();
      setShowTaskForm(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="view-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
            Board View
          </button>
          <button className={`view-btn ${viewType === "list" ? "active" : ""}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="view-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            List
          </button>
          <button
            className="new-task-btn"
            onClick={() => setShowTaskForm(true)}
          >
            +
          </button>
        </div>
      </div>

      <div className="view-divider">
        <span className="view-label">Board View</span>
      </div>

      <div className="tasks-board">
        <div className="task-column">
          <div className="column-header">
            <h3>To Do</h3>
            <span className="task-count">{tasks.pending.length}</span>
          </div>
          <div className="task-list">
            {tasks.pending.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>

        <div className="task-column">
          <div className="column-header">
            <h3>Doing</h3>
            <span className="task-count">{tasks.inProgress.length}</span>
          </div>
          <div className="task-list">
            {tasks.inProgress.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>

        <div className="task-column">
          <div className="column-header">
            <h3>Done 🎉</h3>
            <span className="task-count">{tasks.completed.length}</span>
          </div>
          <div className="task-list">
            {tasks.completed.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>

      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onSubmit={handleTaskSubmit}
        />
      )}
    </div>
  );
};

export default TasksPage;
