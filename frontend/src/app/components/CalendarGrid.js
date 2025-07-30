'use client';
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { generateMonthGrid } from '../utils/dateUtils';
import CalendarCell from './CalendarCell';
import { MONTH_NAMES, WEEK_DAYS } from '../utils/constants';
import LoadingSpinner from './Loading';

const CalendarGrid = ({ search }) => {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // July (0-indexed)

  const days = generateMonthGrid(year, month);

  const { tasks, loading } = useSelector(state => state.tasks);

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

  const anyMatch = useMemo(() =>
    days.some(day =>
      tasks?.some(task =>
        task.date === day.date &&
        (!search || task.title.toLowerCase().includes(search.toLowerCase()))
      )
    ), [days, tasks, search]);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ flex: 1 }}>
      <div className="calendar-header">
        <button onClick={goToPrev}>&larr;</button>
        <h2>{MONTH_NAMES[month]} {year}</h2>
        <button onClick={goToNext}>&rarr;</button>
      </div>
      <div className="calendar-grid">
        {!anyMatch && search ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888' }}>
            No tasks found for "{search}"
          </div>
        ) : (
          <>
            {WEEK_DAYS.map((day) => (
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
