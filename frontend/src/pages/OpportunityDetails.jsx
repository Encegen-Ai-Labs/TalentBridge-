import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { getJobById, getAllJobs, applyJob, saveJob } from '../services/api';
import { toast } from 'react-toastify';
import './OpportunityDetails.css';

export default function OpportunityDetails() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(state?.job || null);
  const [loading, setLoading] = useState(!job);
  const [recommendations, setRecommendations] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!job && id) {
      const fetchJob = async () => {
        try {
          const data = await getJobById(id);
          setJob(data);
        } catch (error) {
          console.error('Failed to fetch job details:', error);
          toast.error('Failed to load job details');
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    } else {
      setLoading(false);
    }
  }, [id, job]);

  useEffect(() => {
    if (!job) return;

    const loadRecommendations = async () => {
      try {
        const allJobs = await getAllJobs();
        const currentId = String(job.job_id || job.id || job._id);
        const similarJobs = (allJobs || [])
          .filter((item) => String(item.job_id || item.id || item._id) !== currentId)
          .filter((item) => {
            const sameCategory = item.category && job.category && item.category.toLowerCase() === job.category.toLowerCase();
            const sameLocation = item.location && job.location && item.location.toLowerCase() === job.location.toLowerCase();
            return sameCategory || sameLocation;
          })
          .slice(0, 3);

        setRecommendations(similarJobs.length ? similarJobs : (allJobs || []).filter((item) => String(item.job_id || item.id || item._id) !== currentId).slice(0, 3));
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      }
    };

    loadRecommendations();
  }, [job]);

  const handleApplyNow = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please login to apply');
      navigate('/login');
      return;
    }
    navigate(`/apply/${job.job_id || job.id}`, { state: { job } });
  };

  const handleSaveJob = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please login to save jobs');
      navigate('/login');
      return;
    }

    try {
      const jobId = String(job.job_id || job.id || job._id);
      await saveJob(jobId);
      setIsSaved(true);
      toast.success('Job saved successfully');
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save job');
    }
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
      </div>
    );
  }

  if (!job) {
    return <div className="empty-state">Job not found.</div>;
  }

  // Parse custom description structure safely
  let parsedDesc = {};
  try {
    if (job.description && typeof job.description === 'string' && job.description.startsWith('{')) {
      parsedDesc = JSON.parse(job.description);
    }
  } catch (e) {
    parsedDesc = {};
  }

  const companyDescription = parsedDesc.about_company || job.company_description || '-';
  const preferredCandidate = parsedDesc.preferred_candidate || parsedDesc.preferredCandidate || '-';
  const educationText = parsedDesc.education || job.education || '-';
  const responsibilitiesText = parsedDesc.responsibilities || parsedDesc.requirements || job.skills_required || '-';
  const jobHighlights = (parsedDesc.highlights && Array.isArray(parsedDesc.highlights) && parsedDesc.highlights.length > 0) ? parsedDesc.highlights : (job.highlights ? (Array.isArray(job.highlights) ? job.highlights : job.highlights.split(',').map(h => h.trim())) : []);
  
  // Extract salary from parsed description first, then fallback to job fields
  const salaryMin = parsedDesc.salary_min || job.salary_min || '-';
  const salaryMax = parsedDesc.salary_max || job.salary_max || '-';
  const salaryDisplay = salaryMin !== '-' && salaryMax !== '-' ? `₹${salaryMin} - ₹${salaryMax}` : (salaryMin !== '-' ? `₹${salaryMin}` : '-');
  
  const experience = parsedDesc.experience || job.experience || '-';
  const industry = parsedDesc.industry || job.industry || '-';

  const responsibilityLines = responsibilitiesText === '-' ? [] : responsibilitiesText.split('\n').filter(Boolean);

  return (
    <div className="opportunity-details-page">
      <div className="container-wrapper">
        
        {/* Navigation Action */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>

        <div className="opportunity-details-grid">
          {/* Main Workspace Frame */}
          <main className="detail-main">
            
            {/* Main Header / Job Brief Module */}
            <div className="detail-hero-card">
              <div className="hero-top-row">
                <div className="hero-identity">
                  <div className="company-logo-placeholder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  </div>
                  <div className="hero-header-text">
                    <h1 className="main-title">{job.title || 'Graphic Designer'}</h1>
                    <span className="company-name">{job.company_name || 'Prodigy Brains'}</span>
                  </div>
                </div>
                <div className="detail-hero-actions">
                  <button className="primary-cta-btn" onClick={handleApplyNow}>Apply</button>
                  <button className="secondary-cta-btn" onClick={handleSaveJob}>
                    {isSaved ? '💾 Saved' : '💾 Save'}
                  </button>
                </div>
              </div>

              <div className="job-meta-row">
                <span className="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  {salaryDisplay}
                </span>
                <span className="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {job.location || '-'}
                </span>
                <span className="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {experience}
                </span>
              </div>

              {jobHighlights.length > 0 && (
                <div className="job-highlights-section">
                  <h4 className="sub-section-title">Job Highlights</h4>
                  <div className="highlight-tags-group">
                    {jobHighlights.slice(0, 5).map((highlight, idx) => (
                      <span key={idx} className="highlight-tag">{highlight}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Roles and Responsibilities Panel */}
            <div className="content-card section-roles">
              <h3 className="card-heading-title decorative-border">Roles & Responsibilities</h3>
              {responsibilityLines.length > 0 ? (
                <ul className="responsibilities-checklist">
                  {responsibilityLines.map((line, index) => (
                    <li key={index} className="checklist-item">
                      <span className="check-icon-wrapper">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                      <p>{line}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="card-body-paragraph">-</p>
              )}
            </div>

            {/* Two-Column Specification Panel */}
            <div className="detail-panels-row">
              <div className="content-card">
                <h3 className="card-heading-title">Preferred Candidate</h3>
                <p className="card-body-paragraph">{preferredCandidate}</p>
              </div>

              <div className="content-card">
                <h3 className="card-heading-title">Education</h3>
                <div className="card-body-paragraph education-block">
                  {educationText === '-' ? (
                    <p>-</p>
                  ) : (
                    educationText.split('\n').map((edu, idx) => (
                      edu.trim() && <p key={idx}>{edu}</p>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Employment Details Structural Meta-Row */}
            <div className="structural-details-card">
              <div className="struct-col">
                <span className="struct-label">EMPLOYMENT TYPE</span>
                <span className="struct-value">{job.job_type === 'internship' ? 'Internship' : 'Full Time'}</span>
              </div>
              <div className="struct-col">
                <span className="struct-label">ROLE CATEGORY</span>
                <span className="struct-value">{job.category || '-'}</span>
              </div>
              <div className="struct-col">
                <span className="struct-label">INDUSTRY</span>
                <span className="struct-value">{industry}</span>
              </div>
            </div>

            {/* Company Bio Module */}
            <div className="content-card section-company">
              <h3 className="card-heading-title">About {job.company_name || 'Company'}</h3>
              <p className="card-body-paragraph">{companyDescription}</p>
            </div>

            {/* Context-Driven Similar Listings Row */}
            {recommendations.length > 0 && (
              <div className="similar-jobs-section">
                <h3 className="section-title-label">Similar Jobs for You</h3>
                <div className="similar-jobs-list">
                  {recommendations.slice(0, 2).map((rec) => {
                    const recId = String(rec.job_id || rec.id || rec._id);
                    const firstLetter = rec.company_name?.charAt(0) || 'C';
                    return (
                      <div
                        key={recId}
                        className="similar-job-card"
                        onClick={() => navigate(`/opportunity/${recId}`, { state: { job: rec } })}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="similar-job-main">
                          <div className="similar-icon-box">
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{firstLetter}</span>
                          </div>
                          <div className="similar-job-info">
                            <h4>{rec.title}</h4>
                            <span className="similar-company">{rec.company_name}</span>
                            <div className="similar-meta">
                              <span>📍 {rec.location || '-'}</span>
                              <span>💼 {rec.category || '-'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="similar-salary-range">
                          {rec.salary_min && rec.salary_max ? `₹${rec.salary_min}-${rec.salary_max}` : '-'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </main>

          {/* Persistent Floating Analytics / Sidebar Frame */}
          <aside className="detail-sidebar">
            
            {/* Recommended Positions Card */}
            <div className="sidebar-container-card recommended-card">
              <h3 className="sidebar-section-heading">Recommended Jobs</h3>
              {recommendations.length > 0 ? (
                <div className="recommended-list">
                  {recommendations.slice(0, 3).map((rec) => {
                    const recId = String(rec.job_id || rec.id || rec._id);
                    const firstLetter = rec.company_name?.charAt(0) || 'C';
                    return (
                      <div
                        key={recId}
                        className="rec-item"
                        onClick={() => navigate(`/opportunity/${recId}`, { state: { job: rec } })}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="rec-avatar" style={{ backgroundColor: '#e0f2fe', color: '#1d4ed8' }}>
                          {firstLetter}
                        </div>
                        <div className="rec-details">
                          <h4>{rec.title}</h4>
                          <span className="rec-company">{rec.company_name}</span>
                          <span className="rec-meta">{rec.category || '-'} • {rec.location || '-'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: '#64748b', padding: '16px 0' }}>No recommendations available</p>
              )}
              <button className="view-matches-btn" onClick={() => navigate('/jobs')}>View All Matches</button>
            </div>

            {/* Salary Distributions Graphic Metric Panel */}
            <div className="sidebar-container-card salary-insights-card">
              <div className="salary-card-header">
                <h3>Salary Insights</h3>
              </div>
              
              <p className="salary-insights-text">
                {salaryDisplay !== '-' ? `Offered Salary: ${salaryDisplay}` : 'Salary information not disclosed'}
              </p>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}