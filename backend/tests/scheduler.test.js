jest.mock('../lib/notifier', () => ({ notify: jest.fn().mockResolvedValue({}) }));

const notifier = require('../lib/notifier');
const store = require('../lib/store');
const { tick } = require('../lib/scheduler');
const { useTempDataDir } = require('./helpers');

useTempDataDir();
beforeEach(() => notifier.notify.mockClear());

const task = (over) => ({ id: '1', title: 'Pay rent', description: '', date: '2026-11-10', time: '10:00', remindBefore: 15, done: false, remindedAt: null, ...over });

describe('scheduler tick', () => {
    beforeEach(() => store.updateNotify(n => { n.settings.digestEnabled = false; }));

    it('sends a due reminder exactly once', async () => {
        store.writeTasks([task()]);
        const now = new Date('2026-11-10T09:45');
        expect((await tick(now)).reminders).toBe(1);
        expect(notifier.notify).toHaveBeenCalledWith(expect.objectContaining({ title: '⏰ Pay rent' }));
        expect(store.readTasks()[0].remindedAt).toBe(now.toISOString());

        expect((await tick(new Date('2026-11-10T09:46'))).reminders).toBe(0);
        expect(notifier.notify).toHaveBeenCalledTimes(1);
    });

    it('does nothing before the reminder time', async () => {
        store.writeTasks([task()]);
        await tick(new Date('2026-11-10T09:44'));
        expect(notifier.notify).not.toHaveBeenCalled();
    });
});

describe('daily summary', () => {
    beforeEach(() => store.updateNotify(n => { n.settings.digestEnabled = true; n.settings.digestTime = '08:00'; }));

    it('sends the summary once per day', async () => {
        store.writeTasks([task({ remindBefore: null })]);
        expect((await tick(new Date('2026-11-10T08:00'))).digestSent).toBe(true);
        expect((await tick(new Date('2026-11-10T08:01'))).digestSent).toBe(false);
        expect(notifier.notify).toHaveBeenCalledTimes(1);
        expect((await tick(new Date('2026-11-11T08:00'))).digestSent).toBe(true);
    });

    it('skips the summary when there is nothing to report', async () => {
        store.writeTasks([]);
        expect((await tick(new Date('2026-11-10T08:00'))).digestSent).toBe(false);
        expect(notifier.notify).not.toHaveBeenCalled();
    });
});
