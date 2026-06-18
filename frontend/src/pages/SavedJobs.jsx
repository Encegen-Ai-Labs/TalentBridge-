import React, { useEffect, useState } from 'react';
import { getSavedJobs, getAllJobs, removeSavedJob } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './StudentOpportunities.css';

export default function SavedJobs() {
  const [savedIds, setSavedIds] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let ids = [];
      if (token) ids = await getSavedJobs();
      else ids = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setSavedIds(ids || []);

      const all = await getAllJobs();
      const filtered = all.filter(j => ids.includes(String(j.job_id || j.id || j._id)));
      setJobs(filtered);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const jobIdOf = (job) => job.job_id || job.id || job._id;

  const formatPostedDate = (dateValue) => {
    if (!dateValue) return 'Recently posted';
    const posted = new Date(dateValue);
    if (Number.isNaN(posted.getTime())) return 'Recently posted';
    const now = new Date();
    const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const handleRemove = async (job) => {
    const id = String(jobIdOf(job));
    const token = localStorage.getItem('token');
    try {
      if (token) {
        const saved = await removeSavedJob(id);
        const normalized = (saved || []).map(String);
        window.localStorage.setItem('savedJobs', JSON.stringify(normalized));
        setSavedIds(normalized);
        setJobs(prev => prev.filter(j => String(jobIdOf(j)) !== id));
        toast.success('Removed from saved');
      } else {
        const current = JSON.parse(localStorage.getItem('savedJobs') || '[]').filter(i => String(i) !== id);
        localStorage.setItem('savedJobs', JSON.stringify(current));
        setSavedIds(current);
        setJobs(prev => prev.filter(j => String(jobIdOf(j)) !== id));
        toast.success('Removed from saved');
      }
    } catch (err) {
      toast.error('Failed to remove saved');
    }
  };

  if (loading) return (
    <div className="loading-wrapper"><div className="spinner"/></div>
  );

  return (
    <section className="student-opportunities-outer">
      <div className="student-opportunities-page">
        <div className="student-opportunities-container">
          <div className="header-meta-section">
            <div className="title-block">
              <h1 className="main-title">Saved jobs</h1>
              <p className="subtitle">Keep track of opportunities you want to revisit later.</p>
            </div>
            <div className="top-note-apply">
              <span className="note-text">{jobs.length} saved job{jobs.length === 1 ? '' : 's'}</span>
              <button className="apply-now-btn" onClick={() => navigate('/jobs')}>Browse jobs</button>
            </div>
          </div>

          <div className="jobs-pill-container"><span className="jobs-pill">Saved ({jobs.length})</span></div>

          <div className="opportunities-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', width: '100%' }}>
            <main className="opportunities-main">
              <div className="jobs-list">
                {jobs.length === 0 ? (
                  <div className="empty-state">You have no saved jobs yet. Browse jobs to add them here.</div>
                ) : (
                  jobs.map((job, index) => {
                    const firstLetter = job.company_name?.charAt(0) || 'C';
                    const id = String(jobIdOf(job));
                    const description = job.description ? String(job.description).replace(/<[^>]*>/g, '') : '';
                    return (
                      <div className="job-card" key={id || index}>
                        <div className="card-layout-wrapper">
                          <div className="selection-column">
                            <input type="checkbox" className="job-select-checkbox" />
                          </div>
                          <div className="content-column">
                            <div className="card-top-header">
                              <div className="meta-titles">
                                <h3 className="job-role-title">{job.title || 'Untitled role'}</h3>
                                <p className="company-text-link">{job.company_name || 'Unknown company'}</p>
                              </div>
                              <div className={`company-avatar logo-bg-${index % 3}`}>{firstLetter}</div>
                            </div>

                            <div className="job-parameters-row">
                              <span className="param-item">📍 {job.location || 'Remote / unspecified'}</span>
                              <span className="param-item">🕒 {formatPostedDate(job.created_at || job.posted_at || job.date)}</span>
                            </div>

                            <div className="job-snippet">
                              {description ? `${description.slice(0, 130)}${description.length > 130 ? '...' : ''}` : 'No description provided.'}
                            </div>

                            <div className="card-action-footer">
                              <span className="saved-badge">Saved</span>
                              <div className="footer-right-buttons">
                                <button type="button" className="action-inline-btn text-muted" onClick={() => handleRemove(job)}>❌ Remove</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </section>
  );
}
