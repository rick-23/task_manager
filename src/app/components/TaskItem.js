import { handleDragStart } from "../utils/dndUtils";

function TaskItem({ task }) {
    return (<div
        draggable onDragStart={(e) => handleDragStart(e, task.id)}
    >
        <p>{task.title}</p>
    </div>)
}
export default TaskItem;