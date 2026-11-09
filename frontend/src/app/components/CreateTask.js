'use client'

import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { validate } from "../utils/validationUtils";
import { REMINDER_OPTIONS } from "../utils/constants";
import '../TaskForm.css';
import { useTasks } from "../hooks/useTasks";
import LoadingSpinner from "./Loading";

const EMPTY_TASK = { title: '', description: '', date: '', time: '', remindBefore: '' };

const toFormState = (task) => ({
    title: task.title || '',
    description: task.description || '',
    date: task.date || '',
    time: task.time || '',
    remindBefore: task.remindBefore === null || task.remindBefore === undefined ? '' : String(task.remindBefore),
});

const toPayload = (task) => ({
    title: task.title,
    description: task.description,
    date: task.date || null,
    time: task.time || null,
    remindBefore: task.date && task.time && task.remindBefore !== '' ? Number(task.remindBefore) : null,
});

export default function CreateTask({ taskToEdit, onCancelEdit }) {
    const { addTask, editTask, isLoading } = useTasks();
    const router = useRouter();

    const [errors, setErrors] = useState({ title: '', description: '' });
    const [task, setTask] = useState(EMPTY_TASK);

    useEffect(() => {
        if (taskToEdit != null) {
            setTask(toFormState(taskToEdit));
            setErrors({
                title: '',
                description: ''
            });
        } else {
            setTask(EMPTY_TASK);
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
            const original = toFormState(taskToEdit);
            const changed = Object.keys(EMPTY_TASK).some(
                key => String(task[key]).trim() !== String(original[key]).trim()
            );
            return fieldsValid && changed;
        }
        return fieldsValid;
    }, [task, errors, taskToEdit]);

    // A reminder needs both a date and a time of day.
    const canRemind = Boolean(task.date && task.time);

    const inputChange = (e) => {
        const { name, value } = e.target;
        let newErrors = validate(name, value);
        const next = { ...task, [name]: value };
        if (!next.date || !next.time) next.remindBefore = '';
        setTask(next);
        setErrors({ ...errors, ...newErrors });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const normalizedTask = toPayload(task);
        if (taskToEdit != null) {
            editTask.mutate({ ...normalizedTask, id: taskToEdit.id }, {
                onSuccess: () => {
                    toast.success("Task updated successfully!");
                },
                onError: (error) => {
                    toast.error(`Error updating task: ${error.message}`);
                }
            });
            router.push('/');
        } else {
            addTask.mutate(normalizedTask, {
                onSuccess: () => {
                    toast.success("Task created successfully!");
                },
                onError: (error) => {
                    toast.error(`Error creating task: ${error.message}`);
                }
            });
            router.push('/');
        }
        setTask(EMPTY_TASK);
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
                    <label htmlFor="task-title">
                        Task title:
                    </label>
                    <input name="title" id="task-title" type="text" value={task.title} onChange={inputChange} />
                    {errors.title && <span className="error">{errors.title}</span>}
                </div>
                <div>
                    <label htmlFor="task-description">
                        Task description:
                    </label>
                    <textarea name="description" id="task-description" value={task.description} onChange={inputChange} />
                    {errors.description && <span className="error">{errors.description}</span>}
                </div>
                <div className="field-row">
                    <div>
                        <label htmlFor="task-date">
                            Task date:
                        </label>
                        <input name="date" id="task-date" type="date" value={task.date} onChange={inputChange} />
                    </div>
                    <div>
                        <label htmlFor="task-time">
                            Time:
                        </label>
                        <input name="time" id="task-time" type="time" value={task.time} onChange={inputChange} />
                    </div>
                </div>
                <div>
                    <label htmlFor="task-reminder">
                        Reminder:
                    </label>
                    <select name="remindBefore" id="task-reminder" value={task.remindBefore} onChange={inputChange} disabled={!canRemind}>
                        {REMINDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {!canRemind && <span className="hint">Set a date and time to add a reminder.</span>}
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