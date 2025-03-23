import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { apiRequest } from "../../services/apiService";
import "./Calendar.css";

const Calendar = ({ onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch events when the current month changes
  useEffect(() => {
    fetchEvents();
  }, [currentDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Calculate the first and last day of the current month for filtering
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Format dates for API query
      const startDate = firstDay.toISOString();
      const endDate = lastDay.toISOString();
      
      const response = await apiRequest(`http://localhost:8080/api/events?start_date=${startDate}&end_date=${endDate}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      
      const eventData = await response.json();
      setEvents(eventData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Check if a date has events
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = event.end_date ? new Date(event.end_date) : new Date(event.start_date);
      
      // Check if the date falls within the event's date range
      return (
        date.getDate() === eventStart.getDate() && 
        date.getMonth() === eventStart.getMonth() && 
        date.getFullYear() === eventStart.getFullYear()
      ) || (
        date.getDate() === eventEnd.getDate() && 
        date.getMonth() === eventEnd.getMonth() && 
        date.getFullYear() === eventEnd.getFullYear()
      ) || (
        date >= eventStart && date <= eventEnd
      );
    });
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    
    // If onDayClick prop is provided, call it with the selected date
    if (onDayClick) {
      onDayClick(date);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      
      // Get events for this date
      const dateEvents = getEventsForDate(date);
      const hasEvents = dateEvents.length > 0;
      
      const dayClass = `calendar-day ${isToday(date) ? "today" : ""} ${
        isSelected(date) ? "selected" : ""
      } ${hasEvents ? "has-events" : ""}`;

      days.push(
        <div
          key={day}
          className={dayClass}
          onClick={() => handleDayClick(date)}
        >
          <span className="day-number">{day}</span>
          {/* Removing the event indicator dots */}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="calendar-nav" onClick={prevMonth}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h2>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button className="calendar-nav" onClick={nextMonth}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      <div className="calendar-weekdays">
        {weekDays.map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-days">{renderCalendarDays()}</div>
      {loading && <div className="calendar-loading">Loading events...</div>}
    </div>
  );
};

// Add prop types validation
Calendar.propTypes = {
  onDayClick: PropTypes.func
};

export default Calendar;