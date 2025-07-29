import { setTasks, setLoading, setError } from './slicer';
import API from '../utils/apiUtils';

export const fetchTasks = () => async (dispatch) => {
    dispatch(setLoading());
    try {
        const response = await API.get('/api/tasks');
        dispatch(setTasks(response.data));
    } catch (err) {
        dispatch(setError(err.message));
    }
};