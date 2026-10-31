import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersAPI } from '../services/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Upload,
  Download,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  Code,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, updateUser, refreshUser } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);

  // New Education Form State
  const [newEdu, setNewEdu] = useState({
    degree: '',
    fieldOfStudy: '',
    institution: '',
    startYear: '',
    endYear: '',
    grade: '',
  });

  // New Project Form State
  const [newProj, setNewProj] = useState({
    title: '',
    description: '',
    link: '',
    technologies: '',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeadline(user.profile?.headline || '');
      setBio(user.profile?.bio || '');
      setPhone(user.profile?.phone || '');
      setLocation(user.profile?.location || '');
      setSkills(user.profile?.skills || []);
      setEducation(user.profile?.education || []);
      setProjects(user.profile?.projects || []);
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await usersAPI.updateStudentProfile({
        name,
        headline,
        bio,
        phone,
        location,
        skills,
        education,
        projects,
      });

      if (res.data?.success) {
        updateUser(res.data.user);
        showSuccess('Student profile updated successfully!');
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      showError('Please upload a valid PDF, DOC, or DOCX document.');
      return;
    }

    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append('resume', file);

      const res = await usersAPI.uploadResume(formData);
      if (res.data?.success) {
        updateUser(res.data.user);
        showSuccess('Resume file uploaded and saved to your profile!');
      }
    } catch (err) {
      showError(err.message || 'Resume upload failed');
    } finally {
      setUploadingResume(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddEducation = () => {
    if (!newEdu.degree || !newEdu.institution) {
      showError('Please enter at least Degree and Institution');
      return;
    }
    setEducation([...education, { ...newEdu }]);
    setNewEdu({ degree: '', fieldOfStudy: '', institution: '', startYear: '', endYear: '', grade: '' });
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleAddProject = () => {
    if (!newProj.title) {
      showError('Please enter a Project Title');
      return;
    }
    const techArray = newProj.technologies
      ? newProj.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    setProjects([...projects, { ...newProj, technologies: techArray }]);
    setNewProj({ title: '', description: '', link: '', technologies: '' });
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Student Profile & Resume
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Complete your profile details, showcase your technical skills, and manage your uploaded resume.
          </p>
        </div>

        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section 1: Resume Management Box */}
          <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-3">
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
                  <FileText size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Resume Document</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Your primary resume automatically attaches to all 1-click job applications.
                  </p>
                </div>
              </div>

              <div>
                <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={16} /> {uploadingResume ? 'Uploading...' : 'Upload New Resume'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingResume}
                  />
                </label>
              </div>
            </div>

            {user?.profile?.resumeUrl ? (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} color="var(--success)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {user.profile.resumeOriginalName || 'Uploaded_Resume.pdf'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Updated: {new Date(user.profile.resumeUpdatedAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <a
                  href={user.profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  download
                >
                  <Download size={14} /> Download Resume
                </a>
              </div>
            ) : (
              <div
                style={{
                  border: '2px dashed var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>No resume uploaded yet.</p>
                <p style={{ fontSize: '0.85rem' }}>
                  Upload your CV in PDF or DOC format so hiring recruiters can review your qualifications.
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Personal Information */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--primary)" /> Personal Information
            </h3>

            <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address (Read-Only)</label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || ''}
                  disabled
                  style={{ backgroundColor: 'var(--bg-surface-alt)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Current City / Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Jaipur, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                <label className="form-label">Professional Headline</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Final Year B.Tech CSE Student | Full Stack Web Developer"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                <label className="form-label">Short Bio / Career Summary</label>
                <textarea
                  className="form-control"
                  placeholder="Write a brief intro highlighting your passion, coursework, and technical background..."
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Technical Skills */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={20} color="var(--primary)" /> Technical Skills & Tools
            </h3>

            <div className="flex gap-2" style={{ marginBottom: '1.25rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Add a skill (e.g. React.js, Python, MongoDB, SQL)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
              />
              <button type="button" onClick={handleAddSkill} className="btn btn-secondary">
                <Plus size={16} /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="badge badge-primary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      marginLeft: '4px',
                    }}
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                  No skills added yet. Add relevant programming languages, frameworks, and tools.
                </p>
              )}
            </div>
          </div>

          {/* Section 4: Education Details */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} color="var(--primary)" /> Education Details
            </h3>

            {/* List of existing educations */}
            {education.map((edu, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{edu.institution}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2px' }}>
                    {edu.startYear} - {edu.endYear || 'Present'} {edu.grade ? `• Grade: ${edu.grade}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="btn btn-outline-danger btn-sm"
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {/* Add Education sub-form */}
            <div
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
              }}
            >
              <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
                Add New Qualification
              </h5>
              <div className="grid grid-cols-2 md-grid-cols-1 gap-3">
                <input
                  type="text"
                  placeholder="Degree (e.g. B.Tech, B.Sc, BCA)"
                  className="form-control"
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Field of Study (e.g. Computer Science)"
                  className="form-control"
                  value={newEdu.fieldOfStudy}
                  onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="College / University Name"
                  className="form-control"
                  value={newEdu.institution}
                  onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                  style={{ gridColumn: 'span 2' }}
                />
                <input
                  type="number"
                  placeholder="Start Year (e.g. 2023)"
                  className="form-control"
                  value={newEdu.startYear}
                  onChange={(e) => setNewEdu({ ...newEdu, startYear: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="End Year / Expected"
                  className="form-control"
                  value={newEdu.endYear}
                  onChange={(e) => setNewEdu({ ...newEdu, endYear: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="CGPA / Percentage"
                  className="form-control"
                  value={newEdu.grade}
                  onChange={(e) => setNewEdu({ ...newEdu, grade: e.target.value })}
                  style={{ gridColumn: 'span 2' }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '1rem' }}
              >
                <Plus size={14} /> Add Education Entry
              </button>
            </div>
          </div>

          {/* Section 5: Projects & Portfolio */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} color="var(--primary)" /> Projects & Portfolio
            </h3>

            {projects.map((proj, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{proj.title}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0' }}>
                    {proj.description}
                  </p>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ExternalLink size={12} /> {proj.link}
                    </a>
                  )}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex gap-1 flex-wrap" style={{ marginTop: '6px' }}>
                      {proj.technologies.map((t, i) => (
                        <span key={i} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(idx)}
                  className="btn btn-outline-danger btn-sm"
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {/* Add Project sub-form */}
            <div
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
              }}
            >
              <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
                Add Academic or Personal Project
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Project Title"
                  className="form-control"
                  value={newProj.title}
                  onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                />
                <textarea
                  placeholder="Brief description of the project and your role..."
                  rows={2}
                  className="form-control"
                  value={newProj.description}
                  onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                />
                <input
                  type="url"
                  placeholder="GitHub / Live Demo Link (optional)"
                  className="form-control"
                  value={newProj.link}
                  onChange={(e) => setNewProj({ ...newProj, link: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Technologies used (comma separated, e.g. React, Express, MongoDB)"
                  className="form-control"
                  value={newProj.technologies}
                  onChange={(e) => setNewProj({ ...newProj, technologies: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={handleAddProject}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '1rem' }}
              >
                <Plus size={14} /> Add Project Entry
              </button>
            </div>
          </div>

          {/* Save Button Bar */}
          <div
            style={{
              position: 'sticky',
              bottom: '1rem',
              backgroundColor: '#ffffff',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Make sure to save changes before leaving the page.
            </span>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving Profile...' : 'Save All Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
