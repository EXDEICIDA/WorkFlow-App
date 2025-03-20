import { useState } from "react";
import PropTypes from "prop-types";
import "./ProjectCard.css";

const formatDate = (dateString) => {
  if (!dateString) return "No deadline";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "Active":
      return "#4caf50"; // Green
    case "On Hold":
      return "#ff9800"; // Orange
    case "Completed":
      return "#2196f3"; // Blue
    case "Cancelled":
      return "#f44336"; // Red
    default:
      return "#757575"; // Grey
  }
};

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div className="project-card">
      <div className="project-card-header">
        <div 
          className="project-status" 
          style={{ backgroundColor: getStatusColor(project.status) }}
        >
          {project.status}
        </div>
        <div className="project-actions">
          <button 
            className="actions-toggle"
            onClick={() => setShowActions(!showActions)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
          {showActions && (
            <div className="actions-menu">
              <button onClick={() => onEdit(project)}>Edit</button>
              <button onClick={() => onDelete(project.id)}>Delete</button>
            </div>
          )}
        </div>
      </div>
      
      <h3 className="project-title">{project.title}</h3>
      
      <p className="project-description">
        {project.description || "No description provided"}
      </p>
      
      <div className="project-footer">
        <div className="project-deadline">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formatDate(project.deadline)}</span>
        </div>
        
        <div className="project-created">
          Created: {formatDate(project.created_at)}
        </div>
      </div>
    </div>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string.isRequired,
    deadline: PropTypes.string,
    created_at: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ProjectCard;
