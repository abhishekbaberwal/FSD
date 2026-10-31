import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import {
  ShieldCheck,
  Users,
  Briefcase,
  FileCheck,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Building,
  GraduationCap,
} from 'lucide-react';

export default function AdminDashboard() {
  const { showSuccess, showError } = useToast();

  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'recruiters' | 'jobs' | 'applications'
  const [loading, setLoading] = useState(true);

  // Users tab state
  const [usersList, setUsersList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('student');
  const [searchUser, setSearchUser] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Jobs tab state
  const [jobsList, setJobsList] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // Applications tab state
  const [applicationsList, setApplicationsList] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'user' | 'job', item }
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getStats();
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      showError(err.message || 'Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params = { role: userRoleFilter };
      if (searchUser.trim()) params.search = searchUser.trim();
      const res = await adminAPI.getAllUsers(params);
      if (res.data?.success) setUsersList(res.data.users);
    } catch (err) {
      showError(err.message || 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const res = await adminAPI.getAllJobs();
      if (res.data?.success) setJobsList(res.data.jobs);
    } catch (err) {
      showError(err.message || 'Failed to fetch jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setAppsLoading(true);
      const res = await adminAPI.getAllApplications();
      if (res.data?.success) setApplicationsList(res.data.applications);
    } catch (err) {
      showError(err.message || 'Failed to fetch applications');
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students' || activeTab === 'recruiters') {
      fetchUsers();
    } else if (activeTab === 'jobs') {
      fetchJobs();
    } else if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab, userRoleFilter]);

  const handleToggleUserStatus = async (user) => {
    try {
      const res = await adminAPI.toggleUserStatus(user._id);
      showSuccess(res.data.message);
      setUsersList((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: res.data.isActive } : u))
      );
    } catch (err) {
      showError(err.message || 'Failed to toggle status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      if (deleteTarget.type === 'user') {
        await adminAPI.deleteUser(deleteTarget.item._id);
        setUsersList((prev) => prev.filter((u) => u._id !== deleteTarget.item._id));
        showSuccess('User account removed permanently.');
      }
      setDeleteTarget(null);
      fetchStats();
    } catch (err) {
      showError(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
              <span className="badge badge-danger">
                <ShieldCheck size={14} /> System Administrator
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Oversight Portal</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Manage students, recruiters, jobs, platform applications, and audit records.
            </p>
          </div>
        </div>

        {/* Global Statistics Grid */}
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
              <GraduationCap size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
                {stats?.totalStudents ?? 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Enrolled Students
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
              <Building size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
                {stats?.totalRecruiters ?? 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Recruiter Partners
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
              <Briefcase size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
                {stats?.totalJobs ?? 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Total Job Listings
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
              <FileCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
                {stats?.totalApplications ?? 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Total Applications
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Analytics Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('students');
              setUserRoleFilter('student');
            }}
          >
            Students Management
          </button>
          <button
            className={`tab-btn ${activeTab === 'recruiters' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('recruiters');
              setUserRoleFilter('recruiter');
            }}
          >
            Recruiters Management
          </button>
          <button
            className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs Oversight
          </button>
          <button
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications Log
          </button>
        </div>

        {/* Tab 1: Overview Analytics */}
        {activeTab === 'overview' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="md-grid-cols-1">
            {/* Status Breakdown */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                Application Pipeline Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {Object.entries(stats.statusCounts || {}).map(([st, count]) => {
                  const pct =
                    stats.totalApplications > 0
                      ? Math.round((count / stats.totalApplications) * 100)
                      : 0;
                  return (
                    <div key={st}>
                      <div className="flex items-center justify-between" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600 }}>{st}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--bg-surface-alt)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            backgroundColor:
                              st === 'Selected'
                                ? 'var(--success)'
                                : st === 'Shortlisted'
                                ? '#8b5cf6'
                                : st === 'Under Review'
                                ? 'var(--accent)'
                                : st === 'Rejected'
                                ? 'var(--danger)'
                                : 'var(--primary)',
                            borderRadius: '999px',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                Job Openings by Domain Category
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(stats.categoryStats || []).map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center justify-between"
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg-surface-alt)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{cat._id}</span>
                    <span className="badge badge-primary">{cat.count} listings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 & 3: Students / Recruiters Management */}
        {(activeTab === 'students' || activeTab === 'recruiters') && (
          <div>
            {/* Search Box */}
            <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <div className="flex items-center gap-3">
                <Search size={18} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder={`Search ${userRoleFilter} by name or email...`}
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchUsers();
                  }}
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                  }}
                />
                <button type="button" onClick={fetchUsers} className="btn btn-secondary btn-sm">
                  Search
                </button>
              </div>
            </div>

            {usersLoading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : usersList.length === 0 ? (
              <div className="card text-center" style={{ padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No accounts found matching search.</p>
              </div>
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User Name & Email</th>
                      <th>Role & Organization</th>
                      <th>Registered Date</th>
                      <th>Account Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{u.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td>
                          <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                            {u.role}
                          </span>
                          {u.company?.name && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {u.company.name}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span
                            className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}
                          >
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.775rem' }}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ type: 'user', item: u })}
                              className="btn btn-outline-danger btn-sm"
                              style={{ padding: '0.3rem 0.5rem' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Jobs Oversight */}
        {activeTab === 'jobs' && (
          <div>
            {jobsLoading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title & Company</th>
                      <th>Category & Type</th>
                      <th>Location</th>
                      <th>Applicants</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobsList.map((job) => (
                      <tr key={job._id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{job.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {job.company}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{job.category}</div>
                          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                            {job.type}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{job.location}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {job.applicantsCount || 0}
                        </td>
                        <td>
                          <span className={`badge ${job.status === 'Open' ? 'badge-success' : 'badge-neutral'}`}>
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Applications Audit Log */}
        {activeTab === 'applications' && (
          <div>
            {appsLoading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Applicant Student</th>
                      <th>Target Position & Company</th>
                      <th>Submission Date</th>
                      <th>Current Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicationsList.map((app) => (
                      <tr key={app._id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{app.student?.name || 'Student'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {app.student?.email}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{app.job?.title || 'Job Opening'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {app.job?.company}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(app.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <span className="badge badge-primary">{app.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Confirm Permanent Deletion"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete{' '}
              <strong>"{deleteTarget?.item?.name || deleteTarget?.item?.title}"</strong>? This will remove all associated database records.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
