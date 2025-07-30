import { useRouter } from "next/navigation";
import { handleDragStart } from "../utils/dndUtils";

function TaskItem({ task }) {
    const router = useRouter();
    return (
        <div className="task-item">
            <p onClick={() => router.push(`/tasks/${task.id}`)}>{task.title}</p>
        </div>
    );
}
export default TaskItem;