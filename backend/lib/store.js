"use strict";
/**
 * Tiny JSON-file "database" with seeded jobs.
 * Synchronous reads/writes are fine at student-project scale; writes are atomic
 * (temp file + rename) so a crash can't leave a half-written db.json.
 */
const fs = require("fs");
const path = require("path");
const { SESSION_TTL_MS, hashToken } = require("./auth");

const APPLICATION_STATUSES = ["Applied", "In Review", "Shortlisted", "Rejected", "Selected"];

const SEED_JOBS = [
  {
    id: 1, title: "Frontend Developer Intern", company: "TechNova", location: "Jaipur",
    type: "Internship", salary: "₹15,000/month", experience: "Fresher", category: "Web Development",
    skills: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    description: "Work with our product team to build and maintain responsive, user-facing features for our web applications. You'll get hands-on experience with real production code from day one.",
    responsibilities: ["Build responsive UI components using HTML, CSS and JavaScript", "Collaborate with designers to implement pixel-accurate layouts", "Fix bugs and improve performance of existing pages", "Participate in code reviews and daily stand-ups"],
    requirements: ["Solid understanding of HTML, CSS and JavaScript fundamentals", "Familiarity with Bootstrap or a similar CSS framework", "Pursuing or recently completed a degree in Computer Science or a related field", "Good communication and willingness to learn"],
  },
  {
    id: 2, title: "Software Engineer (Fresher)", company: "CodeCraft Labs", location: "Bengaluru",
    type: "Full-time", salary: "₹5.5 LPA", experience: "Fresher", category: "Software Development",
    skills: ["Java", "SQL", "DSA"],
    description: "Join our engineering team to design and build backend services that power our core product. Ideal for a fresher who wants to grow into a strong software engineer.",
    responsibilities: ["Write clean, maintainable Java code for backend services", "Design and query relational databases using SQL", "Debug and resolve production issues with guidance", "Write unit tests for new features"],
    requirements: ["Strong fundamentals in Data Structures and Algorithms", "Working knowledge of Java and SQL", "B.Tech/B.E. in Computer Science or a related field", "Problem-solving mindset"],
  },
  {
    id: 3, title: "Data Analyst Intern", company: "InsightWorks", location: "Remote",
    type: "Internship", salary: "₹12,000/month", experience: "Fresher", category: "Data Science",
    skills: ["Excel", "SQL", "Python"],
    description: "Support our analytics team by cleaning, analysing and visualising data to help drive business decisions across the company.",
    responsibilities: ["Clean and organise raw datasets using Excel and Python", "Write SQL queries to pull data from internal databases", "Build simple dashboards and reports for stakeholders", "Present findings in weekly team syncs"],
    requirements: ["Basic knowledge of Excel and SQL", "Exposure to Python (pandas) is a plus", "Comfortable working with numbers and spreadsheets", "Pursuing a degree in a quantitative field"],
  },
  {
    id: 4, title: "UI/UX Design Intern", company: "PixelCraft Studio", location: "Jaipur",
    type: "Internship", salary: "₹10,000/month", experience: "Fresher", category: "UI/UX Design",
    skills: ["Figma", "Adobe XD", "Wireframing"],
    description: "Help design clean, usable interfaces for our client projects, from wireframes to high-fidelity prototypes.",
    responsibilities: ["Create wireframes and prototypes in Figma", "Assist senior designers with visual design and design systems", "Run basic usability reviews of existing screens", "Present design concepts to the team"],
    requirements: ["Basic proficiency in Figma or Adobe XD", "An eye for layout, spacing and colour", "A portfolio of personal or academic design work is a plus", "Pursuing a degree in Design or a related field"],
  },
  {
    id: 5, title: "Cyber Security Analyst (Fresher)", company: "SecureNet Systems", location: "Pune",
    type: "Full-time", salary: "₹4.8 LPA", experience: "Fresher", category: "Cyber Security",
    skills: ["Networking", "Linux", "Security Basics"],
    description: "Join our security operations team to help monitor, detect and respond to security incidents across client networks.",
    responsibilities: ["Monitor security alerts and logs for suspicious activity", "Assist in vulnerability assessments", "Document incidents and escalate as needed", "Learn and apply security best practices under mentorship"],
    requirements: ["Understanding of networking fundamentals", "Comfortable working in a Linux environment", "Degree in Computer Science, IT or a related field", "Certifications such as Security+ are a plus, not required"],
  },
  {
    id: 6, title: "Digital Marketing Intern", company: "BrandBoost Media", location: "Remote",
    type: "Internship", salary: "₹8,000/month", experience: "Fresher", category: "Digital Marketing",
    skills: ["SEO", "Content Writing", "Social Media"],
    description: "Support our marketing team in growing organic reach through content, SEO and social media campaigns.",
    responsibilities: ["Research keywords and assist with on-page SEO", "Write and edit content for blogs and social media", "Track campaign performance using basic analytics tools", "Coordinate with the design team on creative assets"],
    requirements: ["Good written English and communication skills", "Basic understanding of SEO concepts", "Interest in digital marketing and social media", "Pursuing any bachelor's degree"],
  },
  {
    id: 7, title: "Backend Developer (Part-time)", company: "ServerStack", location: "Hyderabad",
    type: "Part-time", salary: "₹20,000/month", experience: "0–1 Years", category: "Web Development",
    skills: ["Node.js", "MongoDB", "REST APIs"],
    description: "Build and maintain backend APIs that power our web and mobile applications, alongside your studies, with flexible hours.",
    responsibilities: ["Build REST APIs using Node.js", "Design and query MongoDB collections", "Write basic API documentation", "Fix bugs reported by the QA team"],
    requirements: ["Basic knowledge of Node.js and REST APIs", "Familiarity with MongoDB or another NoSQL database", "Able to commit about 20 hours a week", "Eagerness to learn backend fundamentals"],
  },
  {
    id: 8, title: "Machine Learning Intern", company: "InsightWorks", location: "Remote",
    type: "Internship", salary: "₹18,000/month", experience: "0–1 Years", category: "Data Science",
    skills: ["Python", "Pandas", "scikit-learn"],
    description: "Assist our data science team in building and evaluating machine learning models for real business problems.",
    responsibilities: ["Preprocess and clean datasets using pandas", "Build and evaluate basic ML models using scikit-learn", "Document experiments and results", "Present findings to the data science team"],
    requirements: ["Working knowledge of Python and pandas", "Basic understanding of machine learning concepts", "Exposure to scikit-learn is a plus", "Pursuing a degree in CS, Statistics or a related field"],
  },
  {
    id: 9, title: "QA Engineer (Junior)", company: "CodeCraft Labs", location: "Bengaluru",
    type: "Full-time", salary: "₹4.2 LPA", experience: "1–3 Years", category: "Software Development",
    skills: ["Manual Testing", "Selenium", "Test Cases"],
    description: "Support our QA team in testing new features and maintaining automated test suites. A good next step after an internship or a first role.",
    responsibilities: ["Write and execute manual test cases", "Report and track bugs to resolution", "Build and maintain basic Selenium test scripts", "Participate in release testing cycles"],
    requirements: ["Attention to detail and a methodical approach", "Understanding of software testing concepts", "Some Selenium exposure from an internship or project", "Degree in Computer Science or a related field"],
  },
  {
    id: 10, title: "Graphic Design Intern (Part-time)", company: "PixelCraft Studio", location: "Jaipur",
    type: "Part-time", salary: "₹9,000/month", experience: "0–1 Years", category: "UI/UX Design",
    skills: ["Photoshop", "Illustrator", "Typography"],
    description: "Support our creative team in designing marketing assets, social media graphics and print materials, with hours that fit around classes.",
    responsibilities: ["Design social media graphics and marketing assets", "Assist with print materials such as brochures and banners", "Maintain brand consistency across deliverables", "Incorporate feedback from senior designers"],
    requirements: ["Basic proficiency in Photoshop and Illustrator", "A portfolio of personal or academic design work", "Good sense of layout, colour and typography", "Pursuing a degree in Design or a related field"],
  },
];

/** Lower-case and unify dash characters so "0–1 Years" matches "0-1 years". */
function norm(value) {
  return String(value == null ? "" : value)
    .toLowerCase()
    .replace(/[‐-―−]/g, "-")
    .trim();
}

function createStore(dataDir) {
  const dbPath = path.join(dataDir, "db.json");
  let db = null;

  function emptyDb() {
    return { users: [], sessions: [], applications: [], jobs: SEED_JOBS.map((j) => ({ ...j })), counters: { user: 0, application: 0 } };
  }

  function save() {
    fs.mkdirSync(dataDir, { recursive: true });
    const tmp = dbPath + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
    fs.renameSync(tmp, dbPath);
  }

  function load() {
    fs.mkdirSync(dataDir, { recursive: true });
    if (fs.existsSync(dbPath)) {
      try {
        db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      } catch (err) {
        // Corrupt file: keep a copy for inspection and start clean.
        fs.copyFileSync(dbPath, `${dbPath}.corrupt-${Date.now()}`);
        db = emptyDb();
      }
      db.users = db.users || [];
      db.sessions = db.sessions || [];
      db.applications = db.applications || [];
      db.counters = db.counters || { user: db.users.length, application: db.applications.length };
      if (!Array.isArray(db.jobs) || db.jobs.length === 0) db.jobs = SEED_JOBS.map((j) => ({ ...j }));
    } else {
      db = emptyDb();
    }
    save();
  }

  load();

  const publicUser = (u) => (u ? { id: u.id, name: u.name, email: u.email, role: u.role } : null);

  return {
    publicUser,
    counts: () => ({ jobs: db.jobs.length, users: db.users.length, applications: db.applications.length }),

    // ---- jobs ----
    listJobs(filters = {}) {
      const search = norm(filters.search);
      const location = norm(filters.location);
      const category = norm(filters.category);
      const type = norm(filters.type);
      const experience = norm(filters.experience);
      return db.jobs.filter((j) => {
        if (category && norm(j.category) !== category) return false;
        if (type && norm(j.type) !== type) return false;
        if (experience && norm(j.experience) !== experience) return false;
        if (location && !norm(j.location).includes(location)) return false;
        if (search) {
          const hay = norm([j.title, j.company, j.location, j.category, ...(j.skills || [])].join(" "));
          if (!hay.includes(search)) return false;
        }
        return true;
      });
    },
    getJob: (id) => db.jobs.find((j) => j.id === Number(id)) || null,

    // ---- users ----
    findUserByEmail: (email) => db.users.find((u) => u.email === norm(email)) || null,
    findUserById: (id) => db.users.find((u) => u.id === id) || null,
    createUser({ name, email, passwordHash, role }) {
      const user = { id: ++db.counters.user, name, email: norm(email), passwordHash, role, createdAt: new Date().toISOString() };
      db.users.push(user);
      save();
      return user;
    },

    // ---- sessions ----
    createSession(userId, token) {
      const now = Date.now();
      db.sessions = db.sessions.filter((s) => s.expiresAt > now); // prune expired
      db.sessions.push({ tokenHash: hashToken(token), userId, createdAt: now, expiresAt: now + SESSION_TTL_MS });
      save();
    },
    findUserByToken(token) {
      const th = hashToken(token);
      const s = db.sessions.find((x) => x.tokenHash === th);
      if (!s || s.expiresAt <= Date.now()) return null;
      return db.users.find((u) => u.id === s.userId) || null;
    },
    deleteSession(token) {
      const th = hashToken(token);
      const before = db.sessions.length;
      db.sessions = db.sessions.filter((s) => s.tokenHash !== th);
      if (db.sessions.length !== before) save();
    },

    // ---- applications ----
    findApplication: (userId, jobId) => db.applications.find((a) => a.userId === userId && a.jobId === jobId) || null,
    createApplication(userId, jobId) {
      const app = { id: ++db.counters.application, userId, jobId, status: "Applied", appliedAt: new Date().toISOString() };
      db.applications.push(app);
      save();
      return app;
    },
    listApplications(userId) {
      return db.applications
        .filter((a) => a.userId === userId)
        .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
        .map((a) => ({ ...a, job: db.jobs.find((j) => j.id === a.jobId) || null }));
    },
  };
}

module.exports = { createStore, SEED_JOBS, APPLICATION_STATUSES, norm };
