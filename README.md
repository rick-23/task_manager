# Task Manager

A full-stack task management calendar built with React, Redux, React Query, and Express.js.  
Users can create, edit, assign, and drag-and-drop tasks on a calendar interface.

---

## Features

- 📅 **Calendar View:** Visualize tasks by date, with drag-and-drop support.
- 📝 **Task CRUD:** Create, edit, and delete tasks with validation.
- 📦 **Unassigned Tasks:** Manage tasks not yet scheduled.
- 🔄 **Drag & Drop:** Move tasks between days or from unassigned to calendar.
- 🔍 **Search:** Filter tasks by title.
- ⚡ **Optimistic UI:** Fast updates with React Query and Redux.
- 🔗 **Express API:** Persistent backend with file-based storage.
- ⏰ **Reminders:** Give a task a time and a reminder ("at the time", "15 minutes before", "1 day before"…) and get notified by **email**, **browser push**, and **phone notifications**.
- 📋 **Morning summary:** A daily message listing today's and overdue tasks, at a time you choose.
- ✅ **Done status:** Mark tasks done; done tasks stop reminding you.
- 📱 **Installable app:** Add it to your phone's home screen and get native notifications.

---

## Tech Stack

- **Frontend:** React, Redux Toolkit, React Query, Next.js, Axios
- **Backend:** Express.js, Node.js
- **State Management:** Redux Toolkit, React Query
- **Styling:** CSS Modules / global.css

---

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/rick-23/task_manager.git
cd task_manager
```

### 2. Install dependencies

#### Backend

```sh
cd backend
npm install
```

#### Frontend

```sh
cd ../frontend
npm install
```

### 3. Start the servers

#### Backend

```sh
cd backend
npm start
# or
node index.js
```

#### Frontend

```sh
cd ../frontend
npm run dev
```

---

## Setting up reminders

The backend checks for due reminders every minute. Each channel is optional and turns on when its settings exist in `backend/.env` (copy `backend/.env.example`).

1. **Time zone** – set `TZ` (e.g. `Asia/Kolkata`). Task times and the morning summary use it.
2. **Email** – fill in the `SMTP_*` values and `NOTIFY_EMAIL` (the address reminders go to). With Gmail: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, your address as `SMTP_USER`, and an [app password](https://myaccount.google.com/apppasswords) as `SMTP_PASS`.
3. **Browser & phone push** – run `npm run vapid-keys` in `backend/` once and paste the two keys into `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`.
4. Start the backend, open the app, go to **🔔 Reminders** and tap **Turn on notifications** on each device. Use **Send a test notification** to check every channel.

### Getting notifications on your phone

Push requires the app to be served over **HTTPS** (only `localhost` is exempt), so deploy the frontend and backend (or use a tunnel such as Cloudflare Tunnel / ngrok) and set `NEXT_PUBLIC_API_URL` to the backend's HTTPS URL.

- **Android (Chrome):** open the site, tap ⋮ → **Install app**, then turn on notifications in 🔔 Reminders.
- **iPhone / iPad (iOS 16.4+):** open the site in Safari, tap Share → **Add to Home Screen**, open the app *from the home screen*, then turn on notifications in 🔔 Reminders.

Notifications then appear on the lock screen like any other app. Tapping one opens the task.

The backend can also deliver to a native Expo phone app: the app registers its push token with `POST /api/notifications/expo/register`.

> **Note:** the API has no login. Keep it on a private network or put it behind authentication (for example Cloudflare Access) before exposing it to the internet, and set `CORS_ORIGIN` to your frontend's URL.

## API Endpoints

- `GET    /api/tasks` - Get all tasks
- `POST   /api/tasks` - Create a task (`title`, `description`, optional `date` YYYY-MM-DD, `time` HH:MM, `remindBefore` minutes)
- `PATCH  /api/tasks/:id` - Update any of the task's fields (including `done`)
- `DELETE /api/tasks/:id` - Delete a task
- `GET    /api/notifications/config` - Channel status and push public key
- `PUT    /api/notifications/settings` - Morning summary (`digestEnabled`, `digestTime`)
- `POST   /api/notifications/webpush/subscribe` / `unsubscribe` - Browser/phone push devices
- `POST   /api/notifications/expo/register` / `unregister` - Native Expo app devices
- `POST   /api/notifications/test` - Send a test notification on every channel

---

## Folder Structure

```
backend/
  ├── data/        # db.json (tasks), notify.json (push devices, summary settings)
  ├── lib/         # store, reminder rules, notifier (email/web push/Expo), scheduler
  ├── routes/
  ├── app.js
  └── index.js     # starts the server and the reminder scheduler
frontend/
  ├── src/
      ├── app/
      ├── components/
      ├── hooks/
      ├── store/
      └── utils/
```

---

## Customization

- Update API URLs in `frontend/src/app/utils/apiUtils.js` if needed.
- Adjust CORS or port settings in `backend/index.js`.

---
