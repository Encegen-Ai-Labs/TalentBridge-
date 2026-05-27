import React, { useEffect, useState } from 'react';
import { getAllJobs, getCompanyInternships } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import './StudentOpportunities.css';

/**
 * View‑only opportunities page.
 * Shows job cards with a single "View details" button that navigates to the
 * detailed view for the selected job.
 */
export default function StudentOpportunityViewOnly() {
  const navigate = useNavigate();
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs or internships based on current path
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const isInternshipPage = location.pathname === '/internships';
        const data = isInternshipPage ? await getCompanyInternships() : await getAllJobs();
        setJobs(data || []);
      } catch (error) {
        console.error('Failed to load opportunities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [location.pathname]);

  const handleViewDetails = (job) => {
    navigate(`/opportunity/${job.job_id}`, { state: { job } });
  };

  if (loading) {
    return (
      <div className="loading-wrapper"><div className="spinner"/></div>
    );
  }

  return (
    <div className="opportunities-page">
      <div className="opportunities-container">
        <h1 className="main-title">Opportunities</h1>
        <div className="jobs-grid">
          {jobs.length === 0 ? (
            <div className="empty-state">No opportunities found</div>
          ) : (
            jobs.map((job, index) => {
              const firstLetter = job.company_name?.charAt(0) || 'C';
              return (
                <div key={job.job_id} className="job-card">
                  <div className="card-top">
                    <div className="hiring-badge">Actively Hiring</div>
                    <div className={`company-logo color-${index % 3}`}>{firstLetter}</div>
                  </div>
                  <div className="job-info">
                    <h3>{job.title}</h3>
                    <p className="company-name">{job.company_name || 'Company'}</p>
                  </div>
                  <div className="card-footer">
                    <button className="view-btn" onClick={() => handleViewDetails(job)}>View details</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
