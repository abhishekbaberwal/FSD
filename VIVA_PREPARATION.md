# College Viva & Demonstration Guide — Smart Job Portal (MERN Stack)

This guide prepares you for questions commonly asked by college professors, external examiners, and technical evaluators during the project viva and demonstration.

---

## 🎯 1. Demonstration Workflow for Evaluators (5-Minute Walkthrough)

Follow this sequence to showcase the complete project:

### Step 1: Homepage & Public Discovery
1. Open `http://localhost:5173`.
2. Point out:
   - Clean, modern design system with Deep Indigo and Warm Amber accents.
   - Hero section with live search and location input.
   - Domain Categories grid dynamically pulling active job counts from MongoDB.
   - Featured Opportunities section rendering live jobs from the database.

### Step 2: Live Job Search & Multi-Filters
1. Click **Browse Jobs** in the navigation bar.
2. Demonstrate live filtering:
   - Select Category: `Web Development` or `Software Development`.
   - Select Job Type: `Internship` or `Full-time`.
   - Type a keyword like `React` or `Java` in the search box.
   - Notice the instant results, count badges, and sorting options.

### Step 3: Student Module & 1-Click Application
1. Click **Log In** in the navbar.
2. Click the quick **Student** demo button (`student@college.edu` / `Student@123`) and click **Sign In**.
3. Point out the **Student Dashboard**:
   - Status cards: Total Applied, In Review, Shortlisted, Selected.
   - "My Applications" tab with live progression badges and recruiter notes.
   - "Saved Bookmarks" tab.
4. Click **My Profile & Resume** in navbar:
   - Show uploaded resume document (`Aditya_Sharma_Resume.pdf`).
   - Demonstrate downloading the resume.
   - Show education qualifications, technical skill chips, and project portfolio.
5. Go to **Browse Jobs**, open a job (e.g. *Data Analyst Intern*), and click **Apply Now**:
   - Show how the modal lets the student use their saved profile resume or upload a custom one.
   - Submit the application and show the immediate success state.
   - Try applying again to demonstrate the **duplicate application prevention**!

### Step 4: Recruiter Module & Hiring Pipeline
1. Click user profile in navbar → **Sign Out**.
2. Click **Log In** → click the **Recruiter** demo button (`recruiter@techcorp.com` / `Recruiter@123`) → **Sign In**.
3. Point out the **Recruiter Dashboard**:
   - Overview metrics: Total Job Postings, Active Openings, Total Applicants.
   - Company profile details.
4. Click **Applicants** on *Frontend Developer Intern*:
   - View candidate list (Aditya Sharma).
   - Click **Download Resume** to demonstrate secure resume file delivery.
   - Click **Profile** to view candidate's academic background and projects.
   - Click **Update Status**: change status from `Under Review` to `Shortlisted`, enter recruiter note, and save.

### Step 5: Student Notification Receipt
1. Sign out of recruiter and log back in as student (`student@college.edu`).
2. Notice the **bell icon** in the navbar with an unread badge counter!
3. Click the notification: see the live update informing the student that TechNova has shortlisted their application!

### Step 6: Admin Oversight Portal
1. Sign out and log in as Admin (`admin@smartjobs.com` / `Admin@123`).
2. Demonstrate the **Admin Dashboard**:
   - Platform metrics & graphical status distribution progress bars.
   - "Students Management": search students, activate/deactivate accounts.
   - "Recruiters Management": moderate company accounts.
   - "Jobs Oversight": manage platform-wide listings.
   - "Applications Log": complete system audit trail.

---

## ❓ 2. Top Viva Questions and Model Answers

### Q1: What is the MERN stack and why did you choose it over alternatives like PHP or Java EE?
> **Answer:** MERN stands for **M**ongoDB (NoSQL database), **E**xpress.js (backend web framework), **R**eact.js (frontend library), and **N**ode.js (JavaScript runtime environment).
> 
> We chose MERN because:
> 1. **Single Language (JavaScript/ES6+)**: Using JavaScript across both client and server reduces context switching and allows shared data validation patterns.
> 2. **Component-Based UI**: React enables reusable components, declarative DOM updates via the Virtual DOM, and fast rendering.
> 3. **Flexible Schema**: MongoDB's JSON-like document structure allows rich embedded schemas for student education, skills, and status history without complex multi-table joins.
> 4. **High Concurrency**: Node.js uses an asynchronous, non-blocking event-driven I/O model, making it ideal for handling hundreds of concurrent student applicants.

### Q2: How does authentication and session management work in your application?
> **Answer:** We implemented stateless **JWT (JSON Web Token)** authentication combined with **bcryptjs** password hashing:
> 1. When registering or logging in, passwords are never stored in plain text. A pre-save Mongoose hook hashes the password using bcrypt with 10 salt rounds.
> 2. Upon successful login, the server generates a cryptographically signed JWT containing the user's MongoDB `_id` and role, signed with an environment secret (`JWT_SECRET`) and a 7-day expiration.
> 3. The frontend stores this token and attaches it to every subsequent API request in the `Authorization: Bearer <token>` header via Axios interceptors.
> 4. The backend `protect` middleware verifies the signature, fetches the active user, and attaches `req.user`. Role-based middleware (`authorize('recruiter')`, `authorize('admin')`) ensures strict access control.

### Q3: How do you prevent duplicate job applications?
> **Answer:** We implemented defense-in-depth across two distinct layers:
> 1. **Database Layer**: In the Mongoose `Application` schema, we defined a compound unique index:
>    `applicationSchema.index({ job: 1, student: 1 }, { unique: true });`
>    This makes it impossible for MongoDB to insert duplicate applications even during race conditions.
> 2. **Controller Layer**: In `applyForJob`, we query `Application.findOne({ job: jobId, student: req.user._id })`. If an application exists, the API immediately returns HTTP `409 Conflict`.
> 3. **Frontend Layer**: The job details page disables the Apply button and displays an "Applied" badge if the student has already applied.

### Q4: How is file upload handled securely?
> **Answer:** File uploads (resumes and avatars) are managed via **Multer**:
> 1. **MIME & Extension Validation**: Resumes only accept `.pdf`, `.doc`, `.docx`. Profile avatars only accept image MIME types (`.jpg`, `.jpeg`, `.png`, `.webp`).
> 2. **File Size Limits**: Resumes are capped at 5 MB; avatars at 2 MB.
> 3. **Sanitized Storage**: Files are renamed with timestamp prefixes and sanitized filenames (`resume_${Date.now()}_filename.pdf`) to avoid directory traversal or overwrite collisions.
> 4. **Access Control**: Resumes are served via a protected route (`GET /api/applications/:id/resume`) that validates whether `req.user` is either the student who uploaded the resume, the recruiter who posted the job, or an administrator before streaming the file.

### Q5: How does the password reset workflow function?
> **Answer:**
> 1. When a user requests a reset (`POST /api/auth/forgot-password`), the backend generates a 32-byte cryptographically secure random token (`crypto.randomBytes(32)`).
> 2. The SHA-256 hash of this token is saved in the `PasswordResetToken` collection with a 1-hour expiration.
> 3. Using **Nodemailer**, an email containing a link with the unhashed token (`/reset-password/:token`) is sent. If custom SMTP is not provided, Nodemailer automatically creates an Ethereal test inbox providing a clickable preview URL.
> 4. When the user submits a new password, the backend matches the token hash, verifies `expiresAt > Date.now()` and `used === false`, updates the user's password with bcrypt, and invalidates the token.

### Q6: Why did you use Vite instead of Create React App (CRA)?
> **Answer:** Create React App is officially deprecated. **Vite** leverages native ES modules (ESM) in the browser and uses Rollup/esbuild, providing instant server start (<800ms vs 15-30 seconds with Webpack) and lightning-fast Hot Module Replacement (HMR).

### Q7: Explain your MongoDB Schema Relationships and Population.
> **Answer:**
> - `User` is referenced by `Job` (`postedBy: ObjectId ref User`).
> - `Application` references both `Job` (`job: ObjectId ref Job`), `User` (`student: ObjectId ref User`), and `User` (`recruiter: ObjectId ref User`).
> - We utilize Mongoose `.populate('student', 'name email profile')` and `.populate('job', 'title company location')` to perform efficient joins on demand while keeping the database normalized.
> - Nested subdocuments (e.g. `education`, `projects`, `statusHistory`) are embedded directly within their parent document because they are always queried and updated in the context of that specific student or application.

---

## 📋 3. Project Summary Sheet for Examiner

- **Project Name:** Smart Job Portal for Students & Freshers
- **Candidate Name:** Abhishek Baberwal
- **Stack:** MERN (MongoDB, Express.js, React.js, Node.js)
- **Primary Modules:** Student Module, Recruiter Module, Administrator Module
- **Security:** bcrypt password hashing, JWT authorization, Multer file filters, CORS protection, duplicate prevention
- **Database Collections:** `users`, `jobs`, `applications`, `notifications`, `savedjobs`, `passwordresettokens`
- **Total API Endpoints:** 24 RESTful endpoints
- **Test Coverage:** Automated end-to-end integration tests verifying auth, role dispatch, applications pipeline, notifications, and admin analytics.
