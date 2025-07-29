'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import '../TaskForm.css';

import LoadingSpinner from "./Loading";


export default function TaskInfo() {
    const params = useParams();
    const { loading } = useSelector(state => state.tasks);
    const selectedTask = useSelector(
        ({ tasks }) => tasks.tasks.find(task => task.id === params.id),
        shallowEqual
    );

    if (!selectedTask) {
        return <div>Task not found</div>;
    }
    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="task-form-container">
            <h2>{selectedTask.title}</h2>
            <div>
                <p>{selectedTask.description}</p>
                <p>Date: {selectedTask.date ? new Date(selectedTask.date).toLocaleDateString() : 'Unassigned'}</p>
            </div>
        </div>
    );
}