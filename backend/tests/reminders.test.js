const r = require('../lib/reminders');

const task = (over) => ({ id: '1', title: 'Call bank', description: '', date: '2026-11-10', time: '15:00', remindBefore: 30, done: false, remindedAt: null, ...over });
const at = (s) => new Date(s); // local time, e.g. '2026-11-10T14:30'

describe('reminderAt', () => {
    it('subtracts the lead time from the due time', () => {
        expect(r.reminderAt(task())).toEqual(at('2026-11-10T14:30'));
    });
    it('is null without a reminder, a time, or a date', () => {
        expect(r.reminderAt(task({ remindBefore: null }))).toBeNull();
        expect(r.reminderAt(task({ time: null }))).toBeNull();
        expect(r.reminderAt(task({ date: null }))).toBeNull();
    });
    it('supports a reminder at the due time', () => {
        expect(r.reminderAt(task({ remindBefore: 0 }))).toEqual(at('2026-11-10T15:00'));
    });
});

describe('dueReminders', () => {
    it('returns tasks whose reminder time has passed', () => {
        expect(r.dueReminders([task()], at('2026-11-10T14:29'))).toHaveLength(0);
        expect(r.dueReminders([task()], at('2026-11-10T14:30'))).toHaveLength(1);
    });
    it('skips done tasks and ones already reminded', () => {
        const now = at('2026-11-10T14:31');
        expect(r.dueReminders([task({ done: true })], now)).toHaveLength(0);
        expect(r.dueReminders([task({ remindedAt: 'x' })], now)).toHaveLength(0);
    });
    it('skips reminders that are many hours stale', () => {
        expect(r.dueReminders([task()], at('2026-11-11T09:00'))).toHaveLength(0);
    });
});

describe('daily summary', () => {
    const tasks = [
        task({ id: 'a', title: 'Later', time: '18:00' }),
        task({ id: 'b', title: 'Early', time: '08:00' }),
        task({ id: 'c', title: 'Old', date: '2026-11-08' }),
        task({ id: 'd', title: 'Finished', done: true }),
        task({ id: 'e', title: 'Unscheduled', date: null }),
        task({ id: 'f', title: 'Tomorrow', date: '2026-11-11' }),
    ];

    it('lists open tasks for today (by time) and overdue ones', () => {
        const d = r.digestTasks(tasks, at('2026-11-10T08:00'));
        expect(d.today.map(t => t.title)).toEqual(['Early', 'Later']);
        expect(d.overdue.map(t => t.title)).toEqual(['Old']);
    });

    it('builds a readable message', () => {
        const msg = r.digestMessage(r.digestTasks(tasks, at('2026-11-10T08:00')));
        expect(msg.title).toBe('📋 2 tasks today, 1 overdue');
        expect(msg.body).toContain('• 08:00 Early');
        expect(msg.body).toContain('• Old (2026-11-08)');
    });

    it('is due once per day after the configured time', () => {
        const settings = { digestEnabled: true, digestTime: '08:00', lastDigestDate: null };
        expect(r.isDigestDue(settings, at('2026-11-10T07:59'))).toBe(false);
        expect(r.isDigestDue(settings, at('2026-11-10T08:00'))).toBe(true);
        expect(r.isDigestDue({ ...settings, lastDigestDate: '2026-11-10' }, at('2026-11-10T12:00'))).toBe(false);
        expect(r.isDigestDue({ ...settings, digestEnabled: false }, at('2026-11-10T12:00'))).toBe(false);
    });
});

describe('reminderMessage', () => {
    it('describes how long until the task is due', () => {
        expect(r.reminderMessage(task()).body).toMatch(/^Due in 30 min/);
        expect(r.reminderMessage(task({ remindBefore: 60 })).body).toMatch(/^Due in 1 hour /);
        expect(r.reminderMessage(task({ remindBefore: 1440 })).body).toMatch(/^Due in 1 day /);
        expect(r.reminderMessage(task({ remindBefore: 0 })).body).toMatch(/^Due now/);
        expect(r.reminderMessage(task()).url).toBe('/tasks/1');
    });
});
