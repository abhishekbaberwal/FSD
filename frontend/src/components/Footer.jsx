import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Heart, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        paddingTop: '4rem',
        paddingBottom: '2rem',
        borderTop: '1px solid #1e293b',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div className="grid grid-cols-4 md-grid-cols-1 gap-8" style={{ marginBottom: '3rem' }}>
          {/* Col 1: Brand & Mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Briefcase size={20} color="#f59e0b" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Smart<span style={{ color: '#818cf8' }}>Jobs</span>
              </span>
            </Link>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8' }}>
              A dedicated MERN stack career portal empowering college students and freshers to discover verified internships, entry-level opportunities, and connect directly with top hiring recruiters.
            </p>
            <div className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: '#64748b' }}>
              <Shield size={14} color="#10b981" /> 100% Genuine College Placements
            </div>
          </div>

          {/* Col 2: For Students */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              For Students
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/jobs" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>
                  Browse All Jobs & Internships
                </Link>
              </li>
              <li>
                <Link to="/jobs?type=Internship" style={{ color: '#94a3b8' }}>
                  Summer Internships
                </Link>
              </li>
              <li>
                <Link to="/jobs?experience=Fresher" style={{ color: '#94a3b8' }}>
                  Fresher Campus Roles
                </Link>
              </li>
              <li>
                <Link to="/student/profile" style={{ color: '#94a3b8' }}>
                  Student Resume Manager
                </Link>
              </li>
              <li>
                <Link to="/student/dashboard" style={{ color: '#94a3b8' }}>
                  Track Application Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Recruiters & Colleges */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Recruiters & Partners
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/recruiter/post-job" style={{ color: '#94a3b8' }}>
                  Post Free Job Opening
                </Link>
              </li>
              <li>
                <Link to="/recruiter/dashboard" style={{ color: '#94a3b8' }}>
                  Candidate Management Portal
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ color: '#94a3b8' }}>
                  Register Company Account
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: '#94a3b8' }}>
                  About Our Platform
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: '#94a3b8' }}>
                  Campus Placement Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Contact & Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div className="flex items-center gap-2">
                <MapPin size={16} color="#818cf8" style={{ flexShrink: 0 }} />
                <span>Jaipur, Rajasthan, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} color="#818cf8" style={{ flexShrink: 0 }} />
                <span>support@smartjobs.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} color="#818cf8" style={{ flexShrink: 0 }} />
                <span>+91 98765 43210</span>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <span className="badge badge-accent">Production Ready MERN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#64748b',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            © {new Date().getFullYear()} SmartJobs Portal. Built by Abhishek Baberwal for College Demonstration.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" style={{ color: '#64748b' }}>
              About
            </Link>
            <Link to="/contact" style={{ color: '#64748b' }}>
              Contact
            </Link>
            <Link to="/login" style={{ color: '#64748b' }}>
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
