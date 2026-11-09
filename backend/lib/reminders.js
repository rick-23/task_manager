// Pure reminder logic: no I/O, so it is easy to test.
// Dates ("YYYY-MM-DD") and times ("HH:MM") are interpreted in the server's
// local time zone; set the TZ environment variable to your own zone.

// Reminders more than this far in the past (e.g. the server was off) are skipped
// instead of being sent late.
const MAX_LATENESS_MS = 12 * 60 * 60 * 1000;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const pad = (n) => String(n).padStart(2, '0');
const localDateString = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localTimeString = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** When the task is due, as a Date. Tasks without a time are due at the start of their day. */
const dueAt = (task) => {
    if (!task.date || !DATE_RE.test(task.date)) return null;
    const time = task.time && TIME_RE.test(task.time) ? task.time : '00:00';
    const [y, m, d] = task.date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm);
};

/** When the reminder for a task should fire, or null if it has no reminder. */
const reminderAt = (task) => {
    if (task.remindBefore === null || task.remindBefore === undefined) return null;
    // A reminder needs a concrete time of day; date-only tasks are covered by the daily digest.
    if (!task.time) return null;
    const due = dueAt(task);
    if (!due) return null;
    return new Date(due.getTime() - task.remindBefore * 60 * 1000);
};

/** Tasks whose reminder is due now and hasn't been sent yet. */
const dueReminders = (tasks, now = new Date()) =>
    tasks.filter((task) => {
        if (task.done || task.remindedAt) return false;
        const at = reminderAt(task);
        if (!at) return false;
        return at <= now && now - at <= MAX_LATENESS_MS;
    });

/** Unfinished tasks due today and overdue ones, for the morning summary. */
const digestTasks = (tasks, now = new Date()) => {
    const today = localDateString(now);
    const open = tasks.filter((t) => !t.done && t.date);
    const byTime = (a, b) => (a.time || '').localeCompare(b.time || '');
    return {
        today: open.filter((t) => t.date === today).sort(byTime),
        overdue: open.filter((t) => t.date < today).sort((a, b) => a.date.localeCompare(b.date)),
    };
};

/** True when the daily summary should go out now. */
const isDigestDue = (settings, now = new Date()) =>
    Boolean(settings.digestEnabled) &&
    settings.lastDigestDate !== localDateString(now) &&
    localTimeString(now) >= settings.digestTime;

const describeLead = (minutes) => {
    if (!minutes) return 'now';
    if (minutes % 1440 === 0) return `in ${minutes / 1440} day${minutes === 1440 ? '' : 's'}`;
    if (minutes % 60 === 0) return `in ${minutes / 60} hour${minutes === 60 ? '' : 's'}`;
    return `in ${minutes} min`;
};

const reminderMessage = (task) => ({
    title: `⏰ ${task.title}`,
    body: `Due ${describeLead(task.remindBefore)} (${task.date} ${task.time})${task.description ? ` – ${task.description}` : ''}`,
    url: `/tasks/${task.id}`,
});

const digestMessage = ({ today, overdue }) => {
    const line = (t) => `• ${t.time ? `${t.time} ` : ''}${t.title}`;
    const parts = [];
    if (today.length) parts.push(`Today (${today.length}):\n${today.map(line).join('\n')}`);
    if (overdue.length) parts.push(`Overdue (${overdue.length}):\n${overdue.map((t) => `• ${t.title} (${t.date})`).join('\n')}`);
    return {
        title: `📋 ${today.length} task${today.length === 1 ? '' : 's'} today${overdue.length ? `, ${overdue.length} overdue` : ''}`,
        body: parts.join('\n\n'),
        url: '/',
    };
};

module.exports = {
    DATE_RE,
    TIME_RE,
    dueAt,
    reminderAt,
    dueReminders,
    digestTasks,
    isDigestDue,
    reminderMessage,
    digestMessage,
    localDateString,
};
