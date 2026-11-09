import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    tasks: [],
    loading: false,
    error: null,
};
const slicer = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        setTasks: (state, action) => {
            state.tasks = action.payload;
            state.loading = false;
            state.error = null;
        },
        setLoading(state) {
            state.loading = true;
            state.error = null;
        },
        setError(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        moveTask: (state, action) => {
            const { id, date } = action.payload
            const task = state.tasks.find(t => t.id === id);
            if (task) task.date = date
        },
        createTask: (state, action) => {
            state.tasks.push(action.payload)
        },
        updateTask: (state, action) => {
            const index = state.tasks.findIndex(t => t.id === action.payload.id);
            if (index !== -1) state.tasks[index] = { ...state.tasks[index], ...action.payload };
        }
    }
})
export const { setTasks, setLoading, setError, moveTask, createTask, updateTask } = slicer.actions;
export default slicer.reducer;