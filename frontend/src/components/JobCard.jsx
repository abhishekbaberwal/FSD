import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { jobsAPI } from '../services/api';
import {
  MapPin,
  Clock,
  Bookmark,
  Briefcase,
  IndianRupee,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function JobCard({ job, onSaveToggle }) {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [isSaved, setIsSaved] = useState(job.isSaved || false);
  const [saving, setSaving] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showInfo('Please log in to save jobs.');
      return;
    }

    if (user?.role !== 'student') {
      showInfo('Only student accounts can save jobs.');
      return;
    }

    try {
      setSaving(true);
      const res = await jobsAPI.toggleSaveJob(job._id);
      setIsSaved(res.data.isSaved);
      if (res.data.isSaved) {
        showSuccess('Job bookmarked to saved list!');
      } else {
        showInfo('Job removed from saved list.');
      }
      if (onSaveToggle) onSaveToggle(job._id, res.data.isSaved);
    } catch (err) {
      showError(err.message || 'Failed to update saved status');
    } finally {
      setSaving(false);
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60,
    };
    for (const [unit, secs] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secs);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    return 'Just now';
  };

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        borderLeft: job.isFeatured ? '4px solid var(--accent)' : '1px solid var(--border-light)',
      }}
    >
      <div>
        {/* Top Header: Company & Bookmark */}
        <div className="flex items-start justify-between" style={{ marginBottom: '1rem' }}>
          <div className="flex items-center gap-3">
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
                fontWeight: 800,
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
            >
              {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                <Link to={`/jobs/${job._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {job.title}
                </Link>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {job.company}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {job.isFeatured && (
              <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>
                <Sparkles size={12} /> Featured
              </span>
            )}
            <button
              onClick={handleBookmark}
              disabled={saving}
              className="btn-icon"
              style={{
                background: isSaved ? 'var(--accent-subtle)' : 'var(--bg-surface-alt)',
                border: 'none',
                color: isSaved ? 'var(--accent-hover)' : 'var(--text-light)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              title={isSaved ? 'Remove from saved' : 'Save job'}
              aria-label="Bookmark job"
            >
              <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Badges row: Location, Type, Experience */}
        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: '0.85rem' }}>
          <span className="badge badge-neutral">
            <MapPin size={12} /> {job.location}
          </span>
          <span className={`badge ${job.type === 'Internship' ? 'badge-accent' : 'badge-primary'}`}>
            <Briefcase size={12} /> {job.type}
          </span>
          <span className="badge badge-info">{job.experience}</span>
        </div>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {job.description}
        </p>

        {/* Skills Chips */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1" style={{ marginBottom: '1.25rem' }}>
            {job.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-alt)',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                }}
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', alignSelf: 'center' }}>
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Salary and Action */}
      <div
        className="flex items-center justify-between"
        style={{
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-light)',
          marginTop: 'auto',
        }}
      >
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>
            Compensation
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
            {job.salary}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={12} /> {timeAgo(job.createdAt)}
          </span>
          <Link to={`/jobs/${job._id}`} className="btn btn-outline-primary btn-sm">
            View Details <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
