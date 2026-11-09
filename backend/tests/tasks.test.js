const request = require('supertest');
const app = require('../app');
const { useTempDataDir } = require('./helpers');

useTempDataDir();

const create = (task) => request(app).post('/api/tasks').send({ title: 'Test', description: 'desc', ...task });

describe('Tasks API', () => {
    it('GET /api/tasks returns an array', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('POST /api/tasks creates a task with reminder defaults', async () => {
        const res = await create({ date: null });
        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject({ title: 'Test', date: null, time: null, remindBefore: null, done: false });
    });

    it('POST /api/tasks stores time and reminder', async () => {
        const res = await create({ date: '2026-11-10', time: '15:30', remindBefore: '30' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject({ date: '2026-11-10', time: '15:30', remindBefore: 30 });
    });

    it.each([
        [{ title: '' }, /required/],
        [{ date: '10/11/2026' }, /date/],
        [{ time: '25:00' }, /time/],
        [{ remindBefore: -5 }, /remindBefore/],
        [{ done: 'yes' }, /done/],
    ])('POST /api/tasks rejects invalid input %j', async (bad, message) => {
        const res = await create(bad);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(message);
    });

    it('PATCH /api/tasks/:id updates a task', async () => {
        const { body: { id } } = await create({ title: 'ToUpdate' });
        const res = await request(app).patch(`/api/tasks/${id}`).send({ title: 'Updated', description: 'desc', date: null });
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Updated');
    });

    it('PATCH /api/tasks/:id can change a single field', async () => {
        const { body: { id } } = await create({ title: 'Keep me' });
        const res = await request(app).patch(`/api/tasks/${id}`).send({ done: true });
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({ title: 'Keep me', done: true });
    });

    it('PATCH re-arms a reminder when the schedule changes', async () => {
        const { body: { id } } = await create({ date: '2026-11-10', time: '09:00', remindBefore: 0 });
        const store = require('../lib/store');
        store.writeTasks(store.readTasks().map(t => ({ ...t, remindedAt: '2026-11-10T09:00:00.000Z' })));

        const same = await request(app).patch(`/api/tasks/${id}`).send({ time: '09:00', title: 'Renamed' });
        expect(same.body.remindedAt).not.toBeNull();
        const moved = await request(app).patch(`/api/tasks/${id}`).send({ time: '10:00' });
        expect(moved.body.remindedAt).toBeNull();
    });

    it('PATCH /api/tasks/:id returns 404 for unknown task', async () => {
        const res = await request(app).patch('/api/tasks/nope').send({ done: true });
        expect(res.statusCode).toBe(404);
    });

    it('DELETE /api/tasks/:id deletes a task', async () => {
        const { body: { id } } = await create({ title: 'ToDelete' });
        const res = await request(app).delete(`/api/tasks/${id}`);
        expect(res.statusCode).toBe(204);
        expect((await request(app).get('/api/tasks')).body).toEqual([]);
    });
});
