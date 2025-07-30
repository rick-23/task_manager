export const validate = (name, value) => {
    const newErrors = {};
    if (name === 'title') {
        if (!value.trim()) {
            newErrors.title = 'Title is required';
        } else if (value.length < 3) {
            newErrors.title = 'Title must be at least 3 characters long';
        } else {
            newErrors.title = '';
        }
    } else if (name === 'description') {
        if (!value.trim()) {
            newErrors.description = 'Description is required';
        } else if (value.length < 10) {
            newErrors.description = 'Description must be at least 10 characters long';
        } else {
            newErrors.description = '';
        }
    } else if (name === 'date') {
        if (!isNaN(new Date(value))) {
            newErrors.description = 'Date is invalid';
        }
    }
    return newErrors;
}