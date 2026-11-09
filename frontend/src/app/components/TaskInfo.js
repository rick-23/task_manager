'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import '../TaskForm.css';
import CreateTask from "./CreateTask";
import { useTasks } from "../hooks/useTasks";
import LoadingSpinner from "./Loading";
import { updateTask } from "../store/slicer";
import { reminderLabel } from "../utils/constants";


export default function TaskInfo() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch();
    const { deleteTask, editTask } = useTasks();
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


    const toggleDone = () => {
        const done = !selectedTask.done;
        dispatch(updateTask({ id: selectedTask.id, done }));
        editTask.mutate({ id: selectedTask.id, done }, {
            onSuccess: () => toast.success(done ? "Marked as done" : "Marked as not done"),
            onError: (error) => {
                dispatch(updateTask({ id: selectedTask.id, done: !done }));
                toast.error(`Couldn't update task: ${error.message}`);
            },
        });
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
            <h2>
                {selectedTask.title}
                {selectedTask.done && <span className="done-badge">Done</span>}
            </h2>
            <div>
                <p>{selectedTask.description}</p>
                <p className="task-meta">
                    Date: {selectedTask.date ? new Date(`${selectedTask.date}T00:00`).toLocaleDateString() : 'Unassigned'}
                    {selectedTask.time && ` at ${selectedTask.time}`}
                </p>
                <p className="task-meta">Reminder: {selectedTask.time ? reminderLabel(selectedTask.remindBefore) : 'No reminder'}</p>
            </div>

            <button onClick={toggleDone} style={{ marginRight: "1rem", padding: "0.75rem 1.5rem", color: "white", background: selectedTask.done ? "#888" : "#1e8e3e" }}>
                {selectedTask.done ? "Mark as not done" : "Mark as done"}
            </button>

            <button onClick={() => setIsEditing(true)} style={{ padding: "0.75rem 1.5rem", color: "white", background: "#4f8cff" }}>
                Edit
            </button>
            <button onClick={handleDelete} style={{ marginLeft: "1rem", padding: "0.75rem 1.5rem", color: "white", background: "#e74c3c" }}>
                Delete
            </button>
        </div>
    );
}