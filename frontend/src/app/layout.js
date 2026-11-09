
import { Toaster } from "react-hot-toast";
import "./globals.css";
import QueryProvider from "./QueryProvider";
import ReduxProvider from "./store/ReduxProvider";
import ServiceWorkerRegistrar from "./components/ServiceWorkerRegistrar";

export const metadata = {
  title: "Task Manager",
  description: "Calendar task manager with reminders",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Tasks", statusBarStyle: "default" },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#4f8cff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <QueryProvider>
            <main>
              <Toaster />
              <ServiceWorkerRegistrar />
              {children}
            </main>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
