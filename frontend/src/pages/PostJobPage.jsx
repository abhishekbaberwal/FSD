import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Briefcase,
  Building,
  MapPin,
  IndianRupee,
  Layers,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function PostJobPage() {
  const { id } = useParams(); // If present, edit mode
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    company: user?.company?.name || '',
    location: user?.company?.location || '',
    category: 'Software Development',
    type: 'Full-time',
    salary: '',
    experience: 'Fresher',
    skills: '',
    description: '',
    responsibilities: '',
    requirements: '',
    deadline: '',
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchJob = async () => {
        try {
          setLoading(true);
          const res = await jobsAPI.getJobById(id);
          if (res.data?.success) {
            const j = res.data.job;
            setFormData({
              title: j.title || '',
              company: j.company || '',
              location: j.location || '',
              category: j.category || 'Software Development',
              type: j.type || 'Full-time',
              salary: j.salary || '',
              experience: j.experience || 'Fresher',
              skills: Array.isArray(j.skills) ? j.skills.join(', ') : '',
              description: j.description || '',
              responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities.join('\n') : '',
              requirements: Array.isArray(j.requirements) ? j.requirements.join('\n') : '',
              deadline: j.deadline ? j.deadline.split('T')[0] : '',
            });
          }
        } catch (err) {
          showError(err.message || 'Failed to fetch job details');
          navigate('/recruiter/manage-jobs');
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.company || !formData.location || !formData.salary || !formData.description) {
      showError('Please fill in all mandatory job fields.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        responsibilities: formData.responsibilities ? formData.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        requirements: formData.requirements ? formData.requirements.split('\n').map((s) => s.trim()).filter(Boolean) : [],
      };

      if (isEditMode) {
        await jobsAPI.updateJob(id, payload);
        showSuccess('Job opening updated successfully!');
      } else {
        await jobsAPI.createJob(payload);
        showSuccess('New job opening published to the student portal!');
      }

      navigate('/recruiter/manage-jobs');
    } catch (err) {
      showError(err.message || 'Failed to save job opening');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading job details...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
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
            <ArrowLeft size={16} /> Back to Manage Openings
          </Link>
        </div>

        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              {isEditMode ? 'Edit Job Opening' : 'Post a New Job Opening'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {isEditMode
                ? 'Update job criteria, responsibilities, and specifications'
                : 'Publish an opening for college students, interns, and fresh graduates'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Title & Company */}
            <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Position Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="e.g. Frontend Developer Intern"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Hiring Company *</label>
                <input
                  type="text"
                  name="company"
                  className="form-control"
                  placeholder="TechNova Innovations"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Category & Type */}
            <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Employment Type *</label>
                <select
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Remote">Remote</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            {/* Salary, Location, Experience */}
            <div className="grid grid-cols-3 md-grid-cols-1 gap-4">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Salary / Monthly Stipend *</label>
                <input
                  type="text"
                  name="salary"
                  className="form-control"
                  placeholder="e.g. ₹15,000/month or ₹6.5 LPA"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Job Location *</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  placeholder="e.g. Jaipur or Remote"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Experience Level</label>
                <select
                  name="experience"
                  className="form-select"
                  value={formData.experience}
                  onChange={handleChange}
                >
                  <option value="Fresher">Fresher</option>
                  <option value="0-1 Years">0-1 Years</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="3+ Years">3+ Years</option>
                </select>
              </div>
            </div>

            {/* Skills */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Required Skills (Comma separated)</label>
              <input
                type="text"
                name="skills"
                className="form-control"
                placeholder="React.js, Node.js, MongoDB, JavaScript, Tailwind"
                value={formData.skills}
                onChange={handleChange}
              />
              <div className="form-helper">Separate multiple skills with commas</div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Detailed Job Description *</label>
              <textarea
                name="description"
                rows={4}
                className="form-control"
                placeholder="Describe the opportunity, what the student will learn, and project context..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Responsibilities */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Key Responsibilities (One per line)</label>
              <textarea
                name="responsibilities"
                rows={4}
                className="form-control"
                placeholder="Build user interface components&#10;Write unit tests&#10;Collaborate in daily standup meetings"
                value={formData.responsibilities}
                onChange={handleChange}
              />
            </div>

            {/* Requirements */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Candidate Requirements (One per line)</label>
              <textarea
                name="requirements"
                rows={4}
                className="form-control"
                placeholder="Pursuing degree in Computer Science or IT&#10;Strong understanding of JavaScript fundamentals&#10;Good analytical and problem-solving skills"
                value={formData.requirements}
                onChange={handleChange}
              />
            </div>

            {/* Submit Bar */}
            <div className="flex justify-end gap-3" style={{ marginTop: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <Link to="/recruiter/manage-jobs" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? isEditMode
                    ? 'Updating Job...'
                    : 'Publishing Job...'
                  : isEditMode
                  ? 'Update Job Opening'
                  : 'Publish Job Opening'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
