import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import JobCard from '../components/JobCard';
import { JobCardSkeleton } from '../components/LoadingSkeleton';
import {
  Search,
  MapPin,
  Filter,
  RotateCcw,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [type, setType] = useState(searchParams.get('type') || 'All');
  const [experience, setExperience] = useState(searchParams.get('experience') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const categoriesList = [
    'All',
    'Web Development',
    'Software Development',
    'Data Science',
    'UI/UX Design',
    'Cyber Security',
    'Digital Marketing',
    'Cloud & DevOps',
  ];

  const typesList = ['All', 'Full-time', 'Internship', 'Part-time', 'Remote', 'Contract'];
  const experienceList = ['All', 'Fresher', '0-1 Years', '1-3 Years', '3+ Years'];

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 8,
        sort,
      };
      if (search.trim()) params.search = search.trim();
      if (location.trim()) params.location = location.trim();
      if (category !== 'All') params.category = category;
      if (type !== 'All') params.type = type;
      if (experience !== 'All') params.experience = experience;

      const res = await jobsAPI.getJobs(params);
      if (res.data?.success) {
        setJobs(res.data.jobs);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [search, location, category, type, experience, sort, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    const newParams = {};
    if (search.trim()) newParams.search = search.trim();
    if (location.trim()) newParams.location = location.trim();
    if (category !== 'All') newParams.category = category;
    if (type !== 'All') newParams.type = type;
    if (experience !== 'All') newParams.experience = experience;
    if (sort !== 'newest') newParams.sort = sort;
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setCategory('All');
    setType('All');
    setExperience('All');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Browse Opportunities
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Discover and apply for curated college internships, fresher openings, and entry-level positions.
          </p>
        </div>

        {/* Layout: Sidebar Filter & Jobs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }} className="md-grid-cols-1">
          {/* Sidebar Filter */}
          <aside>
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <span className="flex items-center gap-2" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  <Filter size={18} color="var(--primary)" /> Filters
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              <form onSubmit={handleApplyFilter} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Search Keyword */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Keyword Search</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Title or skills..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ paddingLeft: '2.25rem' }}
                    />
                    <Search
                      size={16}
                      color="var(--text-light)"
                      style={{ position: 'absolute', left: '10px', top: '12px' }}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Location</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="City or Remote..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      style={{ paddingLeft: '2.25rem' }}
                    />
                    <MapPin
                      size={16}
                      color="var(--text-light)"
                      style={{ position: 'absolute', left: '10px', top: '12px' }}
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Type */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Job Type</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {typesList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience Level */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Experience Required</label>
                  <select
                    className="form-select"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  >
                    {experienceList.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Apply Filters
                </button>
              </form>
            </div>
          </aside>

          {/* Jobs Listing Main Section */}
          <main>
            {/* Top Bar: Count & Sort */}
            <div
              className="card flex items-center justify-between"
              style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Showing <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{jobs.length}</span> of{' '}
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{total}</span> available roles
              </div>

              <div className="flex items-center gap-2">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sort by:</span>
                <select
                  className="form-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.85rem' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Alphabetical (Title)</option>
                </select>
              </div>
            </div>

            {/* Jobs Cards Feed */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </div>
            ) : jobs.length === 0 ? (
              <div
                className="card text-center"
                style={{
                  padding: '4rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <Briefcase size={28} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>No Jobs Match Your Criteria</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '440px', fontSize: '0.95rem' }}>
                  Try adjusting your search terms, clearing some filters, or broadening your location preferences.
                </p>
                <button onClick={handleResetFilters} className="btn btn-outline-primary btn-sm">
                  <RotateCcw size={14} /> Clear All Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2" style={{ marginTop: '2.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0 0.5rem' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
