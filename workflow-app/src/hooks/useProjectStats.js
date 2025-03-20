import { useState, useEffect } from "react";
import { apiRequest } from "../services/apiService";

// Custom hook to get project statistics
const useProjectStats = () => {
  const [projectStats, setProjectStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    onHoldProjects: 0,
    completedProjects: 0,
  });

  const fetchProjectStats = async () => {
    try {
      const response = await apiRequest("http://localhost:8080/api/projects");
      
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const projects = await response.json();
      
      // Calculate project statistics
      const activeProjects = projects.filter(project => project.status === "Active").length;
      const onHoldProjects = projects.filter(project => project.status === "On Hold").length;
      const completedProjects = projects.filter(project => project.status === "Completed").length;
      const totalProjects = projects.length;
      
      setProjectStats({
        totalProjects,
        activeProjects,
        onHoldProjects,
        completedProjects,
      });
    } catch (error) {
      console.error("Error fetching project statistics:", error);
    }
  };

  useEffect(() => {
    fetchProjectStats();
  }, []);

  return projectStats;
};

export default useProjectStats;
