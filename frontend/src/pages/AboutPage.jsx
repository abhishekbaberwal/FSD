import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Code2,
  Database,
  Server,
  Layers,
  GraduationCap,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.75rem', padding: '0.35rem 0.85rem' }}>
            <Sparkles size={14} color="#f59e0b" /> About SmartJobs
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Empowering College Students to Launch Meaningful Careers
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            SmartJobs is a production-grade full-stack MERN application engineered to bridge the gap between fresh academic talent and high-growth technology recruiters.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-2 md-grid-cols-1 gap-6" style={{ marginBottom: '3.5rem' }}>
          <div className="card" style={{ padding: '2rem', borderTop: '4px solid var(--primary)' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <GraduationCap size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Our Student Mission
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Most mainstream job boards cater primarily to experienced professionals with 3-5+ years of tenure. SmartJobs is built ground-up to solve the unique challenges freshers face: unverified job leads, ghost applications, and lack of real-time application feedback.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', borderTop: '4px solid var(--accent)' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Our Recruiter Promise
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              We provide technology companies and startups with direct access to pre-screened college talent, standardized candidate profiles, portfolio projects, and downloadable verified resumes with zero hiring agency commissions.
            </p>
          </div>
        </div>

        {/* Full MERN Architecture Showcase for Viva Examination */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '3.5rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Genuine MERN Stack Architecture
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Engineered according to modern industry standards with separation of concerns and robust security.
            </p>
          </div>

          <div className="grid grid-cols-4 md-grid-cols-2 gap-4">
            <div style={{ backgroundColor: 'var(--bg-surface-alt)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍃</div>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#047857' }}>MongoDB</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                NoSQL Database with Mongoose ORM models, indexes, compound uniqueness, and TTL tokens.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface-alt)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1d4ed8' }}>Express.js</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                REST API framework with route controllers, JWT auth, Multer file upload, and CORS.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface-alt)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚛️</div>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0284c7' }}>React.js & Vite</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Single Page Application with React Router v6, Axios interceptors, and custom Design System.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface-alt)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟢</div>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#15803d' }}>Node.js</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Asynchronous JavaScript runtime environment with bcrypt password hashing and Nodemailer.
              </p>
            </div>
          </div>
        </div>

        {/* Project Attribution */}
        <div
          style={{
            backgroundColor: 'var(--primary-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            textAlign: 'center',
            border: '1px solid #c7d2fe',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.35rem' }}>
            Academic Project by Abhishek Baberwal
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto 1.25rem' }}>
            Developed as a Full-Stack Web Development Capstone Project. Incorporating complete role-based authentication, candidate lifecycle management, and secure media uploads.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/jobs" className="btn btn-primary btn-sm">
              Discover Jobs Now
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-sm">
              Contact Developer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
