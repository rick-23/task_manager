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

## API Endpoints

- `GET    /api/tasks` - Get all tasks
- `POST   /api/tasks` - Create a new task
- `PATCH  /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

---

## Folder Structure

```
backend/
  ├── data/
  ├── routes/
  └── index.js
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
