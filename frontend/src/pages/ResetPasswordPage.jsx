import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authAPI.resetPassword(token, { password });
      if (res.data?.success) {
        setIsSuccess(true);
        showSuccess('Password updated successfully!');
      }
    } catch (err) {
      showError(err.message || 'Token is invalid or has expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '4rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Lock size={24} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Set New Password
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Create a strong new password for your SmartJobs account
            </p>
          </div>

          {isSuccess ? (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--success-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle2 size={40} color="var(--success)" />
                <h3 style={{ fontSize: '1.15rem', color: '#065f46', fontWeight: 700 }}>
                  Password Reset Complete!
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#047857' }}>
                  Your password has been securely updated. You can now sign in with your new credentials.
                </p>
              </div>

              <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                Sign In Now <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Password</label>
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

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Re-enter new password"
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
                style={{ width: '100%', padding: '0.8rem' }}
                disabled={submitting}
              >
                {submitting ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
