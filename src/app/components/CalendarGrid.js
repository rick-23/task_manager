'use client';
import React, { useState, useMemo } from 'react';
import { generateMonthGrid } from '../utils/dateUtils';
import { shallowEqual, useSelector } from 'react-redux';
import CalendarCell from './CalendarCell';
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarGrid = ({ search }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // July (0-indexed)
  const days = generateMonthGrid(year, month);
  const goToPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }

  };

  const allTasks = useSelector(state => state.tasks.tasks, shallowEqual);

  const anyMatch = useMemo(() =>
    days.some(day =>
      allTasks.some(task =>
        task.date === day.date &&
        (!search || task.title.toLowerCase().includes(search.toLowerCase()))
      )
    ), [days, allTasks, search]);

  return (
    <div style={{ flex: 1 }}>
      <div className="calendar-header">
        <button onClick={goToPrev}>&larr;</button>
        <h2>{monthNames[month]} {year}</h2>
        <button onClick={goToNext}>&rarr;</button>
      </div>
      <div className="calendar-grid">
        {!anyMatch && search ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888' }}>
            No tasks found for "{search}"
          </div>
        ) : (
          <>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="day-label">{day}</div>
            ))}
            {days.map((day, index) => (
              <CalendarCell key={index} day={day} search={search} />
            ))}
          </>
        )}
      </div>
    </div>

  );

};

export default CalendarGrid;
