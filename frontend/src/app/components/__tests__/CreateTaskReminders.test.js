import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import CreateTask from '../CreateTask';

jest.mock('../../hooks/useTasks', () => {
    const addTask = { mutate: jest.fn() };
    const editTask = { mutate: jest.fn() };
    return { useTasks: () => ({ addTask, editTask, isLoading: false }), __mocks: { addTask, editTask } };
});
const { __mocks } = jest.requireMock('../../hooks/useTasks');

const renderForm = (props) => render(<Provider store={store}><CreateTask {...props} /></Provider>);
const change = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => jest.clearAllMocks());

describe('CreateTask reminders', () => {
    it('only enables the reminder once a date and time are set', () => {
        renderForm();
        const reminder = screen.getByLabelText(/Reminder:/i);
        expect(reminder).toBeDisabled();
        change(/Task date:/i, '2026-11-10');
        expect(reminder).toBeDisabled();
        change(/Time:/i, '15:30');
        expect(reminder).toBeEnabled();
    });

    it('keeps the form submittable after picking a date', () => {
        renderForm();
        change(/Task title:/i, 'Pay rent');
        change(/Task description:/i, 'Transfer to landlord');
        change(/Task date:/i, '2026-11-10');
        expect(screen.getByRole('button', { name: /Create Task/i })).toBeEnabled();
        expect(screen.queryByText(/Date is invalid/i)).not.toBeInTheDocument();
    });

    it('sends time and reminder minutes when creating a task', () => {
        renderForm();
        change(/Task title:/i, 'Pay rent');
        change(/Task description:/i, 'Transfer to landlord');
        change(/Task date:/i, '2026-11-10');
        change(/Time:/i, '15:30');
        change(/Reminder:/i, '30');
        fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));
        expect(__mocks.addTask.mutate).toHaveBeenCalledWith(
            { title: 'Pay rent', description: 'Transfer to landlord', date: '2026-11-10', time: '15:30', remindBefore: 30 },
            expect.any(Object),
        );
    });

    it('clears the reminder when the time is removed', () => {
        renderForm({ taskToEdit: { id: '1', title: 'Pay rent', description: 'Transfer to landlord', date: '2026-11-10', time: '15:30', remindBefore: 30 } });
        change(/Time:/i, '');
        fireEvent.click(screen.getByRole('button', { name: /Update Task/i }));
        expect(__mocks.editTask.mutate).toHaveBeenCalledWith(
            expect.objectContaining({ id: '1', time: null, remindBefore: null }),
            expect.any(Object),
        );
    });

    it('requires a change before an edit can be saved', () => {
        renderForm({ taskToEdit: { id: '1', title: 'Pay rent', description: 'Transfer to landlord', date: null, time: null, remindBefore: null } });
        expect(screen.getByRole('button', { name: /Update Task/i })).toBeDisabled();
        change(/Task date:/i, '2026-11-12');
        expect(screen.getByRole('button', { name: /Update Task/i })).toBeEnabled();
    });
});
