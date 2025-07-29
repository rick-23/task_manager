export const handleDragStart = (e, id) => {
    e.dataTransfer.setData('taskId', id)
}

export const handleDragOver = (e) => {
    e.preventDefault()
}

export const handleDrop = (e, newDate, moveTask) => {
    const id = e.dataTransfer.getData('taskId');
    moveTask(id, newDate)
}