import reducer, { moveTask, updateTask, setTasks } from '../slicer';

const start = reducer(undefined, setTasks([{ id: 'a', title: 'A', date: null, done: false }]));

describe('tasks slice', () => {
    it('moveTask sets the new date', () => {
        expect(reducer(start, moveTask({ id: 'a', date: '2026-11-10' })).tasks[0].date).toBe('2026-11-10');
    });

    it('updateTask merges fields', () => {
        expect(reducer(start, updateTask({ id: 'a', done: true })).tasks[0]).toMatchObject({ title: 'A', done: true });
    });
});
