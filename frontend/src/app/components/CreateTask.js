'use client'

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { createTask } from "../store/slicer";
import { validate } from "../utils/validationUtils";
import '../TaskForm.css';
import { useTasks } from "../hooks/useTasks";
import LoadingSpinner from "./Loading";

export default function CreateTask() {
    const { addTask, isLoading } = useTasks();
    const router = useRouter();

    // const dispatch = useDispatch();
    // const tasks = useSelector(({ tasks }) => tasks.tasks);
    // const lastIdIndex = tasks[tasks.length - 1]?.id || 0;

    const [errors, setErrors] = useState({ title: '', description: '' });
    const [task, setTask] = useState({
        title: '',
        description: '',
        date: null
    });

    const isFormValid = useMemo(() => {
        return (
            task.title.trim() !== '' &&
            task.description.trim() !== '' &&
            !errors.title &&
            !errors.description
        );
    }, [task, errors]);

    const inputChange = (e) => {
        const { name, value } = e.target;
        let newErrors = validate(name, value);
        setTask({ ...task, [name]: value });
        setErrors({ ...errors, ...newErrors });
    }

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="task-form-container">
            <form onSubmit={(e) => {
                e.preventDefault();
                // dispatch(createTask(task));
                addTask.mutate(task);
                router.push('/');
            }}>
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

                <button type="submit" disabled={!isFormValid}>Create Task</button>
            </form>
        </div>
    );
}