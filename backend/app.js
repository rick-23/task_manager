const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Restrict which sites may call the API with CORS_ORIGIN (comma-separated); open by default for local use.
const origins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : undefined;
app.use(cors(origins ? { origin: origins } : undefined));
app.use(express.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

module.exports = app;
