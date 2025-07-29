import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setTasks, setLoading, setError } from "../store/slicer";
import { useDispatch } from "react-redux";
import API from "../utils/apiUtils";

export const useTasks = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    const { data, isLoading } = useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const { data } = await API.get("/api/tasks");
            dispatch(setTasks(data));
            return data;
        }
    });

    const selectedTask = async (id) => {
        const { data } = await API.get(`/api/tasks/${id}`);
        return data;
    }

    const addTask = useMutation({
        mutationFn: async (task) => {
            const { data } = await API.post("/api/tasks", task);
            return data;
        }
    });

    const editTask = useMutation({
        mutationFn: async (task) => {
            const { data } = await API.patch(`/api/tasks/${task.id}`, task);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
    });

    const deleteTask = useMutation({
        mutationFn: async (id) => {
            await API.delete(`/api/tasks/${id}`);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
    });

    return {
        tasks: data,
        isLoading,
        selectedTask,
        addTask,
        editTask,
        deleteTask
    };
}