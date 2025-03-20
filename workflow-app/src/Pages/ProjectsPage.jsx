import { useState, useEffect } from "react";
import { apiRequest } from "../services/apiService";
import ProjectForm from "../Components/ProjectForm";
import ProjectCard from "../Components/ProjectCard";
import "./ProjectsPage.css";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("http://localhost:8080/api/projects");
      
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      const response = await apiRequest("http://localhost:8080/api/projects", {
        method: "POST",
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const newProject = await response.json();
      setProjects((prev) => [newProject, ...prev]);
      setShowProjectForm(false);
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
    }
  };

  const handleUpdateProject = async (projectData) => {
    try {
      const response = await apiRequest(
        `http://localhost:8080/api/projects/${editingProject.id}`,
        {
          method: "PUT",
          body: JSON.stringify(projectData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      const updatedProject = await response.json();
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
      setEditingProject(null);
    } catch (err) {
      console.error("Error updating project:", err);
      setError("Failed to update project. Please try again.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const response = await apiRequest(
        `http://localhost:8080/api/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project. Please try again.");
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
  };

  const handleCancelForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleSubmit = (formData) => {
    if (editingProject) {
      handleUpdateProject(formData);
    } else {
      handleCreateProject(formData);
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    return project.status === filter;
  });

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Projects</h1>
        <button
          className="create-project-btn"
          onClick={() => setShowProjectForm(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Project
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {(showProjectForm || editingProject) && (
        <div className="form-overlay">
          <ProjectForm
            onSubmit={handleSubmit}
            onCancel={handleCancelForm}
            initialData={editingProject || {}}
          />
        </div>
      )}

      <div className="projects-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === "Active" ? "active" : ""}`}
          onClick={() => setFilter("Active")}
        >
          Active
        </button>
        <button
          className={`filter-btn ${filter === "On Hold" ? "active" : ""}`}
          onClick={() => setFilter("On Hold")}
        >
          On Hold
        </button>
        <button
          className={`filter-btn ${filter === "Completed" ? "active" : ""}`}
          onClick={() => setFilter("Completed")}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="no-projects">
          <p>
            {filter === "all"
              ? "You don't have any projects yet. Create your first project to get started!"
              : `No ${filter.toLowerCase()} projects found.`}
          </p>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;