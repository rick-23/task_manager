const nodemailer = require('nodemailer');
const webpush = require('web-push');
const store = require('./store');

// Each channel is enabled only when its environment variables are set.
// A failure in one channel never stops the others.

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const emailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.NOTIFY_EMAIL);
const webPushConfigured = () => Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

const channelStatus = () => {
    const notify = store.readNotify();
    return {
        email: { configured: emailConfigured(), to: emailConfigured() ? process.env.NOTIFY_EMAIL : null },
        webPush: { configured: webPushConfigured(), devices: notify.webPushSubscriptions.length },
        expo: { configured: true, devices: notify.expoPushTokens.length },
    };
};

let transport;
const getTransport = () => {
    if (!transport) {
        transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        });
    }
    return transport;
};

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const sendEmail = async ({ title, body, url }) => {
    if (!emailConfigured()) return { skipped: 'not configured' };
    const link = process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, '')}${url || '/'}` : null;
    await getTransport().sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.NOTIFY_EMAIL,
        subject: title,
        text: link ? `${body}\n\n${link}` : body,
        html: `<p style="white-space:pre-line">${escapeHtml(body)}</p>${link ? `<p><a href="${link}">Open Task Manager</a></p>` : ''}`,
    });
    return { sent: 1 };
};

const sendWebPush = async ({ title, body, url }) => {
    if (!webPushConfigured()) return { skipped: 'not configured' };
    const { webPushSubscriptions } = store.readNotify();
    if (!webPushSubscriptions.length) return { skipped: 'no devices' };

    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY,
    );
    const payload = JSON.stringify({ title, body, url });
    const expired = [];
    let sent = 0;
    await Promise.all(webPushSubscriptions.map(async (sub) => {
        try {
            await webpush.sendNotification(sub, payload);
            sent += 1;
        } catch (err) {
            // 404/410 mean the browser unsubscribed; forget that device.
            if (err.statusCode === 404 || err.statusCode === 410) expired.push(sub.endpoint);
            else console.error('Web push failed:', err.statusCode || err.message);
        }
    }));
    if (expired.length) {
        store.updateNotify((n) => {
            n.webPushSubscriptions = n.webPushSubscriptions.filter((s) => !expired.includes(s.endpoint));
        });
    }
    return { sent, removed: expired.length };
};

const sendExpoPush = async ({ title, body, url }) => {
    const { expoPushTokens } = store.readNotify();
    if (!expoPushTokens.length) return { skipped: 'no devices' };

    const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(expoPushTokens.map((to) => ({ to, title, body, sound: 'default', data: { url } }))),
    });
    if (!res.ok) throw new Error(`Expo push returned ${res.status}`);
    const { data = [] } = await res.json();
    // Tickets come back in the same order as the messages.
    const expired = expoPushTokens.filter((_, i) => data[i]?.details?.error === 'DeviceNotRegistered');
    if (expired.length) {
        store.updateNotify((n) => {
            n.expoPushTokens = n.expoPushTokens.filter((t) => !expired.includes(t));
        });
    }
    return { sent: data.filter((t) => t.status === 'ok').length, removed: expired.length };
};

const channels = { email: sendEmail, webPush: sendWebPush, expo: sendExpoPush };

/** Send a message on every channel. Resolves to a per-channel result; never rejects. */
const notify = async (message) => {
    const results = {};
    await Promise.all(Object.entries(channels).map(async ([name, send]) => {
        try {
            results[name] = await send(message);
        } catch (err) {
            console.error(`Notification via ${name} failed:`, err.message);
            results[name] = { error: err.message };
        }
    }));
    return results;
};

module.exports = { notify, channelStatus, channels };
