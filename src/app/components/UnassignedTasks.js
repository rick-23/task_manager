'use client'
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { handleDragStart } from '../utils/dndUtils';

function UnassignedTasks({ search }) {
    const allTasks = useSelector((state) => state.tasks.tasks);
    const unTasks = useMemo(
        () => allTasks.filter(t => t.date === null),
        [allTasks]
    );
    const filteredTasks = useMemo(() => {
        if (!search) return unTasks;
        return unTasks.filter(task =>
            task.title.toLowerCase().includes(search.toLowerCase())
        );
    }, [unTasks, search]);

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