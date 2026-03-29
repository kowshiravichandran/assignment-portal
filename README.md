# 📚 Mini Project – Assignment Portal

## Setup Instructions

### Step 1 — Extract the ZIP
Extract the `mini project` folder anywhere on your PC.

### Step 2 — Open Command Prompt inside the folder
Click the address bar at the top of the folder → type `cmd` → press Enter.

### Step 3 — Install packages
```
npm install
```
Wait for it to finish (1–2 minutes).

### Step 4 — Start the server
```
npm start
```
You should see:
```
✅ MongoDB Connected Successfully
🚀 Assignment Portal running at http://localhost:5000
```

> **If MongoDB error:** Press Win+R → type `services.msc` → find MongoDB → Right-click → Start → run `npm start` again.

### Step 5 — Create sample accounts (first time only)
Open browser and go to:
```
http://localhost:5000/api/seed
```

### Step 6 — Open the app
```
http://localhost:5000
```

---

## Login Credentials

| Role    | Username | Password |
|---------|----------|----------|
| Student | kowshi   | kowsh21  |
| Teacher | mala     | mala21   |

---

## Features

### Student Dashboard
- ✏️ **Submit Assignment** — Upload PDF (up to 10MB) + optional text answer
- 📋 **Submission History** — View all past submissions with PDF links and feedback
- 🏆 **My Marks** — Score cards with progress bars and average score
- 📅 **Upcoming Assignments** — Assignments assigned by teacher with due date countdowns

### Teacher Dashboard
- ✏️ **Grade Submissions** — Filter by All/Pending/Graded, enter marks and feedback
- 📋 **Student History** — Click any student to see all their submissions
- 📅 **Assign Future Work** — Create assignments with title, subject, due date, assign to all or specific student

### Register Page
- New students can create their own account at `http://localhost:5000/register`
- Password strength indicator
- Username availability check
- Teachers are created only via `/api/seed` for security
