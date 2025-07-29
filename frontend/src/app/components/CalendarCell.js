'use client';
import React, { useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import TaskItem from './TaskItem';
import { handleDragOver, handleDrop } from '../utils/dndUtils';
import { moveTask } from '../store/slicer';
import { useTasks } from '../hooks/useTasks';

const CalendarCell = ({ day, search }) => {

  const dispatch = useDispatch();

  const allTasks = useSelector(state => state.tasks.tasks, shallowEqual);
  const { editTask, deleteTask } = useTasks();


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

  const onDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      const task = allTasks.find(t => t.id === taskId);
      if (task) {
        dispatch(moveTask({ id: taskId, date: day.date }));
        editTask.mutate({ ...task, date: day.date });
      }
      // If using an async thunk or mutation, await or handle promise
    }
  };


  return (
    <div className={`calendar-cell ${!day.isCurrentMonth ? 'faded' : ''}`}
      onDragOver={handleDragOver}
      onDrop={onDrop}
    >
      <div className="cell-date">{day.display}</div>
      {filteredTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};
export default CalendarCell;