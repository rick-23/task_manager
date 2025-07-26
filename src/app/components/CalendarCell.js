'use client';
import React, { useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import TaskItem from './TaskItem';
import { handleDragOver, handleDrop } from '../utils/dndUtils';
import { moveTask } from '../store/slicer';

const CalendarCell = ({ day, search }) => {

  const dispatch = useDispatch();

  const allTasks = useSelector(state => state.tasks.tasks, shallowEqual);

  // Memoize tasks for this day
  const dayTasks = useMemo(
    () => allTasks.filter(task => task.date === day.date),
    [allTasks, day.date]
  );

  // Memoize filtered tasks by search
  const filteredTasks = useMemo(() => {
    if (!search) return dayTasks;
    return dayTasks.filter(task =>
      task.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [dayTasks, search]);


  return (
    <div className={`calendar-cell ${!day.isCurrentMonth ? 'faded' : ''}`}
      onDragOver={handleDragOver}
      onDrop={e => handleDrop(e, day.date, (id, newDate) => {
        dispatch(moveTask({ taskId: id, newDate }));
      })}
    >
      <div className="cell-date">{day.display}</div>
      {filteredTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};
export default CalendarCell;