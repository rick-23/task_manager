import { createSlice, current } from "@reduxjs/toolkit";
const initialState = {
    tasks: [
        { id: 1, title: "upload recording", date: null },
        { id: 2, title: "add all learners to ION course", date: '2025-07-15' },
        { id: 3, title: "upload the assignment 1 document.", date: '2025-07-16' },
        { id: 4, title: "upload day 2 demo code.", date: '2025-07-16' }

    ]
}
const slicer = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        moveTask: (state, action) => {
            const { taskId, newDate } = action.payload
            const task = state.tasks.find(t => t.id === taskId)
            if (task) task.date = newDate
            console.log(current(state.tasks))
        },
        createTask: (state, action) => {
            state.tasks.push(action.payload)
            console.log(current(state))
            //return [...state.tasks, action.payload]
        }
    }
})
export const { moveTask, createTask } = slicer.actions;
export default slicer.reducer;