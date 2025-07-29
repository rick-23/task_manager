const express = require('express');
const router = express.Router();
const path = require('path');

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Path to the tasks.json file
const dbFilePath = path.join(__dirname, '../data/db.json');

const readTasks = () => {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(data);
};

const writeTasks = (tasks) => {
    const db = JSON.stringify(tasks, null, 2);
    fs.writeFileSync(dbFilePath, db, 'utf8');
};

// Get all tasks
router.get('/', (req, res) => {
    try {
        const tasks = readTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error reading tasks' });
    }
});
// Get a single task by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    try {
        const tasks = readTasks();
        const task = tasks.find(task => task.id === id);
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
    const { title, description, date } = req.body;
    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }

    const newTask = {
        id: uuidv4(),
        title,
        description,
        date
    };

    try {
        const tasks = readTasks();
        tasks.push(newTask);
        writeTasks(tasks);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: 'Error saving task' });
    }
});

// Update a task
router.patch('/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, date } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }

    try {
        const tasks = readTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);

        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found' });
        }

        tasks[taskIndex] = { ...tasks[taskIndex], title, description, date };
        writeTasks(tasks);
        res.json(tasks[taskIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task' });
    }
});

// Delete a task
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    try {
        const tasks = readTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);

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
