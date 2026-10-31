import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentInfo, setSentInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showError('Please enter your registered email address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authAPI.forgotPassword({ email: email.trim() });
      if (res.data?.success) {
        setSentInfo(res.data);
        showSuccess(res.data.message);
      }
    } catch (err) {
      showError(err.message || 'Failed to dispatch reset link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '4rem 0', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>

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
              <Mail size={24} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Forgot Password
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Enter your account email and we'll dispatch a secure, time-limited reset link.
            </p>
          </div>

          {sentInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--success-subtle)',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
              >
                <CheckCircle2 size={22} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.9rem', color: '#065f46' }}>
                  <strong>Reset Link Dispatched!</strong>
                  <p style={{ marginTop: '0.25rem', color: '#047857' }}>{sentInfo.message}</p>
                </div>
              </div>

              {/* Development / Demo Quick Link for Viva */}
              {sentInfo.resetTokenForDev && (
                <div
                  style={{
                    backgroundColor: 'var(--primary-subtle)',
                    border: '1px solid #c7d2fe',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.4rem' }}>
                    ⚡ Viva / Demo Reset Link:
                  </div>
                  <Link
                    to={`/reset-password/${sentInfo.resetTokenForDev}`}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Open Password Reset Page <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {/* Ethereal Mailbox Preview Link if available */}
              {sentInfo.previewUrl && (
                <a
                  href={sentInfo.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <ExternalLink size={14} /> View Nodemailer Email in Browser
                </a>
              )}

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setSentInfo(null)}
                style={{ marginTop: '0.5rem' }}
              >
                Try Another Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Registered Email</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="student@college.edu"
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

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem' }}
                disabled={submitting}
              >
                {submitting ? 'Sending Link...' : 'Send Password Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
