import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { jobsAPI, applicationsAPI } from '../services/api';
import Modal from '../components/Modal';
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  IndianRupee,
  Building,
  CheckCircle2,
  FileText,
  Upload,
  Bookmark,
  Share2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Application Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [customResumeFile, setCustomResumeFile] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await jobsAPI.getJobById(id);
        if (res.data?.success) {
          setJob(res.data.job);
          setHasApplied(res.data.hasApplied);
          setIsSaved(res.data.isSaved);
        }
      } catch (err) {
        showError(err.message || 'Job not found');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      showInfo('Please log in as a student to bookmark jobs.');
      return;
    }
    if (user?.role !== 'student') {
      showInfo('Only students can bookmark jobs.');
      return;
    }

    try {
      const res = await jobsAPI.toggleSaveJob(job._id);
      setIsSaved(res.data.isSaved);
      if (res.data.isSaved) {
        showSuccess('Job added to your saved list!');
      } else {
        showInfo('Job removed from saved list.');
      }
    } catch (err) {
      showError(err.message);
    }
  };

  const handleOpenApplyModal = () => {
    if (!isAuthenticated) {
      showInfo('Please log in as a student to submit an application.');
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }

    if (user?.role !== 'student') {
      showInfo('Only student accounts can apply to job openings.');
      return;
    }

    // Default to profile resume if user has one
    setUseProfileResume(!!user?.profile?.resumeUrl);
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!useProfileResume && !customResumeFile) {
      showError('Please upload a resume file in PDF, DOC, or DOCX format.');
      return;
    }

    if (useProfileResume && !user?.profile?.resumeUrl) {
      showError('No resume found on your profile. Please upload a file below.');
      setUseProfileResume(false);
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('jobId', job._id);
      if (coverNote.trim()) formData.append('coverNote', coverNote.trim());
      if (!useProfileResume && customResumeFile) {
        formData.append('resume', customResumeFile);
      }

      const res = await applicationsAPI.applyForJob(formData);
      if (res.data?.success) {
        setHasApplied(true);
        setApplyModalOpen(false);
        showSuccess('Application submitted successfully! Track your progress on your dashboard.');
      }
    } catch (err) {
      showError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid var(--border-light)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <p style={{ color: 'var(--text-muted)' }}>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/jobs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to Job Listings
          </Link>
        </div>

        {/* Top Hero Card */}
        <div
          className="card"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            borderLeft: '4px solid var(--primary)',
          }}
        >
          <div className="flex items-start justify-between md-flex-col gap-6">
            <div className="flex items-start gap-4">
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.6rem',
                  flexShrink: 0,
                }}
              >
                {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.4rem' }}>
                  <span className="badge badge-primary">{job.category}</span>
                  <span className="badge badge-accent">{job.type}</span>
                  {job.isFeatured && (
                    <span className="badge badge-warning">
                      <Sparkles size={12} /> Featured
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>{job.title}</h1>
                <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {job.company} • {job.location}
                </p>
              </div>
            </div>

            {/* Actions: Save & Apply Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSave}
                className="btn btn-secondary"
                title={isSaved ? 'Remove from saved' : 'Save job'}
              >
                <Bookmark size={18} fill={isSaved ? 'var(--accent)' : 'none'} color={isSaved ? 'var(--accent)' : 'currentColor'} />
                {isSaved ? 'Saved' : 'Save'}
              </button>

              {hasApplied ? (
                <div
                  className="badge badge-success"
                  style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', gap: '0.5rem' }}
                >
                  <CheckCircle2 size={18} /> Applied
                </div>
              ) : (
                <button onClick={handleOpenApplyModal} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }} className="md-grid-cols-1">
          {/* Main Description & Specifications */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Description Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                Role Overview
              </h3>
              <p style={{ color: 'var(--text-main)', fontSize: '1rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {job.description}
              </p>
            </div>

            {/* Responsibilities Card */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  Key Responsibilities
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-3" style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                      <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements Card */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                  Candidate Requirements & Qualifications
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-3" style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                      <CheckCircle2 size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills Card */}
            {job.skills && job.skills.length > 0 && (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Desired Technical Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sidebar Overview */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Job Summary Box */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Job Information
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Offered Salary:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{job.salary}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Job Type:</span>
                  <span style={{ fontWeight: 600 }}>{job.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Experience:</span>
                  <span style={{ fontWeight: 600 }}>{job.experience}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                  <span style={{ fontWeight: 600 }}>{job.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Date Posted:</span>
                  <span style={{ fontWeight: 600 }}>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Applicants:</span>
                  <span style={{ fontWeight: 700 }}>{job.applicantsCount || 0} applied</span>
                </div>
              </div>

              {!hasApplied && (
                <button
                  onClick={handleOpenApplyModal}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1.5rem' }}
                >
                  Apply for this Role
                </button>
              )}
            </div>

            {/* Company Info Box */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                About the Company
              </h4>
              <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-surface-alt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  <Building size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{job.company}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{job.location}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Verified recruitment partner on SmartJobs Portal for student hires.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
      >
        <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'var(--bg-surface-alt)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>

          {/* Resume Choice */}
          <div>
            <label className="form-label">Resume to Attach</label>
            {user?.profile?.resumeUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label className="form-check">
                  <input
                    type="radio"
                    name="resumeOption"
                    checked={useProfileResume}
                    onChange={() => setUseProfileResume(true)}
                  />
                  <span>
                    Use my profile resume:{' '}
                    <strong>{user.profile.resumeOriginalName || 'Uploaded Resume.pdf'}</strong>
                  </span>
                </label>
                <label className="form-check">
                  <input
                    type="radio"
                    name="resumeOption"
                    checked={!useProfileResume}
                    onChange={() => setUseProfileResume(false)}
                  />
                  <span>Upload a different resume specifically for this application</span>
                </label>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-hover)', marginBottom: '0.5rem' }}>
                No resume is currently uploaded to your profile. Please choose a resume file to upload now:
              </div>
            )}

            {(!useProfileResume || !user?.profile?.resumeUrl) && (
              <div style={{ marginTop: '0.75rem' }}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCustomResumeFile(e.target.files[0])}
                  className="form-control"
                  required={!useProfileResume}
                />
                <div className="form-helper">Allowed formats: PDF, DOC, DOCX (Max size: 5MB)</div>
              </div>
            )}
          </div>

          {/* Optional Cover Note */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Cover Note / Message to Recruiter (Optional)</label>
            <textarea
              className="form-control"
              placeholder="Highlight relevant projects, coursework, or why you are excited about this role..."
              rows={3}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3" style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setApplyModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting Application...' : 'Confirm & Apply'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
