import { useRouter } from "next/navigation";
import { handleDragStart } from "../utils/dndUtils";

function TaskItem({ task }) {
    const router = useRouter();
    return (<div
        draggable onDragStart={(e) => handleDragStart(e, task.id)}
        onClick={() => router.push(`/tasks/${task.id}`)}
        className="task-item"
    >
        <p>{task.title}</p>
    </div>)
}
export default TaskItem;