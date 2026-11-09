// Service worker: shows push notifications from the Task Manager server and
// opens the right page when one is tapped.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = { body: event.data && event.data.text() };
    }
    const title = data.title || 'Task Manager';
    event.waitUntil(self.registration.showNotification(title, {
        body: data.body || '',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-96.png',
        data: { url: data.url || '/' },
        // Same task -> replace the older notification instead of stacking.
        tag: data.url || title,
        renotify: true,
    }));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = new URL(event.notification.data?.url || '/', self.location.origin).href;
    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const open = windows.find((w) => w.url.startsWith(self.location.origin));
        if (open) {
            await open.focus();
            return open.navigate(url);
        }
        return self.clients.openWindow(url);
    })());
});

// Web push needs a fetch handler for the app to be installable in some browsers;
// it just passes requests through.
self.addEventListener('fetch', () => {});
