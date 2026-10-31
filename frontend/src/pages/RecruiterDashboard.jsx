import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  Building,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function RecruiterDashboard() {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Company Profile edit state
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: user?.company?.name || '',
    website: user?.company?.website || '',
    industry: user?.company?.industry || '',
    location: user?.company?.location || '',
    size: user?.company?.size || '',
    description: user?.company?.description || '',
  });
  const [savingCompany, setSavingCompany] = useState(false);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        setLoading(true);
        const res = await jobsAPI.getMyJobs();
        if (res.data?.success) {
          setJobs(res.data.jobs);
        }
      } catch (err) {
        console.error('Failed to load recruiter data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiterData();
  }, []);

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      setSavingCompany(true);
      const res = await usersAPI.updateCompanyProfile(companyForm);
      if (res.data?.success) {
        updateUser(res.data.user);
        setEditingCompany(false);
        showSuccess('Company profile updated successfully!');
      }
    } catch (err) {
      showError(err.message || 'Failed to update company info');
    } finally {
      setSavingCompany(false);
    }
  };

  // Metrics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === 'Open').length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantsCount || 0), 0);

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Top Header */}
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Recruiter Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Welcome back, <strong>{user?.name}</strong>. Manage your job openings and candidate pipelines.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/recruiter/manage-jobs" className="btn btn-secondary btn-sm">
              Manage Openings
            </Link>
            <Link to="/recruiter/post-job" className="btn btn-primary btn-sm">
              <PlusCircle size={16} /> Post New Job
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
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{totalJobs}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Total Job Postings
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
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{activeJobs}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Active / Open Roles
              </div>
            </div>
          </div>

          <div className="card flex items-center gap-4" style={{ padding: '1.25rem' }}>
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
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{totalApplicants}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Total Applicants
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
              <TrendingUp size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
                {totalJobs > 0 ? (totalApplicants / totalJobs).toFixed(1) : 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Avg Applicants/Job
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column: Posted Jobs and Company Profile */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }} className="md-grid-cols-1">
          {/* Main: Jobs Table */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Recent Job Postings</h2>
              <Link to="/recruiter/manage-jobs" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                View All Openings →
              </Link>
            </div>

            {loading ? (
              <TableSkeleton rows={4} cols={4} />
            ) : jobs.length === 0 ? (
              <div className="card text-center" style={{ padding: '3.5rem 2rem' }}>
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  No Jobs Posted Yet
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  Publish your first job or internship opportunity to connect with talented student candidates.
                </p>
                <Link to="/recruiter/post-job" className="btn btn-primary btn-sm">
                  <PlusCircle size={14} /> Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Position Title</th>
                      <th>Type & Category</th>
                      <th>Applicants</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.slice(0, 6).map((job) => (
                      <tr key={job._id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{job.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.location}</div>
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                            {job.type}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            {job.applicantsCount || 0}
                          </span>{' '}
                          candidates
                        </td>
                        <td>
                          <span
                            className={`badge ${job.status === 'Open' ? 'badge-success' : 'badge-neutral'}`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link
                            to={`/recruiter/jobs/${job._id}/applicants`}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                          >
                            Applicants ({job.applicantsCount || 0})
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sidebar: Company Profile */}
          <aside>
            <div className="card" style={{ padding: '1.75rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <span className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  <Building size={18} color="var(--primary)" /> Company Profile
                </span>
                <button
                  type="button"
                  onClick={() => setEditingCompany(!editingCompany)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {editingCompany ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editingCompany ? (
                <form onSubmit={handleSaveCompany} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Official Website</label>
                    <input
                      type="url"
                      placeholder="https://company.com"
                      className="form-control"
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Industry</label>
                    <input
                      type="text"
                      placeholder="e.g. Information Technology"
                      className="form-control"
                      value={companyForm.industry}
                      onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Headquarters / Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, India"
                      className="form-control"
                      value={companyForm.location}
                      onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Company Overview</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-sm" disabled={savingCompany}>
                    {savingCompany ? 'Saving...' : 'Save Company Details'}
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Company Name
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {user?.company?.name || 'Not specified'}
                    </div>
                  </div>

                  {user?.company?.website && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Website
                      </div>
                      <a
                        href={user.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                      >
                        <ExternalLink size={12} /> {user.company.website}
                      </a>
                    </div>
                  )}

                  {user?.company?.industry && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Industry
                      </div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                        {user.company.industry}
                      </div>
                    </div>
                  )}

                  {user?.company?.location && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Location
                      </div>
                      <div style={{ color: 'var(--text-main)' }}>{user.company.location}</div>
                    </div>
                  )}

                  {user?.company?.description && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {user.company.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
