import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/apiService";
import useProjectStats from "../hooks/useProjectStats";
import Calendar from "../Components/Calendar/Calendar";
import "./DashboardPage.css";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingDeadlines: 2,
  });

  // Get project statistics from the custom hook
  const projectStats = useProjectStats();

  const [recentActivities, setRecentActivities] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  
  // Event related states
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    all_day: false,
    color: "#e6c980"
  });

  const navigate = useNavigate();

  // Fetch tasks and calculate statistics
  const fetchTaskStats = async () => {
    try {
      // The API endpoint already filters by the authenticated user through the auth middleware
      const response = await apiRequest("http://localhost:8080/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const tasks = await response.json();
      
      // Calculate task statistics
      const completedTasks = tasks.filter(task => task.status === "Completed").length;
      const totalTasks = tasks.length;
      
      setStats(prevStats => ({
        ...prevStats,
        totalTasks,
        completedTasks,
      }));
    } catch (error) {
      console.error("Error fetching task statistics:", error);
    }
  };

  // Fetch user activities
  const fetchActivities = async (limit = 10) => {
    try {
      setActivitiesLoading(true);
      const response = await apiRequest(`http://localhost:8080/api/activities?limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const activities = await response.json();
      
      // Transform activities for display
      const formattedActivities = activities.map(activity => {
        // Format the timestamp
        const timestamp = new Date(activity.timestamp);
        const now = new Date();
        
        // Calculate time difference
        const diffMs = now - timestamp;
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);
        
        let timeString;
        if (diffMins < 60) {
          timeString = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
          timeString = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 30) {
          timeString = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
          timeString = timestamp.toLocaleDateString();
        }
        
        // Determine activity type icon
        let type;
        switch (activity.activity_type) {
          case 'create':
            type = 'add';
            break;
          case 'complete':
            type = 'complete';
            break;
          case 'update':
          case 'rename':
          case 'move':
            type = 'update';
            break;
          case 'delete':
            type = 'delete';
            break;
          default:
            type = 'update';
        }
        
        return {
          id: activity.id,
          type,
          text: activity.description,
          time: timeString,
          timestamp: timestamp,
          related_item_id: activity.related_item_id,
          related_item_type: activity.related_item_type
        };
      });
      
      if (limit === 10) {
        setRecentActivities(formattedActivities);
      } else {
        setAllActivities(formattedActivities);
      }
      setActivitiesLoading(false);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivitiesLoading(false);
    }
  };

  // Fetch all activities for the modal
  const fetchAllActivities = async () => {
    await fetchActivities(100); // Fetch up to 100 activities for the "View All" modal
  };

  // Handle opening the "View All" activities modal
  const handleViewAllActivities = () => {
    fetchAllActivities();
    setShowAllActivities(true);
  };

  // Handle opening the full calendar modal
  const handleViewFullCalendar = () => {
    setShowFullCalendar(true);
  };

  useEffect(() => {
    fetchTaskStats();
    fetchActivities();
    fetchUpcomingEvents(); // Fetch upcoming events on component mount
  }, []);

  // Calculate percentages for progress bars
  const getTaskCompletionPercentage = () => {
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  const getActiveProjectsPercentage = () => {
    if (projectStats.totalProjects === 0) return 0;
    return Math.round((projectStats.activeProjects / projectStats.totalProjects) * 100);
  };

  const getOnHoldProjectsPercentage = () => {
    if (projectStats.totalProjects === 0) return 0;
    return Math.round((projectStats.onHoldProjects / projectStats.totalProjects) * 100);
  };

  // Function to fetch upcoming events
  const fetchUpcomingEvents = async () => {
    try {
      setEventsLoading(true);
      
      // Get today's date
      const today = new Date();
      
      // Get date 30 days from now
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 30);
      
      // Format dates for API
      const startDate = today.toISOString();
      const endDate = futureDate.toISOString();
      
      const response = await apiRequest(`http://localhost:8080/api/events?start_date=${startDate}&end_date=${endDate}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      
      const eventData = await response.json();
      
      // Sort events by start date
      const sortedEvents = eventData.sort((a, b) => 
        new Date(a.start_date) - new Date(b.start_date)
      );
      
      // Limit to 5 upcoming events
      setUpcomingEvents(sortedEvents.slice(0, 5));
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    } finally {
      setEventsLoading(false);
    }
  };
  
  // Handle day click on calendar
  const handleDayClick = (date) => {
    setSelectedDate(date);
    
    // Set the form data with the selected date
    const formattedDate = date.toISOString().split('T')[0];
    setEventFormData({
      ...eventFormData,
      start_date: formattedDate,
      end_date: formattedDate
    });
    
    // Show the event creation modal
    setShowEventModal(true);
  };
  
  // Handle event form input changes
  const handleEventInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventFormData({
      ...eventFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle event form submission
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare the event data
      const eventData = {
        ...eventFormData,
        // If all_day is true, set the time to 00:00:00 for start and 23:59:59 for end
        start_date: eventFormData.all_day 
          ? `${eventFormData.start_date}T00:00:00.000Z` 
          : `${eventFormData.start_date}T${document.getElementById('start_time').value || '00:00'}:00.000Z`,
        end_date: eventFormData.all_day 
          ? `${eventFormData.end_date}T23:59:59.999Z` 
          : `${eventFormData.end_date}T${document.getElementById('end_time').value || '23:59'}:59.999Z`
      };
      
      // Send the request to create the event
      const response = await apiRequest('http://localhost:8080/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to create event");
      }
      
      // Reset form and close modal
      setEventFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        all_day: false,
        color: "#e6c980"
      });
      setShowEventModal(false);
      
      // Refresh the events list
      fetchUpcomingEvents();
      
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };
  
  // Close the event modal
  const closeEventModal = () => {
    setShowEventModal(false);
    setEventFormData({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      all_day: false,
      color: "#e6c980"
    });
  };

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
                      width: `${getTaskCompletionPercentage()}%`,
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {getTaskCompletionPercentage()}% complete
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
              <div className="stat-number">{projectStats.activeProjects}</div>
              <div className="stat-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill blue"
                    style={{
                      width: `${getActiveProjectsPercentage()}%`,
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {getActiveProjectsPercentage()}% of total
                </span>
              </div>
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
            <h3>On Hold Projects</h3>
            <div className="stat-data">
              <div className="stat-number">{projectStats.onHoldProjects}</div>
              <div className="stat-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill red"
                    style={{
                      width: `${getOnHoldProjectsPercentage()}%`,
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {getOnHoldProjectsPercentage()}% of total
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-column main">
          <div className="dashboard-section calendar-section">
            <div className="section-header">
              <h2>Calendar</h2>
              <button className="view-all-button" onClick={handleViewFullCalendar}>View All</button>
            </div>
            <Calendar onDayClick={handleDayClick} />
          </div>
        </div>

        <div className="dashboard-column side">
          <div className="dashboard-section activity-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
              <button className="view-all-button" onClick={handleViewAllActivities}>View All</button>
            </div>
            <div className="activity-list">
              {activitiesLoading ? (
                <div className="loading-activities">Loading activities...</div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div className="activity-item" key={activity.id || index}>
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
                      {activity.type === "delete" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      )}
                    </div>
                    <div className="activity-content">
                      <p>{activity.text}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-activities">No recent activities</div>
              )}
            </div>
          </div>

          <div className="dashboard-section quick-actions-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <button className="action-button primary" onClick={() => navigate("/tasks", { state: { openTaskForm: true } })}>
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
              <button className="action-button secondary" onClick={() => navigate("/projects", { state: { openProjectForm: true } })}>
              <svg xmlns="http://www.w3.org/2000/svg"  width="16"
                  height="16"
                fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
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

          <div className="dashboard-section upcoming-events-section">
            <div className="section-header">
              <h2>Upcoming Events</h2>
            </div>
            <div className="upcoming-events">
              {eventsLoading ? (
                <div className="loading-events">Loading events...</div>
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="event-card" style={{ borderLeft: `4px solid ${event.color || '#e6c980'}` }}>
                    <div className="event-date">
                      {new Date(event.start_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="event-details">
                      <h3>{event.title}</h3>
                      <p>{event.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-events">No upcoming events</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for displaying all activities */}
      {showAllActivities && (
        <div className="activity-modal-overlay" onClick={() => setShowAllActivities(false)}>
          <div className="activity-modal" onClick={(e) => e.stopPropagation()}>
            <div className="activity-modal-header">
              <h2>All Activities</h2>
              <button className="close-modal-button" onClick={() => setShowAllActivities(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="activity-modal-content">
              {activitiesLoading ? (
                <div className="loading-activities">Loading activities...</div>
              ) : allActivities.length > 0 ? (
                <div className="all-activities-list">
                  {allActivities.map((activity, index) => (
                    <div className="activity-item" key={activity.id || index}>
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
                        {activity.type === "delete" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        )}
                      </div>
                      <div className="activity-content">
                        <p>{activity.text}</p>
                        <div className="activity-details">
                          <span className="activity-time">{activity.time}</span>
                          <span className="activity-date">{activity.timestamp.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-activities">No activities found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for displaying full calendar */}
      {showFullCalendar && (
        <div className="calendar-modal-overlay" onClick={() => setShowFullCalendar(false)}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h2>Calendar</h2>
              <button className="close-modal-button" onClick={() => setShowFullCalendar(false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="calendar-modal-content">
              <Calendar />
            </div>
          </div>
        </div>
      )}

      {/* Modal for creating events */}
      {showEventModal && (
        <div className="event-modal-overlay" onClick={closeEventModal}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-modal-header">
              <h2>Create Event</h2>
              <button className="close-modal-button" onClick={closeEventModal}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="event-modal-content">
              <form onSubmit={handleEventSubmit}>
                <div className="form-group">
                  <label>Title:</label>
                  <input type="text" name="title" value={eventFormData.title} onChange={handleEventInputChange} />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea name="description" value={eventFormData.description} onChange={handleEventInputChange} />
                </div>
                <div className="form-group">
                  <label>Start Date:</label>
                  <input type="date" name="start_date" value={eventFormData.start_date} onChange={handleEventInputChange} />
                </div>
                <div className="form-group">
                  <label>End Date:</label>
                  <input type="date" name="end_date" value={eventFormData.end_date} onChange={handleEventInputChange} />
                </div>
                <div className="form-group">
                  <label>All Day:</label>
                  <input type="checkbox" name="all_day" checked={eventFormData.all_day} onChange={handleEventInputChange} />
                </div>
                <div className="form-group">
                  <label>Start Time:</label>
                  <input type="time" id="start_time" />
                </div>
                <div className="form-group">
                  <label>End Time:</label>
                  <input type="time" id="end_time" />
                </div>
                <button type="submit">Create Event</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
