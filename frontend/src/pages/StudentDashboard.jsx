import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI, jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import JobCard from '../components/JobCard';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Bookmark,
  Trash2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'saved'
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appRes, savedRes] = await Promise.all([
        applicationsAPI.getMyApplications(),
        jobsAPI.getSavedJobs(),
      ]);
      if (appRes.data?.success) setApplications(appRes.data.applications);
      if (savedRes.data?.success) setSavedJobs(savedRes.data.jobs);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;

    try {
      await applicationsAPI.withdrawApplication(appId);
      showSuccess('Application withdrawn.');
      setApplications((prev) => prev.filter((a) => a._id !== appId));
    } catch (err) {
      showError(err.message || 'Could not withdraw application');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> Selected</span>;
      case 'Shortlisted':
        return <span className="badge badge-primary"><SparklesIcon /> Shortlisted</span>;
      case 'Under Review':
        return <span className="badge badge-warning"><Clock size={12} /> Under Review</span>;
      case 'Rejected':
        return <span className="badge badge-danger"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="badge badge-info"><CheckCircle2 size={12} /> Applied</span>;
    }
  };

  function SparklesIcon() {
    return <span style={{ marginRight: '2px' }}>✨</span>;
  }

  // Calculate statistics
  const totalApplied = applications.length;
  const underReviewCount = applications.filter((a) => a.status === 'Under Review').length;
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const selectedCount = applications.filter((a) => a.status === 'Selected').length;

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Welcome Header */}
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Student Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Welcome back, <strong>{user?.name}</strong>. Monitor your career applications and opportunities.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/student/profile" className="btn btn-secondary btn-sm">
              <FileText size={16} /> Manage Resume & Profile
            </Link>
            <Link to="/jobs" className="btn btn-primary btn-sm">
              Browse More Jobs
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 md-grid-cols-2 gap-4" style={{ marginBottom: '2.5rem' }}>
          <div className="card flex items-center gap-4" style={{ padding: '1.25rem' }}>
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
              }}
            >
              <Briefcase size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{totalApplied}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Total Applied
              </div>
            </div>
          </div>

          <div className="card flex items-center gap-4" style={{ padding: '1.25rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--warning-subtle)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{underReviewCount}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                In Review
              </div>
            </div>
          </div>

          <div className="card flex items-center gap-4" style={{ padding: '1.25rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#ede9fe',
                color: '#6d28d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{shortlistedCount}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Shortlisted
              </div>
            </div>
          </div>

          <div className="card flex items-center gap-4" style={{ padding: '1.25rem' }}>
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
              }}
            >
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{selectedCount}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Selected
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            My Applications ({applications.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Bookmarks ({savedJobs.length})
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : activeTab === 'applications' ? (
          applications.length === 0 ? (
            <div className="card text-center" style={{ padding: '4rem 2rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <Briefcase size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                No Applications Submitted Yet
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                You haven't applied to any job or internship openings yet. Discover thousands of fresh opportunities today!
              </p>
              <Link to="/jobs" className="btn btn-primary btn-sm">
                Explore Open Positions
              </Link>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Title & Company</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Status History / Notes</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {app.job?.title || 'Job Opening'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {app.job?.company} • {app.job?.location}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        {app.statusHistory && app.statusHistory.length > 0 ? (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {app.statusHistory[app.statusHistory.length - 1].note || 'In review'}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>-</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-2">
                          {app.job?._id && (
                            <Link to={`/jobs/${app.job._id}`} className="btn btn-secondary btn-sm">
                              View Job
                            </Link>
                          )}
                          {!['Selected', 'Rejected'].includes(app.status) && (
                            <button
                              onClick={() => handleWithdraw(app._id)}
                              className="btn btn-outline-danger btn-sm"
                              title="Withdraw application"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : savedJobs.length === 0 ? (
          <div className="card text-center" style={{ padding: '4rem 2rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Bookmark size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              No Saved Jobs
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Save interesting job openings while browsing so you can easily apply to them later.
            </p>
            <Link to="/jobs" className="btn btn-primary btn-sm">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md-grid-cols-1 gap-6">
            {savedJobs.map((job) => (
              <JobCard
                key={job._id}
                job={{ ...job, isSaved: true }}
                onSaveToggle={(id, isSaved) => {
                  if (!isSaved) setSavedJobs((prev) => prev.filter((j) => j._id !== id));
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
