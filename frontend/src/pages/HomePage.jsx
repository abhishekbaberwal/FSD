import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import JobCard from '../components/JobCard';
import { JobCardSkeleton } from '../components/LoadingSkeleton';
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  Building,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  FileCheck,
  BellRing,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, catRes] = await Promise.all([
          jobsAPI.getFeaturedJobs(),
          jobsAPI.getCategories(),
        ]);
        if (jobsRes.data?.jobs) setFeaturedJobs(jobsRes.data.jobs);
        if (catRes.data?.categories) setCategories(catRes.data.categories);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (locationTerm.trim()) params.set('location', locationTerm.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const defaultCategories = [
    { title: 'Web Development', icon: '💻', count: 12 },
    { title: 'Software Development', icon: '⚙️', count: 15 },
    { title: 'Data Science', icon: '📊', count: 8 },
    { title: 'UI/UX Design', icon: '🎨', count: 6 },
    { title: 'Cyber Security', icon: '🔒', count: 5 },
    { title: 'Digital Marketing', icon: '📈', count: 7 },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%)',
          padding: '4.5rem 0 3.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            {/* Pill Tag */}
            <div
              className="badge badge-primary"
              style={{
                padding: '0.4rem 1rem',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 8px rgba(67, 56, 202, 0.12)',
              }}
            >
              <Sparkles size={14} color="#f59e0b" /> Designed for College Students & Freshers
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: '2.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Discover Top <span style={{ color: 'var(--primary)' }}>Jobs & Internships</span> Tailored for Freshers
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Apply directly to verified companies, manage your resumes, and track every application status in real-time. No fake listings, zero guesswork.
            </p>

            {/* Hero Search Box */}
            <form
              onSubmit={handleHeroSearch}
              style={{
                backgroundColor: '#ffffff',
                padding: '0.75rem',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: '2 1 200px', display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 1rem' }}>
                <Search size={20} color="var(--primary)" />
                <input
                  type="text"
                  placeholder="Job title, skills (e.g. React, Java, Python)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div
                style={{
                  width: '1px',
                  height: '32px',
                  backgroundColor: 'var(--border-light)',
                }}
                className="hide-on-mobile"
              />

              <div style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 1rem' }}>
                <MapPin size={20} color="var(--accent)" />
                <input
                  type="text"
                  placeholder="City or Remote"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
                Search Jobs
              </button>
            </form>

            {/* Popular quick links */}
            <div className="flex items-center justify-center gap-2 flex-wrap" style={{ marginTop: '1.25rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>Popular Searches:</span>
              <Link to="/jobs?search=React" className="badge badge-neutral" style={{ textDecoration: 'none' }}>
                React Intern
              </Link>
              <Link to="/jobs?type=Internship" className="badge badge-neutral" style={{ textDecoration: 'none' }}>
                Summer Internships
              </Link>
              <Link to="/jobs?category=Data Science" className="badge badge-neutral" style={{ textDecoration: 'none' }}>
                Data Analyst
              </Link>
              <Link to="/jobs?location=Remote" className="badge badge-neutral" style={{ textDecoration: 'none' }}>
                Remote Roles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-light)', padding: '2rem 0' }}>
        <div className="container">
          <div className="grid grid-cols-4 md-grid-cols-2 gap-6 text-center">
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>500+</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Student Jobs</div>
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)' }}>180+</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Partner Tech Companies</div>
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--success)' }}>12,000+</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>College Applicants</div>
            </div>
            <div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--info)' }}>94%</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Campus Placement Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>Explore by Category</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Find roles tailored to your degree, technical domain, and career goals.
              </p>
            </div>
            <Link to="/jobs" className="btn btn-outline-primary btn-sm">
              View All Categories <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-3 md-grid-cols-1 gap-6">
            {(categories.length > 0 ? categories : defaultCategories).slice(0, 6).map((cat, idx) => {
              const title = cat._id || cat.title;
              const count = cat.count || 5;
              return (
                <div
                  key={idx}
                  className="card card-hover"
                  onClick={() => navigate(`/jobs?category=${encodeURIComponent(title)}`)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1.25rem 1.5rem',
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--primary-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0,
                    }}
                  >
                    {idx === 0 ? '💻' : idx === 1 ? '⚙️' : idx === 2 ? '📊' : idx === 3 ? '🎨' : idx === 4 ? '🔒' : '📈'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '2px' }}>{title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {count} open {count === 1 ? 'position' : 'positions'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section style={{ backgroundColor: 'var(--bg-surface-alt)', padding: '4.5rem 0' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-accent" style={{ marginBottom: '0.5rem' }}>
                <Sparkles size={12} /> High Demand Roles
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Featured Opportunities</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Handpicked internships and fresher positions with verified recruiter responses.
              </p>
            </div>
            <Link to="/jobs" className="btn btn-primary btn-sm">
              Explore All Jobs <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="card text-center" style={{ padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No featured jobs currently available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose SmartJobs */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Why College Students Trust SmartJobs
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Built specifically around the college placement workflow to help students transition seamlessly into professional careers.
            </p>
          </div>

          <div className="grid grid-cols-4 md-grid-cols-2 gap-6">
            <div className="card" style={{ padding: '1.75rem' }}>
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
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verified Companies</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Every recruiter and job posting is vetted by administrators to guarantee authentic employment opportunities.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
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
                  marginBottom: '1.25rem',
                }}
              >
                <BellRing size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Real-time Tracking</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Track your application as it moves through Applied, Under Review, Shortlisted, and Selected stages with instant notifications.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--success-subtle)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <FileCheck size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Resume Management</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Store multiple resumes, attach tailored documents to different applications, and preview securely at any time.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--info-subtle)',
                  color: 'var(--info)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <TrendingUp size={24} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Zero Cost Forever</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                100% free for students and college freshers. No subscription walls or hidden charges to apply for dream roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter CTA Banner */}
      <section style={{ backgroundColor: 'var(--primary)', color: '#ffffff', padding: '4.5rem 0', position: 'relative' }}>
        <div className="container flex items-center justify-between md-flex-col gap-6">
          <div style={{ maxWidth: '640px' }}>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', marginBottom: '0.75rem' }}>
              For Hiring Partners
            </span>
            <h2 style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Are You Hiring Bright College Talent?
            </h2>
            <p style={{ color: '#c7d2fe', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Connect directly with thousands of qualified college graduates and interns. Post job openings, evaluate student profiles, and manage candidate pipelines efficiently.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              to="/register"
              className="btn"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                fontWeight: 700,
                padding: '0.85rem 1.85rem',
              }}
            >
              Post a Job Opening
            </Link>
            <Link
              to="/login"
              className="btn"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.85rem 1.5rem',
              }}
            >
              Recruiter Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
