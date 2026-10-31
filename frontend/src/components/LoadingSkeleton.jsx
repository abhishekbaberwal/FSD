import React from 'react';

export function JobCardSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div className="skeleton" style={{ width: '180px', height: '18px' }} />
            <div className="skeleton" style={{ width: '120px', height: '14px' }} />
          </div>
        </div>
        <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
      </div>

      <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
        <div className="skeleton" style={{ width: '80px', height: '22px', borderRadius: '999px' }} />
        <div className="skeleton" style={{ width: '70px', height: '22px', borderRadius: '999px' }} />
        <div className="skeleton" style={{ width: '90px', height: '22px', borderRadius: '999px' }} />
      </div>

      <div className="skeleton" style={{ width: '100%', height: '36px', marginTop: '0.25rem' }} />

      <div className="flex items-center justify-between" style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
        <div className="skeleton" style={{ width: '100px', height: '18px' }} />
        <div className="skeleton" style={{ width: '110px', height: '34px', borderRadius: '999px' }} />
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="card flex items-center gap-4">
      <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div className="skeleton" style={{ width: '60px', height: '24px' }} />
        <div className="skeleton" style={{ width: '120px', height: '14px' }} />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="data-table-wrapper">
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="skeleton" style={{ flex: 1, height: '24px' }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default { JobCardSkeleton, StatsCardSkeleton, TableSkeleton };
