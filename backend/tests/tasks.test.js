const request = require('supertest');
const express = require('express');
const tasksRouter = require('../routes/tasks');

const app = express();
app.use(express.json());
app.use('/api/tasks', tasksRouter);

describe('Tasks API', () => {
    it('GET /api/tasks returns an array', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/tasks creates a task', async () => {
        const newTask = { title: 'Test', description: 'desc', date: null };
        const res = await request(app).post('/api/tasks').send(newTask);
        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('Test');
    });

    it('PATCH /api/tasks/:id updates a task', async () => {
        const newTask = { title: 'ToUpdate', description: 'desc', date: null };
        const createRes = await request(app).post('/api/tasks').send(newTask);
        const id = createRes.body.id;
        const res = await request(app).patch(`/api/tasks/${id}`).send({ title: 'Updated', description: 'desc', date: null });
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Updated');
    });

    it('DELETE /api/tasks/:id deletes a task', async () => {
        const newTask = { title: 'ToDelete', description: 'desc', date: null };
        const createRes = await request(app).post('/api/tasks').send(newTask);
        const id = createRes.body.id;
        const res = await request(app).delete(`/api/tasks/${id}`);
        expect(res.statusCode).toBe(204);
    });
});