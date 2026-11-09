const request = require('supertest');
const app = require('../app');
const store = require('../lib/store');
const notifier = require('../lib/notifier');
const { useTempDataDir } = require('./helpers');

useTempDataDir();

const subscription = { endpoint: 'https://push.example.com/abc', keys: { p256dh: 'p', auth: 'a' } };

describe('Notifications API', () => {
    const savedEnv = { ...process.env };
    afterEach(() => {
        process.env = { ...savedEnv, DATA_DIR: process.env.DATA_DIR };
        jest.restoreAllMocks();
    });

    it('GET /config reports which channels are set up', async () => {
        delete process.env.SMTP_HOST;
        process.env.VAPID_PUBLIC_KEY = 'pub';
        process.env.VAPID_PRIVATE_KEY = 'priv';
        const res = await request(app).get('/api/notifications/config');
        expect(res.statusCode).toBe(200);
        expect(res.body.vapidPublicKey).toBe('pub');
        expect(res.body.channels.email.configured).toBe(false);
        expect(res.body.channels.webPush).toEqual({ configured: true, devices: 0 });
        expect(res.body.settings).toEqual({ digestEnabled: true, digestTime: '08:00' });
    });

    it('PUT /settings validates and saves the summary time', async () => {
        expect((await request(app).put('/api/notifications/settings').send({ digestTime: '7am' })).statusCode).toBe(400);
        const res = await request(app).put('/api/notifications/settings').send({ digestTime: '07:15', digestEnabled: false });
        expect(res.body).toEqual({ digestTime: '07:15', digestEnabled: false });
        expect(store.readNotify().settings.digestTime).toBe('07:15');
    });

    it('stores web push subscriptions without duplicates and removes them', async () => {
        await request(app).post('/api/notifications/webpush/subscribe').send(subscription).expect(201);
        await request(app).post('/api/notifications/webpush/subscribe').send(subscription).expect(201);
        expect(store.readNotify().webPushSubscriptions).toHaveLength(1);
        await request(app).post('/api/notifications/webpush/unsubscribe').send({ endpoint: subscription.endpoint }).expect(204);
        expect(store.readNotify().webPushSubscriptions).toHaveLength(0);
    });

    it('rejects malformed subscriptions and Expo tokens', async () => {
        await request(app).post('/api/notifications/webpush/subscribe').send({ endpoint: 'http://x' }).expect(400);
        await request(app).post('/api/notifications/expo/register').send({ token: 'abc' }).expect(400);
    });

    it('registers Expo push tokens once', async () => {
        const token = 'ExponentPushToken[abc123]';
        await request(app).post('/api/notifications/expo/register').send({ token }).expect(201);
        await request(app).post('/api/notifications/expo/register').send({ token }).expect(201);
        expect(store.readNotify().expoPushTokens).toEqual([token]);
    });

    it('POST /test sends on every channel and is throttled', async () => {
        jest.spyOn(notifier, 'notify').mockResolvedValue({ email: { sent: 1 } });
        const res = await request(app).post('/api/notifications/test');
        expect(res.body.results).toEqual({ email: { sent: 1 } });
        await request(app).post('/api/notifications/test').expect(429);
    });
});

describe('notifier', () => {
    afterEach(() => jest.restoreAllMocks());

    it('keeps going when a channel fails', async () => {
        delete process.env.SMTP_HOST;
        delete process.env.VAPID_PUBLIC_KEY;
        store.updateNotify(n => { n.expoPushTokens = ['ExponentPushToken[x]']; });
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'));
        jest.spyOn(console, 'error').mockImplementation(() => {});
        const results = await notifier.notify({ title: 't', body: 'b', url: '/' });
        expect(results.email).toEqual({ skipped: 'not configured' });
        expect(results.webPush).toEqual({ skipped: 'not configured' });
        expect(results.expo).toEqual({ error: 'offline' });
    });

    it('forgets Expo devices that are no longer registered', async () => {
        store.updateNotify(n => { n.expoPushTokens = ['ExponentPushToken[old]', 'ExponentPushToken[ok]']; });
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ data: [{ status: 'error', details: { error: 'DeviceNotRegistered' } }, { status: 'ok' }] }),
        });
        const results = await notifier.notify({ title: 't', body: 'b', url: '/' });
        expect(results.expo).toEqual({ sent: 1, removed: 1 });
        expect(store.readNotify().expoPushTokens).toEqual(['ExponentPushToken[ok]']);
    });
});
