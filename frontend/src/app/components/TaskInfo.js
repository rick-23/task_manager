'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import '../TaskForm.css';
import CreateTask from "./CreateTask";
import { useTasks } from "../hooks/useTasks";
import LoadingSpinner from "./Loading";


export default function TaskInfo() {
    const params = useParams();
    const router = useRouter();
    const { deleteTask } = useTasks();
    const { loading } = useSelector(state => state.tasks);
    const selectedTask = useSelector(
        ({ tasks }) => tasks.tasks.find(task => task.id === params.id),
        shallowEqual
    );

    const [isEditing, setIsEditing] = useState(false);

    if (!selectedTask) {
        return <div>Task not found</div>;
    }
    if (loading) {
        return <LoadingSpinner />;
    }

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            deleteTask.mutate(selectedTask.id, {
                onSuccess: () => {
                    router.push("/");
                }
            });
        }
    };


    if (isEditing) {
        return (
            <CreateTask
                taskToEdit={selectedTask}
                onCancelEdit={() => setIsEditing(false)}
            />
        );
    }

    return (
        <div className="task-form-container">
            <h2>{selectedTask.title}</h2>
            <div>
                <p>{selectedTask.description}</p>
                <p>Date: {selectedTask.date ? new Date(selectedTask.date).toLocaleDateString() : 'Unassigned'}</p>
            </div>

            <button onClick={() => setIsEditing(true)} style={{ padding: "0.75rem 1.5rem", color: "white", background: "#4f8cff" }}>
                Edit
            </button>
            <button onClick={handleDelete} style={{ marginLeft: "1rem", padding: "0.75rem 1.5rem", color: "white", background: "#e74c3c" }}>
                Delete
            </button>
        </div>
    );
}