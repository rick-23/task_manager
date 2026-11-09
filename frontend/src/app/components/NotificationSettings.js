'use client';
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import API from "../utils/apiUtils";
import {
    disablePush, enablePush, getCurrentSubscription, isIOS, isPushSupported, isStandalone,
} from "../utils/pushUtils";
import "../TaskForm.css";

const Status = ({ ok, children }) => (
    <span className={`channel-status ${ok ? "on" : "off"}`}>{ok ? "●" : "○"} {children}</span>
);

export default function NotificationSettings() {
    const [config, setConfig] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [deviceSubscribed, setDeviceSubscribed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [digest, setDigest] = useState({ digestEnabled: true, digestTime: "08:00" });
    const [env, setEnv] = useState({ supported: true, ios: false, standalone: false });

    const load = useCallback(async () => {
        try {
            const { data } = await API.get("/api/notifications/config");
            setConfig(data);
            setDigest(data.settings);
            setLoadError(null);
        } catch (err) {
            setLoadError(err.message);
        }
        setDeviceSubscribed(Boolean(await getCurrentSubscription().catch(() => null)));
    }, []);

    useEffect(() => {
        setEnv({ supported: isPushSupported(), ios: isIOS(), standalone: isStandalone() });
        load();
    }, [load]);

    const toggleDevice = async () => {
        setBusy(true);
        try {
            if (deviceSubscribed) {
                await disablePush();
                toast.success("Notifications turned off on this device");
            } else {
                await enablePush(config?.vapidPublicKey);
                toast.success("Notifications turned on for this device");
            }
            await load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBusy(false);
        }
    };

    const saveDigest = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put("/api/notifications/settings", digest);
            setDigest(data);
            toast.success("Daily summary saved");
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const sendTest = async () => {
        try {
            const { data } = await API.post("/api/notifications/test");
            const summary = Object.entries(data.results)
                .map(([name, r]) => `${name}: ${r.sent ? `sent to ${r.sent}` : r.error || r.skipped}`)
                .join(" · ");
            toast.success(`Test sent — ${summary}`, { duration: 6000 });
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    if (loadError) {
        return (
            <div className="task-form-container">
                <h2>Reminders</h2>
                <p className="error">Couldn&apos;t reach the server: {loadError}</p>
                <button type="button" onClick={load}>Retry</button>
            </div>
        );
    }
    if (!config) return <div className="task-form-container">Loading…</div>;

    const { channels } = config;
    const needsInstall = env.ios && !env.standalone;

    return (
        <div className="task-form-container settings">
            <Link href="/">&larr; Back to calendar</Link>
            <h2>Reminders</h2>
            <p className="hint">
                Reminders are sent at the time you choose on each task, plus an optional morning summary.
                Times use the server&apos;s time zone ({config.timeZone}).
            </p>

            <section>
                <h3>This device (browser &amp; phone)</h3>
                {needsInstall ? (
                    <p className="hint">
                        On iPhone/iPad, first add this app to your Home Screen (Share → <b>Add to Home Screen</b>),
                        open it from there, then come back to this page to turn notifications on.
                    </p>
                ) : !env.supported ? (
                    <p className="hint">This browser doesn&apos;t support push notifications.</p>
                ) : !channels.webPush.configured ? (
                    <p className="hint">Push isn&apos;t set up on the server yet (VAPID keys missing — see the README).</p>
                ) : (
                    <>
                        <Status ok={deviceSubscribed}>{deviceSubscribed ? "On for this device" : "Off for this device"}</Status>
                        <button type="button" className="primary" onClick={toggleDevice} disabled={busy}>
                            {deviceSubscribed ? "Turn off on this device" : "Turn on notifications"}
                        </button>
                    </>
                )}
                <p className="hint">{channels.webPush.devices} device(s) receiving push.</p>
            </section>

            <section>
                <h3>Email</h3>
                {channels.email.configured
                    ? <Status ok>Sending to {channels.email.to}</Status>
                    : <Status ok={false}>Not set up (add SMTP settings to the server&apos;s .env)</Status>}
            </section>

            <section>
                <h3>Phone app</h3>
                <Status ok={channels.expo.devices > 0}>
                    {channels.expo.devices > 0 ? `${channels.expo.devices} phone(s) connected` : "No phone app connected"}
                </Status>
            </section>

            <form onSubmit={saveDigest}>
                <h3>Morning summary</h3>
                <label className="inline">
                    <input
                        type="checkbox"
                        checked={digest.digestEnabled}
                        onChange={(e) => setDigest({ ...digest, digestEnabled: e.target.checked })}
                    />
                    Send a summary of today&apos;s and overdue tasks
                </label>
                <div>
                    <label htmlFor="digest-time">Send at</label>
                    <input
                        id="digest-time"
                        type="time"
                        value={digest.digestTime}
                        disabled={!digest.digestEnabled}
                        onChange={(e) => setDigest({ ...digest, digestTime: e.target.value })}
                    />
                </div>
                <button type="submit">Save summary settings</button>
            </form>

            <section>
                <button type="button" className="secondary" onClick={sendTest}>Send a test notification</button>
            </section>
        </div>
    );
}
