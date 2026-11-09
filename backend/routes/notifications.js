const express = require('express');
const router = express.Router();
const store = require('../lib/store');
const notifier = require('../lib/notifier');
const { TIME_RE } = require('../lib/reminders');

// Expo push tokens look like ExponentPushToken[xxxx] (or ExpoPushToken[xxxx]).
const EXPO_TOKEN_RE = /^Expo(nent)?PushToken\[[^\]]+\]$/;

// What's set up, plus the public VAPID key browsers need to subscribe.
router.get('/config', (req, res) => {
    const { settings } = store.readNotify();
    res.json({
        vapidPublicKey: process.env.VAPID_PUBLIC_KEY || null,
        channels: notifier.channelStatus(),
        settings: { digestEnabled: settings.digestEnabled, digestTime: settings.digestTime },
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
});

// Only the daily summary schedule is editable here. The email address comes from the
// NOTIFY_EMAIL env var on purpose, so this API can't be used to email arbitrary people.
router.put('/settings', (req, res) => {
    const { digestEnabled, digestTime } = req.body || {};
    if (digestEnabled !== undefined && typeof digestEnabled !== 'boolean') {
        return res.status(400).json({ message: 'digestEnabled must be true or false' });
    }
    if (digestTime !== undefined && !TIME_RE.test(digestTime)) {
        return res.status(400).json({ message: 'digestTime must be HH:MM' });
    }
    const settings = store.updateNotify((n) => {
        if (digestEnabled !== undefined) n.settings.digestEnabled = digestEnabled;
        if (digestTime !== undefined && digestTime !== n.settings.digestTime) {
            n.settings.digestTime = digestTime;
            // Allow today's summary to go out at the new time.
            n.settings.lastDigestDate = null;
        }
        return n.settings;
    });
    res.json({ digestEnabled: settings.digestEnabled, digestTime: settings.digestTime });
});

// Browser / installed-app (PWA) push subscriptions.
router.post('/webpush/subscribe', (req, res) => {
    const sub = req.body || {};
    if (typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) {
        return res.status(400).json({ message: 'Invalid push subscription' });
    }
    store.updateNotify((n) => {
        n.webPushSubscriptions = n.webPushSubscriptions.filter((s) => s.endpoint !== sub.endpoint);
        n.webPushSubscriptions.push({ endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } });
    });
    res.status(201).json({ message: 'Subscribed' });
});

router.post('/webpush/unsubscribe', (req, res) => {
    const { endpoint } = req.body || {};
    store.updateNotify((n) => {
        n.webPushSubscriptions = n.webPushSubscriptions.filter((s) => s.endpoint !== endpoint);
    });
    res.status(204).send();
});

// Native phone app (Expo) push tokens.
router.post('/expo/register', (req, res) => {
    const { token } = req.body || {};
    if (typeof token !== 'string' || !EXPO_TOKEN_RE.test(token)) {
        return res.status(400).json({ message: 'Invalid Expo push token' });
    }
    store.updateNotify((n) => {
        if (!n.expoPushTokens.includes(token)) n.expoPushTokens.push(token);
    });
    res.status(201).json({ message: 'Registered' });
});

router.post('/expo/unregister', (req, res) => {
    const { token } = req.body || {};
    store.updateNotify((n) => {
        n.expoPushTokens = n.expoPushTokens.filter((t) => t !== token);
    });
    res.status(204).send();
});

// Send a test notification on every configured channel (at most once every 10 seconds).
let lastTestAt = 0;
router.post('/test', async (req, res) => {
    if (Date.now() - lastTestAt < 10 * 1000) {
        return res.status(429).json({ message: 'Please wait a few seconds before sending another test' });
    }
    lastTestAt = Date.now();
    const results = await notifier.notify({
        title: '✅ Task Manager test',
        body: 'Notifications are working on this channel.',
        url: '/',
    });
    res.json({ results });
});

module.exports = router;
