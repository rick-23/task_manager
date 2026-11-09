const fs = require('fs');
const path = require('path');

// All data lives in JSON files under DATA_DIR (default: backend/data).
// Tests point DATA_DIR at a temp folder so they never touch real data.
const dataDir = () => process.env.DATA_DIR || path.join(__dirname, '../data');

const readJson = (file, fallback) => {
    const filePath = path.join(dataDir(), file);
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeJson = (file, value) => {
    fs.mkdirSync(dataDir(), { recursive: true });
    // Write to a temp file then rename, so a crash mid-write can't corrupt the data.
    const filePath = path.join(dataDir(), file);
    const tmpPath = `${filePath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(value, null, 2), 'utf8');
    fs.renameSync(tmpPath, filePath);
};

const DEFAULT_NOTIFY = {
    settings: {
        digestEnabled: true,
        digestTime: '08:00',
        lastDigestDate: null,
    },
    webPushSubscriptions: [],
    expoPushTokens: [],
};

const readTasks = () => readJson('db.json', []);
const writeTasks = (tasks) => writeJson('db.json', tasks);

const readNotify = () => {
    const stored = readJson('notify.json', {});
    return {
        ...DEFAULT_NOTIFY,
        ...stored,
        settings: { ...DEFAULT_NOTIFY.settings, ...(stored.settings || {}) },
    };
};
const writeNotify = (notify) => writeJson('notify.json', notify);

/** Read-modify-write helper for the notification store. */
const updateNotify = (fn) => {
    const notify = readNotify();
    const result = fn(notify);
    writeNotify(notify);
    return result;
};

module.exports = { readTasks, writeTasks, readNotify, writeNotify, updateNotify };
