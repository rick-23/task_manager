'use client';

import { useParams } from "next/navigation";
import { shallowEqual, useSelector } from "react-redux";
import '../TaskForm.css';

export default function TaskInfo() {
    let params = useParams();
    console.log(params);
    const selectedTask = useSelector(({ tasks }) => tasks.tasks.find(task => task.id === parseInt(params.id)), shallowEqual);
    console.log(selectedTask);

    if (!selectedTask) {
        return <div>Task not found</div>;
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