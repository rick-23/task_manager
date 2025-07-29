'use client'
import React, { useMemo } from "react";
import { handleDragStart } from '../utils/dndUtils';
import { useSelector } from "react-redux";
import LoadingSpinner from "./Loading";

function UnassignedTasks({ search }) {
    const { tasks, loading } = useSelector(state => state.tasks);
    const unTasks = useMemo(() => tasks.filter(t => t.date === null), [tasks]);
    const filteredTasks = useMemo(() => {
        if (!search) return unTasks;
        return unTasks.filter(task =>
            task.title.toLowerCase().includes(search.toLowerCase())
        );
    }, [unTasks, search]);

    if (loading) return <LoadingSpinner />;
    return <div className="unassigned-panel">
        <h3>UnassignedTasks</h3>
        {
            filteredTasks.length === 0 ? !search ? (<p>No unassigned tasks</p>) : (<p>No tasks found for "{search}"</p>)
                : (
                    filteredTasks.map(task => (
                        <div draggable key={task.id} onDragStart={(e) => handleDragStart(e, task.id)}>
                            <p key={task.id}>{task.title}</p>
                        </div>
                    ))
                )
        }
    </div>
}

export default UnassignedTasks;