import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ padding: '6rem 0', minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '540px', textAlign: 'center' }}>
        <div
          style={{
            fontSize: '6rem',
            fontWeight: 800,
            color: 'var(--primary)',
            lineHeight: 1,
            marginBottom: '1rem',
            letterSpacing: '-0.04em',
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          The page or opportunity you are searching for might have been moved, expired, or does not exist.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/" className="btn btn-primary">
            <Home size={16} /> Return to Homepage
          </Link>
          <Link to="/jobs" className="btn btn-secondary">
            <Search size={16} /> Browse Open Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
