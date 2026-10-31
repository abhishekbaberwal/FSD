import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Bell, CheckCheck, Clock, ArrowRight, ExternalLink } from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.getMyNotifications();
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showSuccess('All notifications marked as read.');
    } catch (err) {
      showError(err.message || 'Failed to mark notifications');
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationsAPI.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {
      // Ignore
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Notifications Center
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Stay updated on application progress, recruiter reviews, and system alerts.
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
              <CheckCheck size={16} /> Mark All as Read
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
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
              <Bell size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              No Notifications Yet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              When your application status changes or updates occur, you'll see them here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className="card card-hover"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  cursor: 'pointer',
                  borderLeft: notif.isRead
                    ? '1px solid var(--border-light)'
                    : '4px solid var(--primary)',
                  backgroundColor: notif.isRead ? '#ffffff' : '#f8f9ff',
                }}
              >
                <div>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: notif.isRead ? 'var(--text-main)' : 'var(--primary)',
                      }}
                    >
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                        New
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.35rem' }}>
                    <Clock size={12} /> {new Date(notif.createdAt).toLocaleString()}
                  </div>
                </div>

                {notif.link && (
                  <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
                    <ArrowRight size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
