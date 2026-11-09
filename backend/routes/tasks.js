const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readTasks, writeTasks } = require('../lib/store');
const { DATE_RE, TIME_RE } = require('../lib/reminders');

const MAX_REMIND_BEFORE = 7 * 24 * 60; // one week, in minutes

// Fields that change when a reminder fires; editing any of them re-arms the reminder.
const SCHEDULE_FIELDS = ['date', 'time', 'remindBefore'];

/**
 * Validate the fields present in `body`. With `partial`, missing fields are allowed.
 * Returns { error } or { fields } with normalised values.
 */
const parseTaskFields = (body, { partial }) => {
    const fields = {};
    const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

    for (const key of ['title', 'description']) {
        if (has(key) || !partial) {
            if (typeof body[key] !== 'string' || !body[key].trim()) {
                return { error: 'Title and description are required' };
            }
            fields[key] = body[key].trim();
        }
    }
    if (has('date')) {
        if (body.date !== null && body.date !== '' && !DATE_RE.test(body.date)) return { error: 'date must be YYYY-MM-DD' };
        fields.date = body.date || null;
    }
    if (has('time')) {
        if (body.time !== null && body.time !== '' && !TIME_RE.test(body.time)) return { error: 'time must be HH:MM' };
        fields.time = body.time || null;
    }
    if (has('remindBefore')) {
        const v = body.remindBefore;
        if (v !== null && v !== '' && !(Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= MAX_REMIND_BEFORE)) {
            return { error: `remindBefore must be minutes between 0 and ${MAX_REMIND_BEFORE}` };
        }
        fields.remindBefore = v === null || v === '' ? null : Number(v);
    }
    if (has('done')) {
        if (typeof body.done !== 'boolean') return { error: 'done must be true or false' };
        fields.done = body.done;
    }
    return { fields };
};

// Get all tasks
router.get('/', (req, res) => {
    try {
        res.json(readTasks());
    } catch (error) {
        res.status(500).json({ message: 'Error reading tasks' });
    }
});

// Get a single task by ID
router.get('/:id', (req, res) => {
    try {
        const task = readTasks().find(t => t.id === req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error reading task' });
    }
});

// Create a new task
router.post('/', (req, res) => {
    const { error, fields } = parseTaskFields(req.body || {}, { partial: false });
    if (error) return res.status(400).json({ message: error });

    const newTask = {
        id: uuidv4(),
        date: null,
        time: null,
        remindBefore: null,
        done: false,
        ...fields,
        remindedAt: null,
        createdAt: new Date().toISOString(),
    };

    try {
        const tasks = readTasks();
        tasks.push(newTask);
        writeTasks(tasks);
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ message: 'Error saving task' });
    }
});

// Update a task: only the fields sent are changed.
router.patch('/:id', (req, res) => {
    const { error, fields } = parseTaskFields(req.body || {}, { partial: true });
    if (error) return res.status(400).json({ message: error });

    try {
        const tasks = readTasks();
        const taskIndex = tasks.findIndex(task => task.id === req.params.id);
        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const current = tasks[taskIndex];
        const updated = { ...current, ...fields };
        if (SCHEDULE_FIELDS.some(k => k in fields && fields[k] !== current[k])) {
            updated.remindedAt = null;
        }
        tasks[taskIndex] = updated;
        writeTasks(tasks);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Error updating task' });
    }
});

// Delete a task
router.delete('/:id', (req, res) => {
    try {
        const tasks = readTasks();
        const taskIndex = tasks.findIndex(task => task.id === req.params.id);
        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found' });
        }
        tasks.splice(taskIndex, 1);
        writeTasks(tasks);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task' });
    }
});

module.exports = router;
