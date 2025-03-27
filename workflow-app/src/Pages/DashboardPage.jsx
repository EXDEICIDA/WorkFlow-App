import { useState, useEffect, useRef } from "react";
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
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]); 
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showAllEvents, setShowAllEvents] = useState(false); 
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    all_day: false,
    start_time: "09:00",
    end_time: "17:00",
    color: "#e6c980"
  });

  // Date picker related states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [currentStartMonth, setCurrentStartMonth] = useState(new Date());
  const [currentEndMonth, setCurrentEndMonth] = useState(new Date());
  const [showStartYearSelector, setShowStartYearSelector] = useState(false);
  const [showEndYearSelector, setShowEndYearSelector] = useState(false);
  const startDatePickerRef = useRef(null);
  const endDatePickerRef = useRef(null);
  const startTriggerRef = useRef(null);
  const endTriggerRef = useRef(null);

  const [showConfirmClearEvents, setShowConfirmClearEvents] = useState(false);
  const [showConfirmClearActivities, setShowConfirmClearActivities] = useState(false);

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
        // Special case for script creation
        if (activity.activity_type === 'create' && activity.related_item_type === 'script') {
          type = 'script';
        } else {
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
  
  // Function to fetch all events
  const fetchAllEvents = async () => {
    try {
      setEventsLoading(true);
      
      // Get all events without date filtering
      const response = await apiRequest(`http://localhost:8080/api/events`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      
      const eventData = await response.json();
      
      // Sort events by start date
      const sortedEvents = eventData.sort((a, b) => 
        new Date(a.start_date) - new Date(b.start_date)
      );
      
      setAllEvents(sortedEvents);
    } catch (error) {
      console.error("Error fetching all events:", error);
    } finally {
      setEventsLoading(false);
    }
  };
  
  // Handle opening the "View All" events modal
  const handleViewAllEvents = () => {
    fetchAllEvents();
    setShowAllEvents(true);
  };

  // Function to delete an event
  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await apiRequest(`http://localhost:8080/api/events/${eventId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete event");
      }
      
      // Refresh the events list after deletion
      fetchUpcomingEvents();
      
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleClearAllEvents = async () => {
    try {
      const response = await apiRequest('http://localhost:8080/api/events/all', {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error("Failed to clear all events");
      }
      
      // Refresh the events list after clearing
      fetchUpcomingEvents();
      fetchAllEvents();
      setShowAllEvents(false);
      setShowConfirmClearEvents(false);
      
      // Add an activity for clearing all events
      await apiRequest('http://localhost:8080/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'Cleared all events',
          details: 'User cleared all events from the calendar'
        })
      });
      
    } catch (error) {
      console.error("Error clearing all events:", error);
    }
  };

  const handleClearAllActivities = async () => {
    try {
      const response = await apiRequest('http://localhost:8080/api/activities/all', {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error("Failed to clear all activities");
      }
      
      // Refresh the activities list after clearing
      fetchActivities();
      fetchAllActivities();
      setShowAllActivities(false);
      setShowConfirmClearActivities(false);
      
    } catch (error) {
      console.error("Error clearing all activities:", error);
    }
  };

  // Handle day click on calendar
  const handleDayClick = (date) => {
    // Set the start and end date in the event form data
    const formattedDate = date.toISOString().split('T')[0];
    setEventFormData({
      ...eventFormData,
      start_date: formattedDate,
      end_date: formattedDate
    });
    setCurrentStartMonth(date);
    setCurrentEndMonth(date);
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

  // Date picker handlers
  useEffect(() => {
    // Close date pickers when clicking outside
    function handleClickOutside(event) {
      if (startDatePickerRef.current && !startDatePickerRef.current.contains(event.target) && 
          !startTriggerRef.current.contains(event.target)) {
        setShowStartDatePicker(false);
        setShowStartYearSelector(false);
      }
      
      if (endDatePickerRef.current && !endDatePickerRef.current.contains(event.target) && 
          !endTriggerRef.current.contains(event.target)) {
        setShowEndDatePicker(false);
        setShowEndYearSelector(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleStartDatePicker = () => {
    setShowStartDatePicker(!showStartDatePicker);
    setShowStartYearSelector(false);
    setShowEndDatePicker(false);
    setShowEndYearSelector(false);
  };

  const toggleEndDatePicker = () => {
    setShowEndDatePicker(!showEndDatePicker);
    setShowEndYearSelector(false);
    setShowStartDatePicker(false);
    setShowStartYearSelector(false);
  };

  const handleStartDateSelect = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setEventFormData((prev) => ({
      ...prev,
      start_date: formattedDate,
    }));
    setShowStartDatePicker(false);
    setShowStartYearSelector(false);
  };

  const handleEndDateSelect = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setEventFormData((prev) => ({
      ...prev,
      end_date: formattedDate,
    }));
    setShowEndDatePicker(false);
    setShowEndYearSelector(false);
  };

  const handlePrevStartMonth = () => {
    setCurrentStartMonth(new Date(currentStartMonth.getFullYear(), currentStartMonth.getMonth() - 1, 1));
  };

  const handleNextStartMonth = () => {
    setCurrentStartMonth(new Date(currentStartMonth.getFullYear(), currentStartMonth.getMonth() + 1, 1));
  };

  const handlePrevEndMonth = () => {
    setCurrentEndMonth(new Date(currentEndMonth.getFullYear(), currentEndMonth.getMonth() - 1, 1));
  };

  const handleNextEndMonth = () => {
    setCurrentEndMonth(new Date(currentEndMonth.getFullYear(), currentEndMonth.getMonth() + 1, 1));
  };

  const handleStartYearClick = () => {
    setShowStartYearSelector(!showStartYearSelector);
  };

  const handleEndYearClick = () => {
    setShowEndYearSelector(!showEndYearSelector);
  };

  const handleStartYearSelect = (year) => {
    setCurrentStartMonth(new Date(year, currentStartMonth.getMonth(), 1));
    setShowStartYearSelector(false);
  };

  const handleEndYearSelect = (year) => {
    setCurrentEndMonth(new Date(year, currentEndMonth.getMonth(), 1));
    setShowEndYearSelector(false);
  };

  const handleStartTodayClick = () => {
    const today = new Date();
    setCurrentStartMonth(today);
    handleStartDateSelect(today);
  };

  const handleEndTodayClick = () => {
    const today = new Date();
    setCurrentEndMonth(today);
    handleEndDateSelect(today);
  };

  const handleStartCloseClick = () => {
    setShowStartDatePicker(false);
    setShowStartYearSelector(false);
  };

  const handleEndCloseClick = () => {
    setShowEndDatePicker(false);
    setShowEndYearSelector(false);
  };

  const renderStartYearSelector = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Generate a range of years (current year ± 10 years)
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push(year);
    }
    
    return (
      <div className="year-selector">
        <div className="year-selector-grid">
          {years.map((year) => (
            <div 
              key={year} 
              className={`year-item ${year === currentStartMonth.getFullYear() ? 'selected' : ''}`}
              onClick={() => handleStartYearSelect(year)}
            >
              {year}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEndYearSelector = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Generate a range of years (current year ± 10 years)
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push(year);
    }
    
    return (
      <div className="year-selector">
        <div className="year-selector-grid">
          {years.map((year) => (
            <div 
              key={year} 
              className={`year-item ${year === currentEndMonth.getFullYear() ? 'selected' : ''}`}
              onClick={() => handleEndYearSelect(year)}
            >
              {year}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStartCalendar = () => {
    const year = currentStartMonth.getFullYear();
    const month = currentStartMonth.getMonth();
    
    // Get first day of month and last day of month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Create array of day numbers for the month
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Create array of weeks
    const weeks = [];
    let days = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
      
      // Start new week if we reach Sunday or end of month
      if (days.length === 7 || day === daysInMonth) {
        // Fill in remaining days of last week if needed
        while (days.length < 7) {
          days.push(null);
        }
        weeks.push(days);
        days = [];
      }
    }
    
    const selectedDate = eventFormData.start_date ? new Date(eventFormData.start_date) : null;
    const today = new Date();
    
    return (
      <div className="date-picker-calendar">
        <div className="date-picker-header">
          <button type="button" className="month-nav-btn" onClick={handlePrevStartMonth}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3L5 7.5L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="current-month-year" onClick={handleStartYearClick}>
            <span>{currentStartMonth.toLocaleString('default', { month: 'long' })}</span>
            <span className="year-display">{currentStartMonth.getFullYear()}</span>
          </div>
          <button type="button" className="month-nav-btn" onClick={handleNextStartMonth}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 3L10 7.5L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {showStartYearSelector ? (
          renderStartYearSelector()
        ) : (
          <>
            <div className="calendar-grid">
              <div className="weekday-header">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>
              
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="week-row">
                  {week.map((day, dayIndex) => {
                    if (day === null) {
                      return <div key={dayIndex} className="day empty"></div>;
                    }
                    
                    const date = new Date(year, month, day);
                    const isSelected = selectedDate && 
                      date.getDate() === selectedDate.getDate() && 
                      date.getMonth() === selectedDate.getMonth() && 
                      date.getFullYear() === selectedDate.getFullYear();
                    
                    const isToday = 
                      date.getDate() === today.getDate() && 
                      date.getMonth() === today.getMonth() && 
                      date.getFullYear() === today.getFullYear();
                    
                    return (
                      <div 
                        key={dayIndex} 
                        className={`day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                        onClick={() => handleStartDateSelect(date)}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
            <div className="date-picker-footer">
              <button type="button" className="today-btn" onClick={handleStartTodayClick}>
                Today
              </button>
              <button type="button" className="close-btn" onClick={handleStartCloseClick}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderEndCalendar = () => {
    const year = currentEndMonth.getFullYear();
    const month = currentEndMonth.getMonth();
    
    // Get first day of month and last day of month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Create array of day numbers for the month
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Create array of weeks
    const weeks = [];
    let days = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
      
      // Start new week if we reach Sunday or end of month
      if (days.length === 7 || day === daysInMonth) {
        // Fill in remaining days of last week if needed
        while (days.length < 7) {
          days.push(null);
        }
        weeks.push(days);
        days = [];
      }
    }
    
    const selectedDate = eventFormData.end_date ? new Date(eventFormData.end_date) : null;
    const today = new Date();
    
    return (
      <div className="date-picker-calendar">
        <div className="date-picker-header">
          <button type="button" className="month-nav-btn" onClick={handlePrevEndMonth}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3L5 7.5L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="current-month-year" onClick={handleEndYearClick}>
            <span>{currentEndMonth.toLocaleString('default', { month: 'long' })}</span>
            <span className="year-display">{currentEndMonth.getFullYear()}</span>
          </div>
          <button type="button" className="month-nav-btn" onClick={handleNextEndMonth}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 3L10 7.5L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {showEndYearSelector ? (
          renderEndYearSelector()
        ) : (
          <>
            <div className="calendar-grid">
              <div className="weekday-header">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>
              
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="week-row">
                  {week.map((day, dayIndex) => {
                    if (day === null) {
                      return <div key={dayIndex} className="day empty"></div>;
                    }
                    
                    const date = new Date(year, month, day);
                    const isSelected = selectedDate && 
                      date.getDate() === selectedDate.getDate() && 
                      date.getMonth() === selectedDate.getMonth() && 
                      date.getFullYear() === selectedDate.getFullYear();
                    
                    const isToday = 
                      date.getDate() === today.getDate() && 
                      date.getMonth() === today.getMonth() && 
                      date.getFullYear() === today.getFullYear();
                    
                    return (
                      <div 
                        key={dayIndex} 
                        className={`day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                        onClick={() => handleEndDateSelect(date)}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
            <div className="date-picker-footer">
              <button type="button" className="today-btn" onClick={handleEndTodayClick}>
                Today
              </button>
              <button type="button" className="close-btn" onClick={handleEndCloseClick}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
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
          : `${eventFormData.start_date}T${eventFormData.start_time}:00.000Z`,
        end_date: eventFormData.all_day 
          ? `${eventFormData.end_date}T23:59:59.999Z` 
          : `${eventFormData.end_date}T${eventFormData.end_time}:59.999Z`
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
        start_time: "09:00",
        end_time: "17:00",
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
      start_time: "09:00",
      end_time: "17:00",
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
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 01 2-2h11" />
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
              <div className="section-header-actions">
                <button className="view-all-button" onClick={handleViewAllActivities}>View All</button>
              </div>
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
                      {activity.type === "script" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
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
              <button 
                className="action-button tertiary"
                onClick={() => navigate('/canvas')}
              >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
</svg>

                Canvas Template
              </button>
            </div>
          </div>

          <div className="dashboard-section upcoming-events-section">
            <div className="section-header">
              <h2>Upcoming Events</h2>
              <button className="view-all-button" onClick={handleViewAllEvents}>View All</button>
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
                    <button 
                      className="delete-event-button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      aria-label="Delete event"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                      </svg>
                    </button>
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
              <div className="modal-header-actions">
                <button 
                  className="clear-all-activities-button" 
                  onClick={() => setShowConfirmClearActivities(true)}
                  aria-label="Clear all activities"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor" 
                    className="trash-icon"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" 
                    />
                  </svg>
                  Clear All Activities
                </button>
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
                        {activity.type === "script" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
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
          <div className="event-modal-redesigned" onClick={(e) => e.stopPropagation()}>
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
              <form onSubmit={handleEventSubmit} className="event-form-redesigned">
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={eventFormData.title} 
                    onChange={handleEventInputChange} 
                    placeholder="Event title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    name="description" 
                    value={eventFormData.description} 
                    onChange={handleEventInputChange}
                    placeholder="Event description"
                    rows="3"
                  />
                </div>
                
                <div className="date-time-container">
                  <div className="checkbox-group">
                    <label>
                      <input 
                        type="checkbox" 
                        name="all_day" 
                        checked={eventFormData.all_day} 
                        onChange={handleEventInputChange}
                      />
                      All Day Event
                    </label>
                  </div>
                  
                  <div className="date-time-grid">
                    <div className="date-time-row">
                      <div className="date-time-label">Start</div>
                      <div className="date-picker-container">
                        <button 
                          type="button" 
                          className="date-picker-trigger" 
                          onClick={toggleStartDatePicker}
                          ref={startTriggerRef}
                        >
                          {eventFormData.start_date ? formatDisplayDate(eventFormData.start_date) : "Select date"}
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.5 1V3.5M10.5 1V3.5M1 7.5H14M2.5 3H12.5C13.0523 3 13.5 3.44772 13.5 4V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H2.5C1.94772 13.5 1.5 13.0523 1.5 12.5V4C1.5 3.44772 1.94772 3 2.5 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        
                        {showStartDatePicker && (
                          <div className="date-picker-wrapper" ref={startDatePickerRef}>
                            {renderStartCalendar()}
                          </div>
                        )}
                      </div>
                      {!eventFormData.all_day && (
                        <div className="time-input">
                          <input 
                            type="time" 
                            id="start_time" 
                            name="start_time"
                            value={eventFormData.start_time || "09:00"}
                            onChange={handleEventInputChange}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="date-time-row">
                      <div className="date-time-label">End</div>
                      <div className="date-picker-container">
                        <button 
                          type="button" 
                          className="date-picker-trigger" 
                          onClick={toggleEndDatePicker}
                          ref={endTriggerRef}
                        >
                          {eventFormData.end_date ? formatDisplayDate(eventFormData.end_date) : "Select date"}
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.5 1V3.5M10.5 1V3.5M1 7.5H14M2.5 3H12.5C13.0523 3 13.5 3.44772 13.5 4V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H2.5C1.94772 13.5 1.5 13.0523 1.5 12.5V4C1.5 3.44772 1.94772 3 2.5 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        
                        {showEndDatePicker && (
                          <div className="date-picker-wrapper" ref={endDatePickerRef}>
                            {renderEndCalendar()}
                          </div>
                        )}
                      </div>
                      {!eventFormData.all_day && (
                        <div className="time-input">
                          <input 
                            type="time" 
                            id="end_time" 
                            name="end_time"
                            value={eventFormData.end_time || "17:00"}
                            onChange={handleEventInputChange}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={closeEventModal} className="modal-button cancel-button">Cancel</button>
                  <button type="submit" className="modal-button create-button">Create Event</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal for showing all events */}
      {showAllEvents && (
        <div className="all-events-modal-overlay" onClick={() => setShowAllEvents(false)}>
          <div className="all-events-modal" onClick={(e) => e.stopPropagation()}>
            <div className="all-events-modal-header">
              <h2>All Events</h2>
              <div className="modal-actions">
                <button 
                  className="clear-all-events-button" 
                  onClick={() => setShowConfirmClearEvents(true)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor" 
                    className="trash-icon"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" 
                    />
                  </svg>
                  Clear All
                </button>
                <button className="close-modal-button" onClick={() => setShowAllEvents(false)}>
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
            </div>
            <div className="all-events-modal-content">
              {eventsLoading ? (
                <div className="loading-events">Loading events...</div>
              ) : allEvents.length > 0 ? (
                allEvents.map((event) => (
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
                    <button 
                      className="delete-event-button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      aria-label="Delete event"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-events">No events found</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modal for confirmation */}
      {showConfirmClearEvents && (
        <div className="confirm-modal-overlay" onClick={() => setShowConfirmClearEvents(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h2>Confirm Clear All Events</h2>
            </div>
            <div className="confirm-modal-content">
              <p>Are you sure you want to clear all events?</p>
              <div className="confirm-modal-actions">
                <button 
                  className="confirm-modal-button confirm-button" 
                  onClick={handleClearAllEvents}
                >
                  Yes, Clear All
                </button>
                <button 
                  className="confirm-modal-button cancel-button" 
                  onClick={() => setShowConfirmClearEvents(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal for confirmation */}
      {showConfirmClearActivities && (
        <div className="confirm-modal-overlay" onClick={() => setShowConfirmClearActivities(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h2>Confirm Clear All Activities</h2>
            </div>
            <div className="confirm-modal-content">
              <p>Are you sure you want to clear all activities?</p>
              <div className="confirm-modal-actions">
                <button 
                  className="confirm-modal-button confirm-button" 
                  onClick={handleClearAllActivities}
                >
                  Yes, Clear All
                </button>
                <button 
                  className="confirm-modal-button cancel-button" 
                  onClick={() => setShowConfirmClearActivities(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
