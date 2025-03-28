import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { apiRequest } from "../services/apiService";
import "./TasksPage.css";
import TaskForm from "../Components/TaskForm";
import TaskItem from "../Components/TaskItem";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const TasksPage = () => {
  const [viewType, setViewType] = useState("board");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tasks, setTasks] = useState({
    pending: [],
    inProgress: [],
    completed: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priority: {
      high: false,
      medium: false,
      low: false,
    },
    status: {
      pending: false,
      inProgress: false,
      completed: false,
    },
  });
  const { currentUser } = useAuth();
  const location = useLocation();

  const fetchTasks = async () => {
    try {
      const response = await apiRequest("http://localhost:8080/api/tasks");
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

  useEffect(() => {
    // Check if we're coming from the dashboard "New Task" button
    if (location.state && location.state.openTaskForm) {
      setShowTaskForm(true);
    }
  }, [location]);

  const handleTaskSubmit = async (taskData) => {
    try {
      console.log("Sending task data:", taskData); // Debug log
      
      // Add user_id to the task
      const taskWithUserId = {
        ...taskData,
        user_id: currentUser.id
      };

      const response = await apiRequest("http://localhost:8080/api/tasks", {
        method: "POST",
        body: JSON.stringify(taskWithUserId),
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

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await apiRequest(
        `http://localhost:8080/api/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      // Only update local state after successful API call
      setTasks((prevTasks) => ({
        pending: prevTasks.pending.filter((task) => task.id !== taskId),
        inProgress: prevTasks.inProgress.filter((task) => task.id !== taskId),
        completed: prevTasks.completed.filter((task) => task.id !== taskId),
      }));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      // Add user_id to the updated task if it doesn't have one
      const taskWithUserId = {
        ...updatedTask,
        user_id: updatedTask.user_id || currentUser.id
      };
      
      const response = await apiRequest(
        `http://localhost:8080/api/tasks/${taskWithUserId.id}`,
        {
          method: "PUT",
          body: JSON.stringify(taskWithUserId),
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      
      setTasks((prevTasks) => {
        const newTasks = {
          pending: prevTasks.pending.filter((task) => task.id !== updatedTask.id),
          inProgress: prevTasks.inProgress.filter(
            (task) => task.id !== updatedTask.id
          ),
          completed: prevTasks.completed.filter(
            (task) => task.id !== updatedTask.id
          ),
        };

        // Add the task to the correct column based on its status
        switch (updatedTask.status) {
          case "Pending":
            newTasks.pending.push(updatedTask);
            break;
          case "In Progress":
            newTasks.inProgress.push(updatedTask);
            break;
          case "Completed":
            newTasks.completed.push(updatedTask);
            break;
          default:
            break;
        }

        return newTasks;
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleFilterChange = (category, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [value]: !prev[category][value],
      },
    }));
  };

  const filterTasks = (tasks) => {
    // Convert tasks object to array if it's not already
    const tasksArray = Array.isArray(tasks)
      ? tasks
      : [...tasks.pending, ...tasks.inProgress, ...tasks.completed];

    // Check if any filters are active
    const hasActiveFilters = Object.values(filters).some((category) =>
      Object.values(category).some((value) => value)
    );

    // If no filters are active, return all tasks
    if (!hasActiveFilters) return tasksArray;

    return tasksArray.filter((task) => {
      // Check priority filters
      const priorityMatch =
        filters.priority[task.priority.toLowerCase()] ||
        !Object.values(filters.priority).some((v) => v);

      // Check status filters
      const statusMap = {
        Pending: "pending",
        "In Progress": "inProgress",
        Completed: "completed",
      };
      const statusMatch =
        filters.status[statusMap[task.status]] ||
        !Object.values(filters.status).some((v) => v);

      return priorityMatch && statusMatch;
    });
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
            onClick={() => setViewType("board")}
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
          <button
            className={`view-btn ${viewType === "list" ? "active" : ""}`}
            onClick={() => setViewType("list")}
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
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            List View
          </button>
          <div className="filter-dropdown">
            <button
              className={`view-btn ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
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
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                />
              </svg>
              Filter
            </button>

            {showFilters && (
              <div className="filter-menu">
                <div className="filter-section">
                  <h4>Priority</h4>
                  <div className="filter-option">
                    <input
                      type="checkbox"
                      id="priority-high"
                      checked={filters.priority.high}
                      onChange={() => handleFilterChange("priority", "high")}
                    />
                    <label htmlFor="priority-high">High Priority</label>
                  </div>
                  <div className="filter-option">
                    <input
                      type="checkbox"
                      id="priority-medium"
                      checked={filters.priority.medium}
                      onChange={() => handleFilterChange("priority", "medium")}
                    />
                    <label htmlFor="priority-medium">Medium Priority</label>
                  </div>
                  <div className="filter-option">
                    <input
                      type="checkbox"
                      id="priority-low"
                      checked={filters.priority.low}
                      onChange={() => handleFilterChange("priority", "low")}
                    />
                    <label htmlFor="priority-low">Low Priority</label>
                  </div>
                </div>

                <div className="filter-section">
                  <h4>Status</h4>
                  <div className="filter-option">
                    <input
                      type="checkbox"
                      id="status-pending"
                      checked={filters.status.pending}
                      onChange={() => handleFilterChange("status", "pending")}
                    />
                    <label htmlFor="status-pending">To Do</label>
                  </div>
                  <div className="filter-option">
                    <input
                      type="checkbox"
                      id="status-inProgress"
                      checked={filters.status.inProgress}
                      onChange={() =>
                        handleFilterChange("status", "inProgress")
                      }
                    />
                    <label htmlFor="status-inProgress">In Progress</label>
                  </div>
                  <div className="filter-option">
                    <input
                      type="checkbox"
                      id="status-completed"
                      checked={filters.status.completed}
                      onChange={() => handleFilterChange("status", "completed")}
                    />
                    <label htmlFor="status-completed">Completed</label>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            className="new-task-btn"
            onClick={() => setShowTaskForm(true)}
          >
            +
          </button>
        </div>
      </div>

      <div className="view-divider">
        <span className="view-label">
          {viewType === "board" ? "Board View" : "List View"}
        </span>
      </div>

      {viewType === "board" ? (
        <div className="tasks-board">
          <div className="task-column">
            <div className="column-header">
              <div className="header-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="status-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <h3>To Do</h3>
              </div>
              <span className="task-count">
                {filterTasks(tasks.pending).length}
              </span>
            </div>
            <div className="task-list">
              {filterTasks(tasks.pending).map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                  onUpdate={handleUpdateTask}
                />
              ))}
            </div>
          </div>

          <div className="task-column">
            <div className="column-header">
              <div className="header-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="status-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
                  />
                </svg>
                <h3>Doing</h3>
              </div>
              <span className="task-count">
                {filterTasks(tasks.inProgress).length}
              </span>
            </div>
            <div className="task-list">
              {filterTasks(tasks.inProgress).map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                  onUpdate={handleUpdateTask}
                />
              ))}
            </div>
          </div>

          <div className="task-column">
            <div className="column-header">
              <div className="header-content">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="status-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <h3>Done</h3>
              </div>
              <span className="task-count">
                {filterTasks(tasks.completed).length}
              </span>
            </div>
            <div className="task-list">
              {filterTasks(tasks.completed).map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                  onUpdate={handleUpdateTask}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="tasks-list-view">
          {filterTasks([
            ...tasks.pending,
            ...tasks.inProgress,
            ...tasks.completed,
          ]).map((task) => (
            <div key={task.id} className="list-task-item">
              <div className="task-info">
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <span
                    className={`task-status ${task.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {task.status}
                  </span>
                  <span
                    className={`task-priority ${task.priority.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>
                  <span className="task-date">
                    {formatDate(task.created_at)}
                  </span>
                </div>
                <p className="task-description">{task.description}</p>
              </div>
              <div className="task-actions">
                <button className="edit-btn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                </button>
                <button className="delete-btn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
