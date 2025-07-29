import { createSlice, current } from "@reduxjs/toolkit";
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
            const { id, newDate } = action.payload
            const task = state.tasks.find(t => t.id === id);
            if (task) task.date = newDate
        },
        createTask: (state, action) => {
            state.tasks.push(action.payload)
        }
    }
})
export const { setTasks, setLoading, setError, moveTask, createTask } = slicer.actions;
export default slicer.reducer;