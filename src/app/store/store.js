import { configureStore } from "@reduxjs/toolkit";
import taskReducer from './slicer'

export const store = configureStore({
    reducer:{
        tasks: taskReducer
    }
})