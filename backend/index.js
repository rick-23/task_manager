const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8008;

// Middleware
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
