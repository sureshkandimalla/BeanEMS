import React, { useState } from "react";
import "./MonthlyTimesheetModal.css";

function MonthlyTimesheetDialog({ open, onClose, onSave, initialData }) {
  const [hoursData, setHoursData] = useState(initialData || Array(30).fill(0));

  const handleInputChange = (index, value) => {
    const updatedHours = [...hoursData];
    updatedHours[index] = value;
    setHoursData(updatedHours);
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(currentYear, currentMonth, i + 1);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  });

  const handleSave = () => {
    onSave(hoursData);
    onClose();
  };

  return (
    <div className="dialog">
      <div className="dialog-content">
        <h3>Timesheet</h3>
        <div className="timesheet">
          {dates.map((date, index) => (
            <div className="cell" key={date}>
              <div className="header">{date}</div>
              <input
                type="number"
                min="0"
                max="24"
                placeholder="Hours"
                value={hoursData[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="hours-input"
              />
            </div>
          ))}
        </div>
        <div className="dialog-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default MonthlyTimesheetDialog;
