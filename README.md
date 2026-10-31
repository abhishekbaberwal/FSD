# SmartJobs — Smart Job Portal for Students & Freshers (MERN Stack)

> **A Complete, Production-Grade Full-Stack MERN Application for College Campus Placements, Student Career Opportunities, and Recruiter Hiring Pipelines.**

---

## 📌 1. Project Overview

**Smart Job Portal for Students** is a modern, responsive, and secure web application designed specifically to empower college students and freshers to discover verified jobs and internships, build and manage technical profiles, upload and preview resumes, submit applications with 1-click convenience, and track application progress in real-time.

It provides a three-tiered role-based system:
1. **Student Module**: Discover jobs, live keyword search, multi-faceted filtering, profile management, resume upload/download, 1-click apply, application tracking with progression badges, and saved job bookmarks.
2. **Recruiter Module**: Manage company profiles, publish new job openings, edit/close/delete listings, review candidate applicants, inspect candidate profiles, download applicant resumes, and update application status (Applied → Under Review → Shortlisted → Selected / Rejected) with personalized candidate feedback and automatic in-app notifications.
3. **Admin Module**: Executive platform analytics, system-wide metrics, student and recruiter account moderation (activate/deactivate/delete), job oversight, and complete application audit trails.

---

## 🛠️ 2. Genuine MERN Stack Architecture

This project is built from scratch as a true **MERN** application with clean separation of concerns:

| Layer | Technology | Key Libraries / Frameworks |
|---|---|---|
| **Frontend** | **React.js 18 + Vite** | React Router DOM v6, Axios, Lucide Icons, Custom Design System CSS |
| **Backend** | **Node.js + Express.js** | Express REST APIs, JWT (jsonwebtoken), bcryptjs, Multer, Nodemailer, Morgan |
| **Database** | **MongoDB + Mongoose** | Mongoose ODM, TTL Indexing, Compound Unique Indexes, Aggregation Pipelines |
| **Authentication** | **JWT Bearer Tokens** | bcrypt password hashing (10 salt rounds), Protected routes, Role-based middleware |

---

## 🔑 3. Demo Credentials (For College Viva & Demonstration)

The database is pre-seeded with verified test accounts and realistic applications for instant examination testing:

| Role | Email Address | Password | Permissions & Features |
|---|---|---|---|
| **System Admin** | `admin@smartjobs.com` | `Admin@123` | Platform analytics, User management, Job oversight, Audit log |
| **Recruiter** | `recruiter@techcorp.com` | `Recruiter@123` | TechNova company profile, Job posting, Applicant management, Status updates |
| **Recruiter 2** | `sarah@codecraft.io` | `Recruiter@123` | CodeCraft Labs company profile, Software engineering openings |
| **Student** | `student@college.edu` | `Student@123` | Aditya Sharma, B.Tech CSE, Resume attached, Applications in progress |
| **Student 2** | `priya@college.edu` | `Student@123` | Priya Patel, B.Sc Data Science, Python & SQL skills |

*Quick-Fill Buttons:* The Login page features one-click quick-fill buttons for Student, Recruiter, and Admin so examiners can test all roles effortlessly.

---

## 🚀 4. Installation & Local Setup

### Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** (Local instance running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### Step 1: Install Dependencies
```bash
# From root directory:
npm run install:all
```
*(Or install separately inside `backend` and `frontend` folders: `cd backend && npm install` then `cd ../frontend && npm install`)*

### Step 2: Seed the Database
```bash
# Populates MongoDB with seed users, 10 realistic jobs, applications, and notifications
npm run seed
```

### Step 3: Run the Servers
Open two terminal windows:

**Terminal 1 — Backend API Server (Port 5000):**
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 — Frontend React App (Port 5173):**
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

Now open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 📡 5. REST API Documentation

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` — Register student or recruiter account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Fetch current user profile (Protected)
- `POST /api/auth/forgot-password` — Generate secure reset token & dispatch Nodemailer email
- `POST /api/auth/reset-password/:token` — Validate token and set new password
- `PUT /api/auth/update-password` — Change password when logged in (Protected)

### Jobs Routes (`/api/jobs`)
- `GET /api/jobs` — Browse & search jobs with live pagination, category, type, location filters
- `GET /api/jobs/featured` — Fetch featured opportunities for home page
- `GET /api/jobs/categories` — Get category summaries with active counts
- `GET /api/jobs/:id` — Get complete job description with responsibilities and requirements
- `POST /api/jobs` — Create new job posting (Recruiter / Admin)
- `PUT /api/jobs/:id` — Update job opening (Recruiter / Admin)
- `DELETE /api/jobs/:id` — Delete job opening and cascade remove applications (Recruiter / Admin)
- `GET /api/jobs/recruiter/my-jobs` — List recruiter's published jobs with applicant count
- `POST /api/jobs/:id/save` — Toggle bookmark / saved job (Student)
- `GET /api/jobs/saved/all` — List student's bookmarked jobs (Student)

### Applications Routes (`/api/applications`)
- `POST /api/applications` — Apply for a job with resume attachment (Student)
- `GET /api/applications/my` — Track student's applications with status history (Student)
- `GET /api/applications/job/:jobId` — View applicants for a specific job (Recruiter / Admin)
- `PUT /api/applications/:id/status` — Update status (Applied / Under Review / Shortlisted / Selected / Rejected) and notify candidate
- `DELETE /api/applications/:id/withdraw` — Withdraw student application (Student)
- `GET /api/applications/:id/resume` — Securely stream / download candidate resume

### User Profile Routes (`/api/users`)
- `PUT /api/users/profile` — Update student profile, education, skills, projects (Student)
- `POST /api/users/resume` — Upload resume document (`.pdf`, `.doc`, `.docx`) (Student)
- `POST /api/users/avatar` — Upload profile photo
- `PUT /api/users/company` — Update recruiter company details (Recruiter)
- `GET /api/users/profile/:id` — View full candidate profile (Recruiter / Admin)

### Admin Routes (`/api/admin`)
- `GET /api/admin/stats` — Platform metrics & status distribution analytics
- `GET /api/admin/users` — Search & list students or recruiters
- `PUT /api/admin/users/:id/toggle-status` — Activate or deactivate user accounts
- `DELETE /api/admin/users/:id` — Delete user account
- `GET /api/admin/jobs` — Oversight of all platform jobs
- `GET /api/admin/applications` — Audit log of all applications

### Notifications Routes (`/api/notifications`)
- `GET /api/notifications` — Fetch user's in-app notifications & unread count
- `PUT /api/notifications/:id/read` — Mark notification as read
- `PUT /api/notifications/read-all` — Mark all notifications as read

---

## 🗄️ 6. Database Models & Schema Design

- **User**: Name, email (unique), password (bcrypt), role (`student`, `recruiter`, `admin`), isActive, profile (bio, headline, phone, location, education, skills, projects, resumeUrl), company (name, website, industry, location, description).
- **Job**: Title, company, location, type (`Full-time`, `Internship`, `Part-time`, `Remote`), salary, experience, category, skills, description, responsibilities, requirements, postedBy (ref User), status (`Open`, `Closed`), applicantsCount, text search index.
- **Application**: Job (ref Job), student (ref User), recruiter (ref User), resumeUrl, resumeOriginalName, coverNote, status (`Applied`, `Under Review`, `Shortlisted`, `Rejected`, `Selected`), statusHistory. **Compound unique index on `(job, student)` prevents duplicate submissions.**
- **Notification**: Recipient (ref User), sender, type, title, message, link, isRead, timestamps.
- **SavedJob**: Student (ref User), job (ref Job), unique compound index.
- **PasswordResetToken**: User (ref User), tokenHash, expiresAt (MongoDB TTL index automatic expiration), used.

---

## 🛡️ 7. Security Highlights

1. **Password Hashing**: Implemented via `bcryptjs` with salt rounds on Mongoose pre-save hooks.
2. **JWT Authentication**: Secure Bearer tokens with expiration.
3. **Role-Based Authorization**: Middleware ensures students cannot access recruiter endpoints, recruiters cannot access other recruiters' applicants, and admin routes are strictly guarded.
4. **Duplicate Application Prevention**: Enforced at both database index and controller layers.
5. **Secure File Uploads**: Multer validates file types (`.pdf`, `.doc`, `.docx` for resumes; `.jpg`, `.png`, `.webp` for avatars) and size limits.
6. **Protected Resume Downloads**: Only the applicant student, the recruiter who posted the job, or an administrator can access uploaded resume files.

---

## 👨‍💻 Author & Attribution
- **Developer**: Abhishek Baberwal
- **Project**: Smart Job Portal for Students & Freshers
- **Degree**: Full-Stack Development / Computer Science
