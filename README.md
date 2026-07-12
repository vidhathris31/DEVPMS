# 🚀 DevPMS — AI-Powered IT Project Management Suite

A full-stack **MERN** project management platform built for software development teams. DevPMS combines **MongoDB**, **Express.js**, **React**, and **Node.js** with **Groq AI** to provide intelligent project management, sprint planning, analytics, and team collaboration through a modern, responsive interface.

---

## 📁 Project Structure

```text
devpms/
├── server/                     # Express.js + MongoDB + Groq API
│   ├── src/
│   │   ├── config/             # Database configuration
│   │   ├── models/             # Mongoose models
│   │   ├── controllers/        # Business logic
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Auth, validation, uploads, error handling
│   │   ├── services/           # Groq AI service
│   │   ├── utils/              # Utility functions
│   │   ├── scripts/            # Seed & clear database
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React 18 + Vite
│   ├── src/
│   │   ├── components/         # UI, Layout & Feature components
│   │   ├── pages/              # Application pages
│   │   ├── context/            # Global state
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API services
│   │   ├── theme/              # Light/Dark theme
│   │   ├── utils/
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## ✨ Core Features

* 🔐 **Authentication** — JWT authentication, secure password hashing, and role-based access (Admin, Manager, Member).
* 📂 **Project Management** — Complete CRUD operations, sprint planning, Kanban board, milestones, deployment pipeline, pull requests, budgets, and team assignments.
* ✅ **Task Management** — Cross-project task tracking with priorities, statuses, assignees, due dates, and story points.
* 👨‍💻 **Employee Management** — Employee directory with workload monitoring and skill management.
* ⏱️ **Time Tracking** — Live timer and manual time entries linked to projects and tasks.
* 💬 **Collaboration** — Team discussions through project and task comments.
* 📎 **File Management** — Upload, download, and delete project files with confirmation support.
* 💰 **Budget Tracking** — Expense logging, budget vs. actual comparison, and financial analytics.
* 🔔 **Notifications** — Smart notifications for assignments, uploads, expenses, deadlines, and project activities.
* 📊 **Reports & Analytics** — Portfolio insights, project analytics, and AI-generated reports.
* 🤖 **AI Features** — AI Project Analyst, Sprint Planning, Code Review, Burndown Forecasting, and Technical Debt Analysis powered by **Groq AI**.
* 🎨 **Modern UI** — Responsive design with persistent Light/Dark themes.

---

## 🚀 Getting Started

### 1️⃣ Start MongoDB

Run MongoDB locally or with Docker:

```bash
docker run -p 27017:27017 mongo:7
```

### 2️⃣ Backend

```bash
cd server
cp .env.example .env

# Configure:
# MONGODB_URI
# JWT_SECRET
# GROQ_API_KEY

npm install
npm run seed
npm run dev
```

The backend runs on **http://localhost:4000**.

To reset the database:

```bash
npm run clear
```

or

```bash
npm run clear -- --yes
```

---

### 3️⃣ Frontend

```bash
cd frontend

npm install
npm run dev
```

The frontend runs on **http://localhost:5173**.

---

### 4️⃣ Run with Docker

```bash
docker compose up --build
```

---

## 🏗️ Architecture

* **MongoDB** stores projects, users, employees, tasks, expenses, files, comments, notifications, settings, and AI history.
* **JWT Authentication** protects all API routes except login and registration.
* **Groq AI** powers all AI features through a centralized `/api/ai/chat` endpoint.
* **React Context API** manages authentication, application data, and themes.
* **React Router** provides lazy-loaded routing for improved performance.
* **Express Middleware** handles authentication, validation, uploads, security, and centralized error handling.

---

## 📌 Current Limitations

* 📁 Files are stored locally (`server/uploads`) instead of cloud storage.
* 📧 No email notifications or scheduled report generation.
* 🔐 Roles are limited to **Admin**, **Manager**, and **Member**.
* 🤖 AI functionality requires a valid **Groq API Key**.

---

## ✅ Verification

* ✔️ Frontend production build completes successfully.
* ✔️ Backend passes syntax validation.
* ✔️ Authentication, CRUD operations, validation, routing, and file uploads have been tested.
* ✔️ Configure your own **MongoDB** and **Groq API Key** before running the application.
