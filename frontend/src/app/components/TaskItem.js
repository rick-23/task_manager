import { useRouter } from "next/navigation";

function TaskItem({ task }) {
    const router = useRouter();
    return (
        <div className={`task-item${task.done ? " done" : ""}`}>
            <p onClick={() => router.push(`/tasks/${task.id}`)}>
                {task.time && <span className="task-time">{task.time} </span>}
                {task.remindBefore !== null && task.remindBefore !== undefined && task.time && !task.done && <span title="Reminder set">🔔 </span>}
                {task.title}
            </p>
        </div>
    );
}
export default TaskItem;
