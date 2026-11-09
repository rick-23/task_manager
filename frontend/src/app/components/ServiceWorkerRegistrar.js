'use client';
import { useEffect } from "react";
import { registerServiceWorker } from "../utils/pushUtils";

/** Registers the service worker once, so notifications and "Install app" work. */
export default function ServiceWorkerRegistrar() {
    useEffect(() => {
        registerServiceWorker().catch((err) => console.error("Service worker registration failed:", err));
    }, []);
    return null;
}
