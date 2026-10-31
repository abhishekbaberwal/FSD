import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import {
  Briefcase,
  PlusCircle,
  Users,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react';

export default function ManageJobsPage() {
  const { showSuccess, showError } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobsAPI.getMyJobs();
      if (res.data?.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      showError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    try {
      await jobsAPI.updateJob(job._id, { status: newStatus });
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, status: newStatus } : j))
      );
      showSuccess(`Job status updated to ${newStatus}`);
    } catch (err) {
      showError(err.message || 'Failed to update status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      setDeleting(true);
      await jobsAPI.deleteJob(jobToDelete._id);
      setJobs((prev) => prev.filter((j) => j._id !== jobToDelete._id));
      showSuccess('Job opening deleted successfully.');
      setJobToDelete(null);
    } catch (err) {
      showError(err.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Manage Job Openings
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              View, edit, toggle active status, and evaluate candidate applications for all your listings.
            </p>
          </div>
          <Link to="/recruiter/post-job" className="btn btn-primary btn-sm">
            <PlusCircle size={16} /> Post New Opening
          </Link>
        </div>

        {/* Jobs Table */}
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : jobs.length === 0 ? (
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              No Job Openings Found
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              You haven't created any job postings yet. Create an opening to receive student applications!
            </p>
            <Link to="/recruiter/post-job" className="btn btn-primary btn-sm">
              <PlusCircle size={14} /> Post a Job Now
            </Link>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title & Location</th>
                  <th>Category & Type</th>
                  <th>Date Posted</th>
                  <th>Status</th>
                  <th>Applicants</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{job.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {job.location} • {job.salary}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{job.category}</div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        {job.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(job)}
                        className={`badge ${job.status === 'Open' ? 'badge-success' : 'badge-neutral'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle Open/Closed status"
                      >
                        {job.status === 'Open' ? '● Open' : '○ Closed'}
                      </button>
                    </td>
                    <td>
                      <Link
                        to={`/recruiter/jobs/${job._id}/applicants`}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', gap: '0.35rem' }}
                      >
                        <Users size={14} /> View ({job.applicantsCount || 0})
                      </Link>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/recruiter/jobs/${job._id}/edit`}
                          className="btn btn-secondary btn-sm"
                          title="Edit job opening"
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setJobToDelete(job)}
                          className="btn btn-outline-danger btn-sm"
                          title="Delete job opening"
                          style={{ padding: '0.35rem 0.6rem' }}
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

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!jobToDelete}
          onClose={() => setJobToDelete(null)}
          title="Delete Job Opening?"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete the job opening{' '}
              <strong>"{jobToDelete?.title}"</strong>? This will also remove any candidate applications associated with it.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setJobToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
