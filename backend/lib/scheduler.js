const store = require('./store');
const { dueReminders, digestTasks, isDigestDue, reminderMessage, digestMessage, localDateString } = require('./reminders');
const notifier = require('./notifier');

/**
 * One scheduler pass: send due task reminders and, once a day, the summary.
 * Tasks are marked as reminded *before* sending, so a slow or failing send
 * can never cause the same reminder to go out twice.
 */
const tick = async (now = new Date()) => {
    const tasks = store.readTasks();
    const due = dueReminders(tasks, now);
    if (due.length) {
        const dueIds = new Set(due.map((t) => t.id));
        store.writeTasks(tasks.map((t) => (dueIds.has(t.id) ? { ...t, remindedAt: now.toISOString() } : t)));
        for (const task of due) {
            await notifier.notify(reminderMessage(task));
        }
    }

    const { settings } = store.readNotify();
    let digestSent = false;
    if (isDigestDue(settings, now)) {
        store.updateNotify((n) => { n.settings.lastDigestDate = localDateString(now); });
        const digest = digestTasks(tasks, now);
        // Don't send an empty summary.
        if (digest.today.length || digest.overdue.length) {
            await notifier.notify(digestMessage(digest));
            digestSent = true;
        }
    }
    return { reminders: due.length, digestSent };
};

let timer = null;
let running = false;

const start = (intervalMs = 60 * 1000) => {
    if (timer) return;
    const run = async () => {
        if (running) return; // skip if the previous pass is still sending
        running = true;
        try {
            await tick();
        } catch (err) {
            console.error('Reminder scheduler error:', err);
        } finally {
            running = false;
        }
    };
    timer = setInterval(run, intervalMs);
    run();
    console.log('Reminder scheduler started');
};

const stop = () => {
    clearInterval(timer);
    timer = null;
};

module.exports = { tick, start, stop };
