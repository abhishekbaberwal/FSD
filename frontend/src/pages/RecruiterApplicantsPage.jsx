import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import {
  Users,
  Briefcase,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function RecruiterApplicantsPage() {
  const { jobId } = useParams();
  const { showSuccess, showError } = useToast();

  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Status Update Modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('Applied');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Candidate Profile Preview Modal
  const [profilePreviewApp, setProfilePreviewApp] = useState(null);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'All' ? { status: statusFilter } : {};
      const res = await applicationsAPI.getJobApplicants(jobId, params);
      if (res.data?.success) {
        setJobTitle(res.data.jobTitle || 'Job Opening');
        setCompany(res.data.company || '');
        setApplicants(res.data.applications || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId, statusFilter]);

  const handleOpenStatusModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusNote('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setUpdating(true);
      const res = await applicationsAPI.updateStatus(selectedApp._id, {
        status: newStatus,
        note: statusNote.trim() || undefined,
      });

      if (res.data?.success) {
        showSuccess(`Candidate status updated to "${newStatus}" and notified!`);
        setApplicants((prev) =>
          prev.map((a) => (a._id === selectedApp._id ? { ...a, status: newStatus } : a))
        );
        setSelectedApp(null);
      }
    } catch (err) {
      showError(err.message || 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadResume = async (app) => {
    try {
      const res = await applicationsAPI.downloadResume(app._id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = app.resumeOriginalName || 'Candidate_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showError('Failed to download resume file.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return <span className="badge badge-success">Selected</span>;
      case 'Shortlisted':
        return <span className="badge badge-primary">Shortlisted</span>;
      case 'Under Review':
        return <span className="badge badge-warning">Under Review</span>;
      case 'Rejected':
        return <span className="badge badge-danger">Rejected</span>;
      default:
        return <span className="badge badge-info">Applied</span>;
    }
  };

  const statuses = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'];

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/recruiter/manage-jobs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to Manage Jobs
          </Link>
        </div>

        {/* Top Header Card */}
        <div
          className="card"
          style={{
            padding: '1.75rem 2rem',
            marginBottom: '2rem',
            borderLeft: '4px solid var(--primary)',
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>
                Applicant Tracking
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                Applicants for: {jobTitle}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {company} • Total {applicants.length} candidates in pipeline
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: '1.75rem' }}>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.825rem' }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Applicants Table */}
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : applicants.length === 0 ? (
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
              <Users size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              No Applicants Found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {statusFilter !== 'All'
                ? `No candidates currently in the "${statusFilter}" stage.`
                : 'No students have applied to this job posting yet.'}
            </p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Education & Headline</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Resume</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((app) => {
                  const student = app.student;
                  return (
                    <tr key={app._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {student?.name || 'Applicant'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {student?.email}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>
                          {student?.profile?.headline || 'Student'}
                        </div>
                        {student?.profile?.education && student.profile.education[0] && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {student.profile.education[0].degree} ({student.profile.education[0].institution})
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDownloadResume(app)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.775rem', padding: '0.25rem 0.6rem' }}
                        >
                          <Download size={13} /> Resume
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setProfilePreviewApp(app)}
                            className="btn btn-secondary btn-sm"
                            title="View candidate full profile"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
                          >
                            <Eye size={14} /> Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(app)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                          >
                            Update Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Update Status Modal */}
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Update Status: ${selectedApp?.student?.name}`}
        >
          <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label">Application Status</label>
              <select
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted (Interview)</option>
                <option value="Selected">Selected (Job Offer)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="form-label">Feedback / Recruiter Note to Candidate</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Profile shortlisted for technical round. Please check email for scheduling."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
              <div className="form-helper">
                The student will receive an instant in-app notification with this update.
              </div>
            </div>

            <div className="flex justify-end gap-3" style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedApp(null)}
                disabled={updating}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? 'Saving & Notifying...' : 'Save Status Update'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Candidate Profile Preview Modal */}
        <Modal
          isOpen={!!profilePreviewApp}
          onClose={() => setProfilePreviewApp(null)}
          title={`Candidate Profile: ${profilePreviewApp?.student?.name}`}
          maxWidth="680px"
        >
          {profilePreviewApp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Header Box */}
              <div style={{ backgroundColor: 'var(--bg-surface-alt)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profilePreviewApp.student?.name}</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{profilePreviewApp.student?.email}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '4px', fontWeight: 600 }}>
                  {profilePreviewApp.student?.profile?.headline || 'No headline specified'}
                </div>
                {profilePreviewApp.student?.profile?.bio && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
                    {profilePreviewApp.student.profile.bio}
                  </p>
                )}
              </div>

              {/* Cover Note if provided */}
              {profilePreviewApp.coverNote && (
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Candidate Cover Note:
                  </h5>
                  <p style={{ fontSize: '0.875rem', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', padding: '0.85rem', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    "{profilePreviewApp.coverNote}"
                  </p>
                </div>
              )}

              {/* Skills */}
              {profilePreviewApp.student?.profile?.skills && profilePreviewApp.student.profile.skills.length > 0 && (
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Technical Skills:
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {profilePreviewApp.student.profile.skills.map((s, i) => (
                      <span key={i} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profilePreviewApp.student?.profile?.education && profilePreviewApp.student.profile.education.length > 0 && (
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Education:
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {profilePreviewApp.student.profile.education.map((edu, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', padding: '0.6rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                        <strong>{edu.degree}</strong> {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''} • {edu.institution}
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {edu.startYear} - {edu.endYear || 'Present'} {edu.grade ? `(Grade: ${edu.grade})` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Resume Link */}
              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadResume(profilePreviewApp)}
                  className="btn btn-primary btn-sm"
                >
                  <Download size={14} /> Download Attached Resume
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setProfilePreviewApp(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
