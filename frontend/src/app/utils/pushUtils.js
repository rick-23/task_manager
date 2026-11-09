import API from "./apiUtils";

// Browser-side helpers for web push. Notifications show as normal system
// notifications on desktop and on phones (Android; iPhone/iPad iOS 16.4+ once
// the app has been added to the Home Screen).

export const isPushSupported = () =>
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

export const isIOS = () =>
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

/** True when running as an installed (home-screen) app. */
export const isStandalone = () =>
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);

export const registerServiceWorker = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
    return navigator.serviceWorker.register("/sw.js");
};

/** Convert the server's base64url VAPID key into the format PushManager expects. */
export const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

export const getCurrentSubscription = async () => {
    if (!isPushSupported()) return null;
    const registration = await navigator.serviceWorker.getRegistration();
    return registration ? registration.pushManager.getSubscription() : null;
};

/** Ask permission, subscribe this device, and send the subscription to the server. */
export const enablePush = async (vapidPublicKey) => {
    if (!isPushSupported()) throw new Error("This browser doesn't support push notifications.");
    if (!vapidPublicKey) throw new Error("Push isn't set up on the server yet (missing VAPID keys).");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") throw new Error("Notifications were blocked. Allow them in your browser's site settings.");

    const registration = (await navigator.serviceWorker.getRegistration()) || (await registerServiceWorker());
    await navigator.serviceWorker.ready;
    const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));
    await API.post("/api/notifications/webpush/subscribe", subscription.toJSON());
    return subscription;
};

export const disablePush = async () => {
    const subscription = await getCurrentSubscription();
    if (!subscription) return;
    await API.post("/api/notifications/webpush/unsubscribe", { endpoint: subscription.endpoint });
    await subscription.unsubscribe();
};
