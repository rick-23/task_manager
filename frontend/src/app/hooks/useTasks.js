import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setTasks, setLoading, setError } from "../store/slicer";
import { useDispatch } from "react-redux";
import API from "../utils/apiUtils";

export const useTasks = (taskId = null) => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    const {
        data,
        isLoading,
        isError,
        error
    }
        = useQuery({
            queryKey: ["tasks"],
            queryFn: async () => {
                const { data } = await API.get("/api/tasks");
                dispatch(setTasks(data));
                return data;
            },
            onError: (error) => {
                console.error("Error fetching tasks:", error);
                dispatch(setError(error.message));
            }
        });

    const {
        data: selectedTask,
        isLoading: isLoadingTask
    } = useQuery({
        queryKey: ['task', taskId],
        queryFn: async () => {
            const { data } = await API.get(`/api/tasks/${taskId}`);
            return data;
        },
        onError: (error) => {
            console.error("Error fetching task:", error);
            dispatch(setError(error.message));
        },
        enabled: !!taskId
    });


    const addTask = useMutation({
        mutationFn: async (task) => {
            const { data } = await API.post("/api/tasks", task);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error) => {
            console.error("Error adding task:", error);
            dispatch(setError(error.message));
        },
        enabled: !!taskId
    });

    const editTask = useMutation({
        mutationFn: async (task) => {
            const { data } = await API.patch(`/api/tasks/${task.id}`, task);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error) => {
            console.error("Error editing task:", error);
            dispatch(setError(error.message));
        },
    });

    const deleteTask = useMutation({
        mutationFn: async (id) => {
            await API.delete(`/api/tasks/${id}`);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error) => {
            console.error("Error deleting task:", error);
            dispatch(setError(error.message));
        }
    });

    return {
        tasks: data,
        isLoading,
        selectedTask,
        addTask,
        editTask,
        deleteTask,
        isError,
        tasksError: error
    };
}