import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyApplications } from '../services/api';
import { coursesData } from '../data/coursesData';
import { toast } from 'react-toastify';
import './MyApplications.css';

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  
  // Toggle mock "old" applications for interactive depth
  const [showOldApplications, setShowOldApplications] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please log in to view your applications.');
        navigate('/login');
        return;
      }

      try {
        const data = await getMyApplications();
        setApplications(data);
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to retrieve your application history.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `Applied on ${date.getDate()} ${months[date.getMonth()]}' ${String(date.getFullYear()).slice(-2)}`;
  };

  // Generate a deterministic match percentage based on title string length
  const getMatchPercentage = (title) => {
    if (!title) return 85;
    const seed = title.length;
    return 75 + (seed % 20); // between 75% and 95%
  };

  // Generate deterministic applicant count based on application_id
  const getApplicantCount = (appId) => {
    const base = appId ? (appId * 143) : 2642;
    return (base % 3000) + 120; // realistic number of applicants
  };

  // Mock old applications for demonstration
  const oldApplicationsMock = [
    {
      application_id: 99,
      title: "Junior Web Developer Internship",
      company_name: "PixelCraft Solutions",
      applied_at: "2026-02-12T10:00:00.000Z",
      status: "rejected"
    },
    {
      application_id: 98,
      title: "Content Marketing Intern",
      company_name: "LogiTech Systems",
      applied_at: "2026-01-20T08:30:00.000Z",
      status: "selected"
    }
  ];

  const visibleApplications = showOldApplications 
    ? [...applications, ...oldApplicationsMock]
    : applications;

  // Pagination logic
  const itemsPerPage = 5;
  const totalPages = Math.ceil(visibleApplications.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = visibleApplications.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handleStartChat = () => {
    setIsChatModalOpen(true);
  };

  if (loading) {
    return (
      <div className="applications-loading-container">
        <div className="spinner"></div>
        <p>Fetching your application campaigns...</p>
      </div>
    );
  }

  return (
    <div className="my-applications-page">
      <div className="applications-main-container">
        
        {/* Title Header */}
        <h1 className="applications-main-title">My Application</h1>

        {/* Premium Upgrade Banner */}
        <div className="pro-upgrade-banner">
          <div className="banner-left-info">
            <span className="banner-item pro-only">
              Unlock recruiter chat: <span className="highlight-tag">✦ PRO only</span>
            </span>
            <span className="divider-dot">•</span>
            <span className="banner-item">
              Application feedback: <strong className="green-count">2/2</strong>
            </span>
            <span className="divider-dot">•</span>
            <span className="banner-item">
              Application boost: <strong className="green-count">2/2</strong>
            </span>
            <span className="divider-pipe">|</span>
            <span className="banner-item resets-text">Resets in 30 days</span>
          </div>
          
          <button 
            type="button" 
            className="btn-upgrade-pro"
            onClick={() => setIsProModalOpen(true)}
          >
            ✦ Upgrade to PRO &gt;
          </button>
        </div>

        {/* Applications Catalog Card */}
        <div className="applications-table-card">
          {visibleApplications.length === 0 ? (
            <div className="empty-applications-state">
              <span className="empty-icon">📁</span>
              <h3>No Active Applications</h3>
              <p>You haven't submitted any job or internship applications yet.</p>
              <button 
                type="button" 
                className="btn-discover-opps"
                onClick={() => navigate('/internships')}
              >
                Discover Internships
              </button>
            </div>
          ) : (
            <div className="table-responsive-wrapper">
              <table className="applications-data-table">
                <thead>
                  <tr>
                    <th align="left">Opportunities</th>
                    <th align="center">Match</th>
                    <th align="center">Applicants</th>
                    <th align="center">Application Status</th>
                    <th align="center">View Application</th>
                    <th align="center">Recruiter Chat</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((app) => {
                    const matchScore = getMatchPercentage(app.title);
                    const applicantsCount = getApplicantCount(app.application_id);
                    const isCustomResume = app.resume_option === 'manual';

                    return (
                      <tr key={app.application_id}>
                        {/* Opportunities details column */}
                        <td align="left" className="col-opportunity">
                          <div className="opp-title-row">
                            <span className="opp-title">{app.title}</span>
                            <span 
                              className="opp-link-icon" 
                              title="View opportunity specifications"
                              onClick={() => navigate('/internships')}
                            >
                              ↗
                            </span>
                          </div>
                          <span className="opp-company">{app.company_name}</span>
                          <span className="opp-applied-date">{formatDate(app.applied_at)}</span>
                        </td>

                        {/* Match score column */}
                        <td align="center">
                          <span className={`match-badge ${matchScore > 88 ? 'high' : matchScore > 80 ? 'medium' : 'low'}`}>
                            {matchScore}% Match
                          </span>
                        </td>

                        {/* Applicants column */}
                        <td align="center" className="col-applicants-count">
                          <strong>{applicantsCount}</strong>
                        </td>

                        {/* Status column */}
                        <td align="center">
                          <span className={`status-pill-badge ${app.status || 'applied'}`}>
                            {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Applied'}
                          </span>
                        </td>

                        {/* View document icon column */}
                        <td align="center">
                          <button
                            type="button"
                            className="btn-action-document"
                            title="Review submitted application details"
                            onClick={() => setSelectedApplication(app)}
                          >
                            📄
                          </button>
                        </td>

                        {/* Recruiter chat column */}
                        <td align="center">
                          <button
                            type="button"
                            className="btn-action-chat"
                            onClick={handleStartChat}
                          >
                            💬 Start chat
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination & Toggles Footer */}
        {visibleApplications.length > 0 && (
          <div className="applications-footer-pagination">
            <div className="pagination-controls">
              <button 
                type="button" 
                className="btn-paginate" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                &lt; Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button 
                  key={i + 1}
                  type="button" 
                  className={`page-number-pill ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                type="button" 
                className="btn-paginate" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next &gt;
              </button>
            </div>

            <button 
              type="button" 
              className="link-view-old"
              onClick={() => {
                setShowOldApplications(!showOldApplications);
                setCurrentPage(1);
              }}
            >
              {showOldApplications ? '← View active applications' : 'View old applications →'}
            </button>
          </div>
        )}

        {/* Skill Course recommendations */}
        <div className="recommendations-section">
          <h2 className="recommendations-title">Learn these skills to build a career in UI/UX</h2>
          <p className="recommendations-subtitle">
            These recommendations are based on your profile and application history
          </p>

          <div className="courses-recommendations-grid">
            {coursesData.map((course) => (
              <div 
                key={course.id} 
                className={`course-card ${course.gradient}`}
                onClick={() => navigate(`/course/${course.id}`)}
              >
                <div className="course-visual-top">
                  <span className="course-tech-badge">{course.badge}</span>
                  <span className="course-duration">{course.duration}</span>
                </div>
                <div className="course-card-body">
                  <h3>{course.title}</h3>
                  <p>{course.shortDescription}</p>
                  <div className="course-card-footer">
                    <span className="course-rating">⭐ {course.rating} ({(course.reviews / 1000).toFixed(1)}k reviews)</span>
                    <span className="view-course-arrow">Read more ➔</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- Upgrade to PRO Modal --- */}
      {isProModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProModalOpen(false)}>
          <div className="modal-card pro-feature-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header pro-banner-accent">
              <h2>✦ Unlock Premium Status ✦</h2>
              <button 
                type="button" 
                className="close-modal-btn"
                onClick={() => setIsProModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content pro-features-list">
              <div className="pro-feature-item">
                <span className="feature-bullet">💬</span>
                <div>
                  <strong>Direct Recruiter Chat</strong>
                  <p>Skip the queue and message hiring managers directly inside applied campaigns.</p>
                </div>
              </div>

              <div className="pro-feature-item">
                <span className="feature-bullet">🚀</span>
                <div>
                  <strong>2x Application Boost</strong>
                  <p>Increase your profile visibility to employers by 200% on active job listings.</p>
                </div>
              </div>

              <div className="pro-feature-item">
                <span className="feature-bullet">📄</span>
                <div>
                  <strong>Expert Resume Analysis</strong>
                  <p>Get personalized detailed reviews of your ATS-friendly resume layout within 24 hours.</p>
                </div>
              </div>

              <div className="pro-feature-item">
                <span className="feature-bullet">⭐</span>
                <div>
                  <strong>Exclusive VIP Internships</strong>
                  <p>Access high-paying campaigns and internships reserved exclusively for PRO members.</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-modal-cancel"
                onClick={() => setIsProModalOpen(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn-modal-apply btn-pro-purchase"
                onClick={() => {
                  toast.success('Upgrade completed successfully! Welcome to Premium Status.');
                  setIsProModalOpen(false);
                }}
              >
                Unlock Pro Status $9.99
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Recruiter Chat Pro Alert Modal --- */}
      {isChatModalOpen && (
        <div className="modal-overlay" onClick={() => setIsChatModalOpen(false)}>
          <div className="modal-card chat-block-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Recruiter Chat Locked</h2>
              <button 
                type="button" 
                className="close-modal-btn"
                onClick={() => setIsChatModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content text-center-modal">
              <span className="lock-icon">🔒</span>
              <h3>Premium Upgrade Required</h3>
              <p>
                Direct communication with recruiters is a **PRO-exclusive** feature. Upgrade today to unlock direct recruiter chat, application feedback, and professional resume analysis.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-modal-cancel"
                onClick={() => setIsChatModalOpen(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn-modal-apply"
                onClick={() => {
                  setIsChatModalOpen(false);
                  setIsProModalOpen(true);
                }}
              >
                Upgrade to PRO ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- View Application Details Modal --- */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-card app-summary-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Summary</h2>
              <button 
                type="button" 
                className="close-modal-btn"
                onClick={() => setSelectedApplication(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="summary-section">
                <strong>Opportunity Title</strong>
                <p className="summary-main-val">{selectedApplication.title}</p>
              </div>

              <div className="summary-section">
                <strong>Company Name</strong>
                <p className="summary-sub-val">{selectedApplication.company_name}</p>
              </div>

              <div className="summary-grid-box">
                <div className="summary-box">
                  <strong>Date Applied</strong>
                  <p>{formatDate(selectedApplication.applied_at)}</p>
                </div>
                <div className="summary-box">
                  <strong>Status</strong>
                  <p className={`status-pill-badge ${selectedApplication.status || 'applied'}`}>
                    {selectedApplication.status ? selectedApplication.status.toUpperCase() : 'APPLIED'}
                  </p>
                </div>
              </div>

              <div className="summary-section">
                <strong>Selected Availability</strong>
                <p className="summary-badge-val">⚡ {selectedApplication.availability || 'Immediate (Default)'}</p>
              </div>

              <div className="summary-section">
                <strong>Resume Applied With</strong>
                {selectedApplication.resume_option === 'manual' ? (
                  <div className="resume-applied-box">
                    <span className="file-icon">📤</span>
                    <div className="file-info-block">
                      <strong>Custom Document Upload</strong>
                      <p>{selectedApplication.manual_resume_name || 'Resume_Document.pdf'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="resume-applied-box">
                    <span className="file-icon">📄</span>
                    <div className="file-info-block">
                      <strong>Inbuilt Interactive Resume</strong>
                      <p>Synchronized from your profile builder page.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-modal-cancel"
                onClick={() => setSelectedApplication(null)}
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
