import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { notificationsAPI } from '../services/api';
import {
  Briefcase,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  BookmarkCheck,
  FileText,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { showInfo } = useToast();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);

  const userDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Fetch unread notifications for logged-in user
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        const res = await notificationsAPI.getMyNotifications();
        if (res.data?.success) {
          setUnreadCount(res.data.unreadCount || 0);
          setRecentNotifications(res.data.notifications?.slice(0, 5) || []);
        }
      } catch (err) {
        // Silent fail for navbar notification poll
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(e.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    showInfo('You have been logged out.');
    navigate('/login');
  };

  const handleNotificationClick = async (notif) => {
    setNotificationsOpen(false);
    try {
      if (!notif.isRead) {
        await notificationsAPI.markAsRead(notif._id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Ignore
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <header className="navbar-header">
      <div className="container flex items-center justify-between" style={{ height: '72px' }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #312e81 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px var(--primary-glow)',
            }}
          >
            <Briefcase size={22} color="#f59e0b" />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Smart<span style={{ color: 'var(--primary)' }}>Jobs</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'var(--accent)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: '-4px',
              }}
            >
              Student Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hide-on-mobile flex items-center gap-1">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Browse Jobs
          </NavLink>

          {/* Role-specific Nav Links */}
          {isAuthenticated && user?.role === 'student' && (
            <>
              <NavLink to="/student/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={16} /> My Dashboard
              </NavLink>
              <NavLink to="/student/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FileText size={16} /> My Profile & Resume
              </NavLink>
            </>
          )}

          {isAuthenticated && user?.role === 'recruiter' && (
            <>
              <NavLink to="/recruiter/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={16} /> Dashboard
              </NavLink>
              <NavLink to="/recruiter/post-job" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <PlusCircle size={16} /> Post a Job
              </NavLink>
              <NavLink to="/recruiter/manage-jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Manage Openings
              </NavLink>
            </>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={16} /> Admin Portal
            </NavLink>
          )}

          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Contact
          </NavLink>
        </nav>

        {/* Desktop Right Controls (Auth or User profile) */}
        <div className="hide-on-mobile flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notifications Dropdown */}
              <div style={{ position: 'relative' }} ref={notificationDropdownRef}>
                <button
                  className="btn-icon"
                  style={{
                    background: notificationsOpen ? 'var(--primary-subtle)' : 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-light)',
                    color: notificationsOpen ? 'var(--primary)' : 'var(--text-muted)',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  aria-label="View notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: 'var(--danger)',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #ffffff',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {notificationsOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '48px',
                      right: 0,
                      width: '340px',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      border: '1px solid var(--border-light)',
                      padding: '1rem',
                      zIndex: 200,
                      animation: 'slideUp 0.15s ease-out',
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
                      <Link
                        to="/notifications"
                        style={{ fontSize: '0.75rem', fontWeight: 600 }}
                        onClick={() => setNotificationsOpen(false)}
                      >
                        View All
                      </Link>
                    </div>

                    {recentNotifications.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                        No new notifications right now.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {recentNotifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            style={{
                              padding: '0.6rem 0.75rem',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: notif.isRead ? 'transparent' : 'var(--primary-subtle)',
                              cursor: 'pointer',
                              transition: 'background var(--transition-fast)',
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: notif.isRead ? 'var(--text-main)' : 'var(--primary)' }}>
                              {notif.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                              {notif.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }} ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-light)',
                    padding: '0.35rem 0.85rem 0.35rem 0.4rem',
                    borderRadius: 'var(--radius-pill)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {user?.name?.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {user?.role}
                    </div>
                  </div>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '48px',
                      right: 0,
                      width: '220px',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      border: '1px solid var(--border-light)',
                      padding: '0.5rem',
                      zIndex: 200,
                      animation: 'slideUp 0.15s ease-out',
                    }}
                  >
                    <div style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user?.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.email}
                      </p>
                      <span className={`badge ${user?.role === 'admin' ? 'badge-danger' : user?.role === 'recruiter' ? 'badge-accent' : 'badge-primary'}`} style={{ marginTop: '0.35rem' }}>
                        {user?.role} account
                      </span>
                    </div>

                    <div style={{ padding: '0.4rem 0' }}>
                      {user?.role === 'student' && (
                        <>
                          <Link
                            to="/student/dashboard"
                            className="nav-link"
                            style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <LayoutDashboard size={16} /> My Dashboard
                          </Link>
                          <Link
                            to="/student/profile"
                            className="nav-link"
                            style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <User size={16} /> Edit Profile & Resume
                          </Link>
                        </>
                      )}

                      {user?.role === 'recruiter' && (
                        <>
                          <Link
                            to="/recruiter/dashboard"
                            className="nav-link"
                            style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <LayoutDashboard size={16} /> Dashboard
                          </Link>
                          <Link
                            to="/recruiter/post-job"
                            className="nav-link"
                            style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <PlusCircle size={16} /> Post Job Opening
                          </Link>
                        </>
                      )}

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="nav-link"
                          style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <ShieldCheck size={16} /> Admin Portal
                        </Link>
                      )}

                      <Link
                        to="/notifications"
                        className="nav-link"
                        style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Bell size={16} /> Notifications
                      </Link>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.4rem' }}>
                      <button
                        onClick={handleLogout}
                        className="btn btn-outline-danger btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 'var(--radius-md)' }}
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="btn-icon"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
          }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-light)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <NavLink to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/jobs" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Browse Jobs
          </NavLink>
          {isAuthenticated && user?.role === 'student' && (
            <>
              <NavLink to="/student/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                My Dashboard
              </NavLink>
              <NavLink to="/student/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                My Profile
              </NavLink>
            </>
          )}
          {isAuthenticated && user?.role === 'recruiter' && (
            <>
              <NavLink to="/recruiter/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Recruiter Dashboard
              </NavLink>
              <NavLink to="/recruiter/post-job" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Post Job Opening
              </NavLink>
            </>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <NavLink to="/admin/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Admin Portal
            </NavLink>
          )}
          <NavLink to="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            About
          </NavLink>
          <NavLink to="/contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </NavLink>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn btn-outline-danger btn-sm" style={{ width: '100%' }}>
                <LogOut size={16} /> Sign Out ({user?.name})
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn btn-secondary btn-sm flex-1" onClick={() => setMobileMenuOpen(false)}>
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm flex-1" onClick={() => setMobileMenuOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
