import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import CreateTask from '../CreateTask';

const renderWithProviders = (ui) => {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                {ui}
            </Provider>
        </QueryClientProvider>
    );
};

describe('CreateTask', () => {
    it('renders form fields', () => {
        renderWithProviders(<CreateTask />);
        expect(screen.getByLabelText(/Task title:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Task description:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Task date:/i)).toBeInTheDocument();
    });

    it('validates required fields', () => {
        renderWithProviders(<CreateTask />);
        const titleInput = screen.getByLabelText(/Task title:/i);

        // Type a value into the input
        fireEvent.change(titleInput, { target: { value: 'Some title' } });

        // Clear the input value
        fireEvent.change(titleInput, { target: { value: '' } });

        // Now the validation error should appear
        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
    });

    it('calls onCancelEdit when Cancel Edit is clicked', () => {
        const onCancelEdit = jest.fn();
        renderWithProviders(<CreateTask taskToEdit={{ title: 'a', description: 'b', date: null }} onCancelEdit={onCancelEdit} />);
        fireEvent.click(screen.getByText(/Cancel Edit/i));
        expect(onCancelEdit).toHaveBeenCalled();
    });
});