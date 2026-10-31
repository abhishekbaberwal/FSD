import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      showSuccess('Your message has been received! Our support team will respond shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 600);
  };

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Get in Touch
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Have questions about campus hiring, student profiles, or technical partnerships? We are here to help.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2.5rem' }} className="md-grid-cols-1">
          {/* Contact Details Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Campus Address</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Jaipur, Rajasthan, India</p>
                </div>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Placement & Student Career Services Cell
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Mail size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Support Email</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>support@smartjobs.com</p>
                </div>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Response time: Within 24 business hours
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--success-subtle)',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Clock size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Office Hours</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monday - Friday</p>
                </div>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                09:00 AM - 06:00 PM IST
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Send Us a Message
            </h3>

            {sent ? (
              <div
                style={{
                  backgroundColor: 'var(--success-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <CheckCircle2 size={44} color="var(--success)" />
                <h4 style={{ fontSize: '1.2rem', color: '#065f46', fontWeight: 700 }}>
                  Message Sent Successfully!
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#047857', maxWidth: '380px' }}>
                  Thank you for reaching out. A SmartJobs team member will review your note and get in touch with you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '0.5rem' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="grid grid-cols-2 md-grid-cols-1 gap-4">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Your Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Aditya Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="student@college.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Recruiter verification or Student registration inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Your Message *</label>
                  <textarea
                    rows={5}
                    className="form-control"
                    placeholder="Please type your inquiry or feedback here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem' }}
                  disabled={submitting}
                >
                  <Send size={16} /> {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
