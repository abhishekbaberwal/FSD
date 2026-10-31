import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  Lock,
  Building,
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('student'); // 'student' | 'recruiter'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      showError('Please complete all required fields.');
      return;
    }

    if (role === 'recruiter' && !companyName.trim()) {
      showError('Please enter your company or organization name.');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match. Please verify and try again.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        companyName: role === 'recruiter' ? companyName.trim() : undefined,
      });

      showSuccess(`Account registered successfully! Welcome, ${user.name}.`);
      if (user.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/student/profile');
      }
    } catch (err) {
      showError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Create an Account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Join SmartJobs to launch your college career or hire promising freshers
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-surface-alt)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.75rem',
            }}
          >
            <button
              type="button"
              onClick={() => setRole('student')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                backgroundColor: role === 'student' ? '#ffffff' : 'transparent',
                color: role === 'student' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <GraduationCap size={18} /> Student / Fresher
            </button>

            <button
              type="button"
              onClick={() => setRole('recruiter')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                backgroundColor: role === 'recruiter' ? '#ffffff' : 'transparent',
                color: role === 'recruiter' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: role === 'recruiter' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Building size={18} /> Recruiter / Employer
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={role === 'student' ? 'Aditya Sharma' : 'Abhishek Baberwal'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User
                  size={18}
                  color="var(--text-light)"
                  style={{ position: 'absolute', left: '12px', top: '13px' }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail
                  size={18}
                  color="var(--text-light)"
                  style={{ position: 'absolute', left: '12px', top: '13px' }}
                />
              </div>
            </div>

            {/* Company Name if Recruiter */}
            {role === 'recruiter' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Company / Organization Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="TechNova Innovations"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Building
                    size={18}
                    color="var(--text-light)"
                    style={{ position: 'absolute', left: '12px', top: '13px' }}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock
                  size={18}
                  color="var(--text-light)"
                  style={{ position: 'absolute', left: '12px', top: '13px' }}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock
                  size={18}
                  color="var(--text-light)"
                  style={{ position: 'absolute', left: '12px', top: '13px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
              disabled={submitting}
            >
              {submitting ? 'Creating Account...' : `Register as ${role === 'student' ? 'Student' : 'Recruiter'}`}{' '}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footer Link */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
