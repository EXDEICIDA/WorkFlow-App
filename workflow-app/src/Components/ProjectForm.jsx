import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./ProjectForm.css";

const ProjectForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    status: initialData.status || "Active",
    deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split("T")[0] : "",
  });

  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    formData.deadline ? new Date(formData.deadline) : new Date()
  );
  const [showYearSelector, setShowYearSelector] = useState(false);
  const datePickerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    // Close date picker when clicking outside
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target) && 
          !triggerRef.current.contains(event.target)) {
        setShowDatePicker(false);
        setShowYearSelector(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
    setShowYearSelector(false);
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      deadline: formattedDate,
    }));
    setShowDatePicker(false);
    setShowYearSelector(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleYearClick = () => {
    setShowYearSelector(!showYearSelector);
  };

  const handleYearSelect = (year) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setShowYearSelector(false);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentMonth(today);
    handleDateSelect(today);
  };

  const handleCloseClick = () => {
    setShowDatePicker(false);
    setShowYearSelector(false);
  };

  const renderYearSelector = () => {
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
              className={`year-item ${year === currentMonth.getFullYear() ? 'selected' : ''}`}
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
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
    
    const selectedDate = formData.deadline ? new Date(formData.deadline) : null;
    const today = new Date();
    
    return (
      <div className="date-picker-calendar">
        <div className="date-picker-header">
          <button type="button" className="month-nav-btn" onClick={handlePrevMonth}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3L5 7.5L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="current-month-year" onClick={handleYearClick}>
            <span>{currentMonth.toLocaleString('default', { month: 'long' })}</span>
            <span className="year-display">{currentMonth.getFullYear()}</span>
          </div>
          <button type="button" className="month-nav-btn" onClick={handleNextMonth}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 3L10 7.5L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {showYearSelector ? (
          renderYearSelector()
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
                        onClick={() => handleDateSelect(date)}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
            <div className="date-picker-footer">
              <button type="button" className="today-btn" onClick={handleTodayClick}>
                Today
              </button>
              <button type="button" className="close-btn" onClick={handleCloseClick}>
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

  return (
    <div className="project-form-container">
      <form onSubmit={handleSubmit} className="project-form">
        <h2>{initialData.id ? "Edit Project" : "Create New Project"}</h2>
        
        <div className="form-group">
          <label htmlFor="title">Project Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? "error" : ""}
            placeholder="Enter project title"
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter project description"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="deadline">Deadline</label>
          <div className="date-picker-container">
            <button 
              type="button" 
              className="date-picker-trigger" 
              onClick={toggleDatePicker}
              ref={triggerRef}
            >
              {formData.deadline ? formatDisplayDate(formData.deadline) : "Select date"}
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 1V3.5M10.5 1V3.5M1 7.5H14M2.5 3H12.5C13.0523 3 13.5 3.44772 13.5 4V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H2.5C1.94772 13.5 1.5 13.0523 1.5 12.5V4C1.5 3.44772 1.94772 3 2.5 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {showDatePicker && (
              <div className="date-picker-wrapper" ref={datePickerRef}>
                {renderCalendar()}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-button">
            {initialData.id ? "Update Project" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
};

ProjectForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    deadline: PropTypes.string
  })
};

export default ProjectForm;
