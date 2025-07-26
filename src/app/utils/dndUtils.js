export const handleDragStart = (e, taskId)=>{
    e.dataTransfer.setData('taskId', taskId)
}

export const handleDragOver = (e)=>{
    e.preventDefault()
}

export const handleDrop = (e, newDate, moveTask)=>{
    const taskId = parseInt(e.dataTransfer.getData('taskId'))
    moveTask(taskId, newDate)
}