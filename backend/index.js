require('dotenv').config();
const app = require('./app');
const scheduler = require('./lib/scheduler');

const PORT = process.env.PORT || 8008;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    if (process.env.REMINDERS_ENABLED !== 'false') scheduler.start();
});
