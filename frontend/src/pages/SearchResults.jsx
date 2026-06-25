import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchJobs } from '../services/api';
import { toast } from 'react-toastify';
import './SearchResults.css';

const JOB_TYPES = ['all', 'job', 'internship'];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
  const [activeType, setActiveType] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q, type) => {
    setLoading(true);
    setSearched(true);
    try {
      const results = await searchJobs(q, type);
      setJobs(results);
    } catch (err) {
      toast.error(err.message || 'Search failed');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setInputVal(q);
    if (q) doSearch(q, activeType);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSearchParams({ q: inputVal.trim() });
    doSearch(inputVal.trim(), activeType);
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    if (query) doSearch(query, type);
  };

  const formatPostedDate = (dateValue) => {
    if (!dateValue) return 'Recently';
    const posted = new Date(dateValue);
    if (Number.isNaN(posted.getTime())) return 'Recently';
    const now = new Date();
    const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const highlightText = (text, keyword) => {
    if (!keyword || !text) return text;
    const parts = String(text).split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase()
        ? <mark key={i} className="sr-highlight">{part}</mark>
        : part
    );
  };

  return (
    <div className="sr-page">
      {/* ─── Search Hero ─── */}
      <div className="sr-hero">
        <div className="sr-hero-inner">
          <h1 className="sr-hero-title">
            {query ? (
              <>Results for "<span className="sr-query-text">{query}</span>"</>
            ) : 'Search Jobs & Internships'}
          </h1>
          <p className="sr-hero-sub">{searched ? `${jobs.length} opportunities found` : 'Find your perfect opportunity'}</p>

          <form className="sr-search-bar" onSubmit={handleSearch}>
            <div className="sr-input-wrap">
              <svg className="sr-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                id="search-input"
                type="text"
                className="sr-input"
                placeholder="Search by role, skill, company or location..."
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                autoFocus
              />
              {inputVal && (
                <button type="button" className="sr-clear-btn" onClick={() => { setInputVal(''); setQuery(''); setJobs([]); setSearched(false); }}>✕</button>
              )}
            </div>
            <button type="submit" className="sr-search-btn" id="search-submit-btn">Search</button>
          </form>

          {/* Type Filters */}
          <div className="sr-type-tabs">
            {JOB_TYPES.map(t => (
              <button
                key={t}
                className={`sr-type-tab ${activeType === t ? 'sr-type-tab--active' : ''}`}
                onClick={() => handleTypeChange(t)}
              >
                {t === 'all' ? 'All' : t === 'job' ? 'Jobs' : 'Internships'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Results Area ─── */}
      <div className="sr-body">
        <div className="sr-body-inner">
          {loading && (
            <div className="sr-loading">
              <div className="sr-spinner"></div>
              <p>Searching opportunities...</p>
            </div>
          )}

          {!loading && searched && jobs.length === 0 && (
            <div className="sr-empty">
              <div className="sr-empty-icon">🔍</div>
              <h3>No results found</h3>
              <p>Try different keywords, or browse all <span className="sr-link" onClick={() => navigate('/jobs')}>Jobs</span> & <span className="sr-link" onClick={() => navigate('/internships')}>Internships</span></p>
            </div>
          )}

          {!loading && !searched && (
            <div className="sr-empty">
              <div className="sr-empty-icon">✨</div>
              <h3>Start searching</h3>
              <p>Type a job title, skill, company name or location above</p>
              <div className="sr-popular">
                <p className="sr-popular-label">Popular searches:</p>
                <div className="sr-tags">
                  {['React Developer', 'Python Internship', 'Marketing', 'Data Science', 'UI/UX Designer', 'Node.js'].map(tag => (
                    <button key={tag} className="sr-tag" onClick={() => { setInputVal(tag); setSearchParams({ q: tag }); doSearch(tag, activeType); }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && jobs.length > 0 && (
            <div className="sr-results">
              <p className="sr-count">{jobs.length} {jobs.length === 1 ? 'result' : 'results'} {query ? `for "${query}"` : ''}</p>
              <div className="sr-list">
                {jobs.map((job, i) => {
                  const desc = job.description ? String(job.description).replace(/<[^>]*>/g, '') : '';
                  const firstLetter = (job.company_name || 'C').charAt(0).toUpperCase();
                  const colors = ['#166534', '#1d4ed8', '#7c3aed', '#c2410c', '#0369a1'];
                  const color = colors[i % colors.length];
                  return (
                    <div
                      key={job.job_id}
                      className="sr-card"
                      onClick={() => navigate(`/opportunity/${job.job_id}`, { state: { job } })}
                      id={`result-card-${job.job_id}`}
                    >
                      <div className="sr-card-left">
                        <div className="sr-avatar" style={{ background: color }}>{firstLetter}</div>
                      </div>
                      <div className="sr-card-body">
                        <div className="sr-card-top">
                          <div>
                            <h3 className="sr-card-title">{highlightText(job.title, query)}</h3>
                            <p className="sr-card-company">{highlightText(job.company_name, query)}</p>
                          </div>
                          <span className={`sr-badge sr-badge--${job.job_type}`}>
                            {job.job_type === 'internship' ? 'Internship' : 'Job'}
                          </span>
                        </div>
                        <div className="sr-card-meta">
                          {job.location && <span className="sr-meta-item">📍 {highlightText(job.location, query)}</span>}
                          {job.job_mode && <span className="sr-meta-item">💼 {job.job_mode}</span>}
                          <span className="sr-meta-item">🕒 {formatPostedDate(job.created_at)}</span>
                        </div>
                        {job.skills_required && (
                          <div className="sr-skills">
                            {String(job.skills_required).split(',').slice(0, 4).map((s, si) => (
                              <span key={si} className="sr-skill-tag">{s.trim()}</span>
                            ))}
                          </div>
                        )}
                        {desc && (
                          <p className="sr-card-desc">{desc.slice(0, 120)}{desc.length > 120 ? '...' : ''}</p>
                        )}
                      </div>
                      <div className="sr-card-action">
                        <button className="sr-view-btn" onClick={e => { e.stopPropagation(); navigate(`/opportunity/${job.job_id}`, { state: { job } }); }}>View →</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
