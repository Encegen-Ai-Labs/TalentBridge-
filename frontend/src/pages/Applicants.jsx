import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getCompanyApplicants,
  updateApplicationStatus
} from '../services/api';
import { toast } from 'react-toastify';
import './Applicants.css';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, shortlisted, selected, rejected
  const [jobFilter, setJobFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const data = await getCompanyApplicants();
      setApplicants(data || []);
      setFilteredApplicants(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  useEffect(() => {
    let result = [...applicants];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }

    // Job filter
    if (jobFilter !== 'all') {
      result = result.filter(item => item.job_title === jobFilter);
    }

    // Branch filter
    if (branchFilter !== 'all') {
      result = result.filter(item => item.branch === branchFilter);
    }

    // Search filter (Name, Email, Position)
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(item => 
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.job_title && item.job_title.toLowerCase().includes(q))
      );
    }

    setFilteredApplicants(result);
  }, [search, statusFilter, jobFilter, branchFilter, applicants]);

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingStatusId(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      toast.success(`Application status updated to ${status}`);
      
      // Update local state
      setApplicants(prev =>
        prev.map(item =>
          item.application_id === applicationId
            ? { ...item, status }
            : item
        )
      );

      // If the currently viewed applicant in the modal is updated, sync their details too
      if (selectedApplicant && selectedApplicant.application_id === applicationId) {
        setSelectedApplicant(prev => ({ ...prev, status }));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update application status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getAvatarColorClass = (name) => {
    if (!name) return 'avatar-green';
    const charCode = name.charCodeAt(0) % 4;
    switch (charCode) {
      case 0: return 'avatar-green';
      case 1: return 'avatar-blue';
      case 2: return 'avatar-purple';
      case 3: return 'avatar-pink';
      default: return 'avatar-green';
    }
  };

  const handleOpenManualResume = (base64Data, fileName) => {
    if (!base64Data) {
      toast.error("Resume file content is empty");
      return;
    }
    try {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.title = fileName || "Resume Preview";
        newWindow.document.write(
          `<iframe src="${base64Data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      } else {
        toast.warning("Pop-up blocked. Please allow popups for this site to view the resume.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to open resume document");
    }
  };

  // Unique lists for filter dropdowns
  const uniqueJobTitles = [...new Set(applicants.map(item => item.job_title).filter(Boolean))];
  const uniqueBranches = [...new Set(applicants.map(item => item.branch).filter(Boolean))];

  // Helper stats counts
  const totalCount = applicants.length;
  const pendingCount = applicants.filter(item => item.status === 'pending').length;
  const shortlistedCount = applicants.filter(item => item.status === 'shortlisted').length;
  const selectedCount = applicants.filter(item => item.status === 'selected').length;
  const rejectedCount = applicants.filter(item => item.status === 'rejected').length;

  if (loading) {
    return (
      <div className="applicants-loader-screen">
        <div className="loader-spinner"></div>
        <p>Loading application overview...</p>
      </div>
    );
  }

  return (
    <div className="applicants-page-container">
      {/* BREADCRUMBS */}
      <div className="breadcrumbs no-print">
        <Link to="/company/dashboard">Dashboard</Link>
        <span className="separator">&gt;</span>
        <span className="active-breadcrumb">Recruitment Suite</span>
      </div>

      {/* HEADER */}
      <div className="applicants-header-block">
        <h1 className="applicants-header-title">Recruitment Overview</h1>
        <p className="applicants-header-subtitle">
          Track candidates, review professional portfolios, and manage applicant hiring pipelines.
        </p>
      </div>

      {/* METRIC CARDS */}
      <div className="applicants-stats-grid">
        <div className="applicants-stat-card">
          <div className="stat-card-icon-wrapper total">👥</div>
          <div className="stat-card-details">
            <span className="stat-card-label">Total Submissions</span>
            <span className="stat-card-value">{totalCount}</span>
          </div>
        </div>

        <div className="applicants-stat-card">
          <div className="stat-card-icon-wrapper pending">📄</div>
          <div className="stat-card-details">
            <span className="stat-card-label">Pending Review</span>
            <span className="stat-card-value">{pendingCount}</span>
          </div>
        </div>

        <div className="applicants-stat-card">
          <div className="stat-card-icon-wrapper shortlisted">⭐</div>
          <div className="stat-card-details">
            <span className="stat-card-label">Shortlisted</span>
            <span className="stat-card-value">{shortlistedCount}</span>
          </div>
        </div>

        <div className="applicants-stat-card">
          <div className="stat-card-icon-wrapper selected">🎉</div>
          <div className="stat-card-details">
            <span className="stat-card-label">Hired / Selected</span>
            <span className="stat-card-value">{selectedCount}</span>
          </div>
        </div>
      </div>

      {/* CONTROLS SECTION */}
      <div className="applicants-control-panel no-print">
        <div className="control-panel-top">
          <div className="status-tabs-list">
            <button
              onClick={() => setStatusFilter('all')}
              className={`status-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
            >
              All Applicants <span className="tab-badge-count">{totalCount}</span>
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`status-tab-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            >
              Pending <span className="tab-badge-count">{pendingCount}</span>
            </button>
            <button
              onClick={() => setStatusFilter('shortlisted')}
              className={`status-tab-btn ${statusFilter === 'shortlisted' ? 'active' : ''}`}
            >
              Shortlisted <span className="tab-badge-count">{shortlistedCount}</span>
            </button>
            <button
              onClick={() => setStatusFilter('selected')}
              className={`status-tab-btn ${statusFilter === 'selected' ? 'active' : ''}`}
            >
              Selected <span className="tab-badge-count">{selectedCount}</span>
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`status-tab-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
            >
              Rejected <span className="tab-badge-count">{rejectedCount}</span>
            </button>
          </div>
        </div>

        <div className="control-panel-bottom">
          <div className="search-input-wrapper">
            <svg
              className="search-icon-svg"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="search-input-field"
              placeholder="Find by candidate name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-select-wrapper">
            <select
              className="filter-select-element"
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
            >
              <option value="all">All Job Roles</option>
              {uniqueJobTitles.map((title, idx) => (
                <option key={idx} value={title}>
                  {title}
                </option>
              ))}
            </select>

            <select
              className="filter-select-element"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="all">All Branches</option>
              {uniqueBranches.map((branch, idx) => (
                <option key={idx} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* APPLICANTS TABULAR / LIST CONTAINER */}
      {filteredApplicants.length === 0 ? (
        <div className="empty-applicants-state">
          <span className="empty-state-icon">📂</span>
          <h3>No applications found</h3>
          <p>We couldn't find any candidate applications matching your selected filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="applicants-table-card">
            <table className="applicants-desktop-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Applied Position</th>
                  <th>Branch / Batch</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th className="no-print">Hiring Pipeline Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((item) => (
                  <tr key={item.application_id}>
                    <td>
                      <div className="candidate-avatar-cell">
                        <div className={`candidate-avatar-circle ${getAvatarColorClass(item.name)}`}>
                          {item.name ? item.name.charAt(0) : 'C'}
                        </div>
                        <div className="candidate-name-email">
                          <strong>{item.name}</strong>
                          <span>{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="position-applied-cell">
                        <span className="position-applied-title">{item.job_title}</span>
                        <span className="position-applied-meta">{item.availability || 'Immediate'} availability</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span className="branch-tag-badge">{item.branch}</span>
                        <span style={{ fontSize: '0.775rem', color: 'var(--text-light)', fontWeight: 500 }}>Batch of {item.year}</span>
                      </div>
                    </td>
                    <td>
                      {new Date(item.applied_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      <span className={`status-pill-badge ${item.status}`}>
                        {item.status === 'pending' ? '● pending' : item.status}
                      </span>
                    </td>
                    <td className="no-print">
                      <div className="actions-cell-wrapper">
                        <select
                          className="status-update-dropdown"
                          value={item.status}
                          disabled={updatingStatusId === item.application_id}
                          onChange={(e) => handleStatusChange(item.application_id, e.target.value)}
                        >
                          <option value="pending">Mark Pending</option>
                          <option value="shortlisted">Shortlist</option>
                          <option value="selected">Select / Hire</option>
                          <option value="rejected">Reject</option>
                        </select>

                        {updatingStatusId === item.application_id ? (
                          <div className="table-row-spinner"></div>
                        ) : (
                          <button
                            className="btn-open-profile-drawer"
                            onClick={() => setSelectedApplicant(item)}
                          >
                            View Portfolio ➔
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="applicants-mobile-list no-print">
            {filteredApplicants.map((item) => (
              <div key={item.application_id} className="applicant-mobile-card">
                <div className="mobile-card-top">
                  <div className="candidate-avatar-cell">
                    <div className={`candidate-avatar-circle ${getAvatarColorClass(item.name)}`}>
                      {item.name ? item.name.charAt(0) : 'C'}
                    </div>
                    <div className="candidate-name-email">
                      <strong>{item.name}</strong>
                      <span>{item.email}</span>
                    </div>
                  </div>
                  <span className={`status-pill-badge ${item.status}`}>
                    {item.status === 'pending' ? '● pending' : item.status}
                  </span>
                </div>

                <div className="mobile-card-body-row">
                  <div className="detail-row">
                    <span className="label">Position</span>
                    <span className="value">{item.job_title}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Academic</span>
                    <span className="value">{item.branch} ({item.year})</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Applied</span>
                    <span className="value">
                      {new Date(item.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mobile-card-actions">
                  <select
                    className="status-update-dropdown"
                    value={item.status}
                    disabled={updatingStatusId === item.application_id}
                    onChange={(e) => handleStatusChange(item.application_id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlist</option>
                    <option value="selected">Select / Hire</option>
                    <option value="rejected">Reject</option>
                  </select>

                  <button
                    className="btn-open-profile-drawer"
                    onClick={() => setSelectedApplicant(item)}
                  >
                    Review Portfolio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PREMIUM DETAIL DRAWER/MODAL */}
      {selectedApplicant && (() => {
        const item = selectedApplicant;
        let resumeDetails = null;

        if (item.resume_option !== 'manual' && item.resume_data) {
          try {
            resumeDetails = typeof item.resume_data === 'string' 
              ? JSON.parse(item.resume_data) 
              : item.resume_data;
          } catch (e) {
            console.error('Error parsing resume JSON', e);
          }
        }

        const skillsArr = item.skills 
          ? item.skills.split(',').map(s => s.trim()).filter(Boolean)
          : [];

        return (
          <div className="applicant-drawer-overlay" onClick={() => setSelectedApplicant(null)}>
            <div className="applicant-drawer-card" onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
              <div className="drawer-header">
                <div className="drawer-header-left">
                  <div className={`drawer-avatar-circle ${getAvatarColorClass(item.name)}`}>
                    {item.name ? item.name.charAt(0) : 'C'}
                  </div>
                  <div className="drawer-title-details">
                    <h2>{item.name}</h2>
                    <div className="role-badge">
                      <span>Applied for:</span>
                      <strong>{item.job_title}</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close-drawer"
                  onClick={() => setSelectedApplicant(null)}
                >
                  &times;
                </button>
              </div>

              {/* Scrollable Split Content */}
              <div className="drawer-content-scrollable">
                
                {/* Left Side: Candidate Quick Metadata */}
                <div className="drawer-left-panel">
                  
                  {/* Contact Info Widget */}
                  <div className="drawer-info-widget">
                    <h4 className="widget-title">Contact & Info</h4>
                    <div className="widget-info-list">
                      <div className="info-item-row">
                        <span className="label">Email Address</span>
                        <span className="value">
                          <a href={`mailto:${item.email}`}>{item.email}</a>
                        </span>
                      </div>
                      <div className="info-item-row">
                        <span className="label">Mobile Number</span>
                        <span className="value">{item.mobile_number || 'N/A'}</span>
                      </div>
                      <div className="info-item-row">
                        <span className="label">Academic Branch</span>
                        <span className="value">{item.branch}</span>
                      </div>
                      <div className="info-item-row">
                        <span className="label">Graduation Year</span>
                        <span className="value">Batch of {item.year}</span>
                      </div>
                    </div>
                  </div>

                  {/* Application Info Widget */}
                  <div className="drawer-info-widget">
                    <h4 className="widget-title">Application</h4>
                    <div className="widget-info-list">
                      <div className="info-item-row">
                        <span className="label">Availability to Join</span>
                        <span className="value" style={{ color: '#16a34a', fontWeight: '700' }}>
                          {item.availability || 'Immediate'}
                        </span>
                      </div>
                      <div className="info-item-row">
                        <span className="label">Applied On</span>
                        <span className="value">
                          {new Date(item.applied_at).toLocaleDateString(undefined, {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="info-item-row">
                        <span className="label">Application ID</span>
                        <span className="value">#{item.application_id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Widget */}
                  {skillsArr.length > 0 && (
                    <div className="drawer-info-widget">
                      <h4 className="widget-title">Candidate Skills</h4>
                      <div className="tag-skills-container">
                        {skillsArr.map((skill, index) => (
                          <span key={index} className="skill-tag-pill">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Side: Professional Resume sheet */}
                <div className="drawer-right-panel">
                  {item.resume_option === 'manual' ? (
                    /* Manual PDF Resume view */
                    <div className="manual-resume-box">
                      <div className="icon">📄</div>
                      <h4>Custom PDF Resume Attached</h4>
                      <p>
                        The applicant uploaded a manual resume document: 
                        <br />
                        <strong>{item.manual_resume_name || 'resume.pdf'}</strong>
                      </p>
                      <button
                        type="button"
                        className="btn-view-pdf-resume"
                        onClick={() => handleOpenManualResume(item.manual_resume_data, item.manual_resume_name)}
                      >
                        📄 Open PDF Resume
                      </button>
                    </div>
                  ) : (
                    /* Inbuilt structured resume view */
                    <>
                      {/* Career Objective */}
                      {resumeDetails?.careerObjective && (
                        <div>
                          <h4 className="resume-section-header">Career Objective</h4>
                          <p className="resume-objective-text">"{resumeDetails.careerObjective}"</p>
                        </div>
                      )}

                      {/* Education history */}
                      {resumeDetails?.education && resumeDetails.education.length > 0 && (
                        <div>
                          <h4 className="resume-section-header">Education History</h4>
                          <div className="resume-items-list">
                            {resumeDetails.education.map((edu, idx) => (
                              <div key={idx} className="resume-timeline-item">
                                <div className="timeline-item-title-row">
                                  <h5>{edu.degree}</h5>
                                  <span className="timeline-item-date">{edu.years}</span>
                                </div>
                                <div className="timeline-item-subtitle-row">
                                  <span>{edu.school}</span>
                                  {edu.stream && (
                                    <>
                                      <span>•</span>
                                      <span>{edu.stream}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Work Experience */}
                      {resumeDetails?.experience && resumeDetails.experience.length > 0 && (
                        <div>
                          <h4 className="resume-section-header">Work Experience</h4>
                          <div className="resume-items-list">
                            {resumeDetails.experience.map((exp, idx) => (
                              <div key={idx} className="resume-timeline-item">
                                <div className="timeline-item-title-row">
                                  <h5>{exp.title}</h5>
                                  <span className="timeline-item-date">{exp.duration}</span>
                                </div>
                                <div className="timeline-item-subtitle-row">
                                  <span>{exp.company}</span>
                                  {exp.location && <span>({exp.location})</span>}
                                  <span className="timeline-item-type-badge">{exp.type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Academic & Personal Projects */}
                      {resumeDetails?.projects && resumeDetails.projects.length > 0 && (
                        <div>
                          <h4 className="resume-section-header">Academic & Personal Projects</h4>
                          <div className="resume-items-list">
                            {resumeDetails.projects.map((proj, idx) => (
                              <div key={idx} className="resume-timeline-item">
                                <div className="timeline-item-title-row">
                                  <h5>{proj.title}</h5>
                                </div>
                                <p className="timeline-item-desc">{proj.description}</p>
                                {proj.link && (
                                  <a
                                    href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="timeline-item-link-btn"
                                  >
                                    🌐 View Project Code / Site
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Courses & Training */}
                      {resumeDetails?.courses && resumeDetails.courses.length > 0 && (
                        <div>
                          <h4 className="resume-section-header">Courses & Training</h4>
                          <div className="resume-items-list">
                            {resumeDetails.courses.map((course, idx) => (
                              <div key={idx} className="resume-timeline-item">
                                <div className="timeline-item-title-row">
                                  <h5>{course.name}</h5>
                                  <span className="timeline-item-date">{course.duration}</span>
                                </div>
                                <div className="timeline-item-subtitle-row">
                                  <span>{course.organization}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Portfolio & Profiles */}
                      {resumeDetails?.portfolio && resumeDetails.portfolio.length > 0 && (
                        <div>
                          <h4 className="resume-section-header">Work Samples & Portfolios</h4>
                          <div className="resume-items-list">
                            {resumeDetails.portfolio.map((port, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <strong>{port.platform}:</strong>
                                <a
                                  href={port.url.startsWith('http') ? port.url : `https://${port.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="timeline-item-link-btn"
                                  style={{ marginTop: 0 }}
                                >
                                  {port.url}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Accomplishments */}
                      {resumeDetails?.accomplishments && resumeDetails.accomplishments.length > 0 && (
                        <div>
                          <h4 className="resume-section-header">Key Accomplishments</h4>
                          <ul className="resume-simple-list">
                            {resumeDetails.accomplishments.map((acc, idx) => (
                              <li key={idx}>{acc}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Extracurricular activities */}
                      {resumeDetails?.extracurriculars && resumeDetails.extracurriculars.length > 0 && (
                        <div>
                          <h4 className="resume-section-header">Extracurricular Activities</h4>
                          <ul className="resume-simple-list">
                            {resumeDetails.extracurriculars.map((activity, idx) => (
                              <li key={idx}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Fallback if empty inbuilt resume details */}
                      {!resumeDetails?.careerObjective && 
                       (!resumeDetails?.education || resumeDetails.education.length === 0) &&
                       (!resumeDetails?.experience || resumeDetails.experience.length === 0) && (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
                          <h4>No Inbuilt Resume details logged</h4>
                          <p>The candidate has not filled detailed resume fields in their profile.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

              </div>

              {/* Footer Actions */}
              <div className="drawer-footer-actions">
                <div className="footer-actions-left">
                  <span className="footer-status-label">Current Pipeline:</span>
                  <span className={`status-pill-badge ${item.status}`}>
                    {item.status === 'pending' ? '● pending' : item.status}
                  </span>
                </div>

                <div className="status-actions-group">
                  <button
                    type="button"
                    className="btn-status-act act-pending"
                    disabled={updatingStatusId === item.application_id || item.status === 'pending'}
                    onClick={() => handleStatusChange(item.application_id, 'pending')}
                  >
                    Mark Pending
                  </button>
                  <button
                    type="button"
                    className="btn-status-act act-shortlist"
                    disabled={updatingStatusId === item.application_id || item.status === 'shortlisted'}
                    onClick={() => handleStatusChange(item.application_id, 'shortlisted')}
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    className="btn-status-act act-reject"
                    disabled={updatingStatusId === item.application_id || item.status === 'rejected'}
                    onClick={() => handleStatusChange(item.application_id, 'rejected')}
                  >
                    Reject Candidate
                  </button>
                  <button
                    type="button"
                    className="btn-status-act act-select"
                    disabled={updatingStatusId === item.application_id || item.status === 'selected'}
                    onClick={() => handleStatusChange(item.application_id, 'selected')}
                  >
                    Hire / Select ✓
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Applicants;