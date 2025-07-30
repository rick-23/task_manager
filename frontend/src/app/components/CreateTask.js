'use client'

import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { createTask } from "../store/slicer";
import { validate } from "../utils/validationUtils";
import '../TaskForm.css';
import { useTasks } from "../hooks/useTasks";
import LoadingSpinner from "./Loading";

export default function CreateTask({ taskToEdit, onCancelEdit }) {
    const { addTask, editTask, isLoading } = useTasks();
    const router = useRouter();

    const [errors, setErrors] = useState({ title: '', description: '' });
    const [task, setTask] = useState({
        title: '',
        description: '',
        date: null
    });

    useEffect(() => {
        if (taskToEdit != null) {
            setTask({
                title: taskToEdit.title || "",
                description: taskToEdit.description || "",
                date: taskToEdit.date || ""
            });
            setErrors({
                title: '',
                description: ''
            });
        } else {
            setTask({
                title: '',
                description: '',
                date: null
            });
            setErrors({
                title: '',
                description: ''
            });
        }
    }, [taskToEdit]);

    const isFormValid = useMemo(() => {
        const fieldsValid =
            task.title.trim() !== '' &&
            task.description.trim() !== '' &&
            !errors.title &&
            !errors.description;

        // If editing, require at least one field to be changed
        if (taskToEdit) {
            const changed =
                task.title.trim() !== (taskToEdit.title || '').trim() ||
                task.description.trim() !== (taskToEdit.description || '').trim() ||
                (task.date || '') !== (taskToEdit.date || '');
            return fieldsValid && changed;
        }
        return fieldsValid;
    }, [task, errors]);

    const inputChange = (e) => {
        const { name, value } = e.target;
        let newErrors = validate(name, value);
        setTask({ ...task, [name]: value });
        setErrors({ ...errors, ...newErrors });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const normalizedTask = {
            ...task,
            date: task.date === "" ? null : task.date
        };
        if (taskToEdit != null) {
            editTask.mutate({ ...normalizedTask, id: taskToEdit.id });
            router.push('/');
        } else {
            addTask.mutate(task);
            router.push('/');
        }
        setTask({
            title: '',
            description: '',
            date: null
        });
        setErrors({
            title: '',
            description: ''
        });
    }

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="task-form-container">
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Task title:
                    </label>
                    <input name="title" type="text" value={task.title} onChange={inputChange} />
                    {errors.title && <span className="error">{errors.title}</span>}
                </div>
                <div>
                    <label>
                        Task description:
                    </label>
                    <textarea name="description" value={task.description} onChange={inputChange} />
                    {errors.description && <span className="error">{errors.description}</span>}
                </div>
                <div>
                    <label>
                        Task date:
                    </label>
                    <input name="date" type="date" value={task.date || ''} onChange={inputChange} />
                </div>

                <button type="submit" disabled={!isFormValid}>
                    {taskToEdit != null ? "Update Task" : "Create Task"}
                </button>

                {taskToEdit != null && (
                    <button type="button" onClick={onCancelEdit} style={{ marginLeft: "1rem" }}>
                        Cancel Edit
                    </button>
                )}
            </form>
        </div>
    );
}