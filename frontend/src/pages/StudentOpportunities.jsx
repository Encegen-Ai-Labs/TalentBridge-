import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllJobs, applyJob, getStudentProfile } from '../services/api';
import { toast } from 'react-toastify';
import './StudentOpportunities.css';

export default function StudentOpportunities() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Modal & Apply Form State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [isApplyingFormActive, setIsApplyingFormActive] = useState(false);
  const [availability, setAvailability] = useState('Immediate');
  const [customAvailabilityText, setCustomAvailabilityText] = useState('');
  const [resumeOption, setResumeOption] = useState('inbuilt');
  const [customFileName, setCustomFileName] = useState('');
  const [customFileBase64, setCustomFileBase64] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getAllJobs();
        setJobs(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load opportunity campaigns.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filterPills = [
    'All',
    'Big brands',
    'Work from home',
    'Part-time',
    'Engineering',
    'Media',
    'Design',
    'Data Science'
  ];

  // Parse job description and extract complex details (salary, duration, category) gracefully
  const parseJobInfo = (job) => {
    let rawDesc = job.description;
    let salaryMin = '2,000';
    let salaryMax = '2,100';
    let duration = '3 Months';
    let category = 'Engineering';

    try {
      if (job.description && job.description.startsWith('{')) {
        const parsed = JSON.parse(job.description);
        rawDesc = parsed.description;
        salaryMin = parsed.salary_min || 'Negotiable';
        salaryMax = parsed.salary_max || 'Not Specified';
        duration = parsed.duration || '3 Months';
        category = parsed.category || 'Engineering';
      }
    } catch (e) {
      // fallback
    }

    if (job.job_type === 'full-time') {
      duration = 'Permanent';
    }

    return {
      rawDesc,
      salaryMin,
      salaryMax,
      duration,
      category
    };
  };

  const handleInitiateApply = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Please log in as a student to apply.');
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      // 1. Fetch student profile to verify resume completeness
      const data = await getStudentProfile();
      if (!data || !data.profile || !data.profile.resume_data) {
        toast.warning('Please complete editing your resume before applying. Redirecting you...');
        setTimeout(() => {
          navigate('/edit-resume');
        }, 1500);
        return;
      }

      // Check if resume_data is actually filled (at least a career objective or education/skills)
      const rData = data.profile.resume_data;
      const isFilled = rData.careerObjective || (rData.education && rData.education.length > 0) || (data.profile.skills && data.profile.skills.trim() !== '');

      if (!isFilled) {
        toast.warning('Your resume is empty. Please complete editing your resume before applying. Redirecting...');
        setTimeout(() => {
          navigate('/edit-resume');
        }, 1500);
        return;
      }

      // 2. Open the basic application form inside the modal
      setIsApplyingFormActive(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to verify profile status. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit.');
      return;
    }

    setCustomFileName(file.name);
    
    // Read file as Base64 string
    const reader = new FileReader();
    reader.onload = () => {
      setCustomFileBase64(reader.result);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast.error('Failed to read file contents.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitApplication = async () => {
    setSubmittingApp(true);
    try {
      const finalAvailability = availability === 'custom' 
        ? (customAvailabilityText || 'Notice Period')
        : (availability === '15_days' ? 'Within 15 days' : availability === '30_days' ? 'Within 30 days' : 'Immediate');

      const payload = {
        availability: finalAvailability,
        resume_option: resumeOption,
        manual_resume_name: resumeOption === 'manual' ? customFileName : null,
        manual_resume_data: resumeOption === 'manual' ? customFileBase64 : null
      };

      await applyJob(selectedJob.job_id, payload);
      toast.success('Applied Successfully! Your application has been submitted.');
      
      // Reset state and close modal
      setIsApplyingFormActive(false);
      setSelectedJob(null);
      setAvailability('Immediate');
      setResumeOption('inbuilt');
      setCustomFileName('');
      setCustomFileBase64('');
      setCustomAvailabilityText('');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to submit application.');
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleViewDetails = (job) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Please log in or register to view opportunity details.');
      navigate('/login');
      return;
    }
    setSelectedJob(job);
  };

  // Filter Logic
  const filteredJobs = jobs.filter((job) => {
    const info = parseJobInfo(job);
    
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Work from home') {
      return job.location?.toLowerCase().includes('remote') || job.location?.toLowerCase().includes('home');
    }
    if (activeFilter === 'Engineering') {
      return info.category === 'Engineering';
    }
    if (activeFilter === 'Design') {
      return info.category === 'Design';
    }
    if (activeFilter === 'Part-time') {
      return job.job_type === 'internship'; // map to internship
    }
    if (activeFilter === 'Big brands') {
      return job.company_name?.toLowerCase().includes('scout') || job.company_name?.toLowerCase().includes('vanguard');
    }
    return true; // default fallback
  });

  if (loading) {
    return (
      <div className="opportunities-loading">
        <div className="spinner"></div>
        <p>Loading internship opportunities...</p>
      </div>
    );
  }

  return (
    <div className="opportunities-page">
      <div className="opportunities-container">
        {/* Header Title */}
        <h1 className="opportunities-title">Internships</h1>

        {/* Horizontal Filters matching Figma mockup 2 */}
        <div className="filters-carousel">
          {filterPills.map((pill) => (
            <button
              key={pill}
              className={`filter-pill ${activeFilter === pill ? 'active' : ''}`}
              onClick={() => setActiveFilter(pill)}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Opportunities Cards Grid */}
        <div className="opportunities-grid">
          {filteredJobs.length === 0 ? (
            <div className="empty-catalog-state">
              <p>No internship campaigns match your active search filter.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const info = parseJobInfo(job);
              const firstLetter = job.company_name ? job.company_name.charAt(0).toUpperCase() : 'C';

              return (
                <div key={job.job_id} className="opportunity-card">
                  {/* Top Header */}
                  <div className="card-top-row">
                    <span className="actively-hiring-badge">
                      <span className="badge-dot">●</span> Actively hiring
                    </span>
                    
                    {/* Logo/Icon shape on top right */}
                    <div className="company-logo-badge">
                      <span>{firstLetter}</span>
                    </div>
                  </div>

                  {/* Title & Company */}
                  <div className="card-main-title">
                    <h3>{job.title}</h3>
                    <p className="company-name">{job.company_name || 'HireKarma Client'}</p>
                  </div>

                  {/* Detail Info list with custom icons */}
                  <div className="card-details-list">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span>{job.location}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-icon">💰</span>
                      <span>
                        {info.salaryMin === 'Negotiable' 
                          ? 'Negotiable' 
                          : `Rs ${info.salaryMin} - Rs ${info.salaryMax} / month`}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>{info.duration}</span>
                    </div>
                  </div>

                  {/* Job or Internship label on left of details */}
                  <div className="card-footer-meta">
                    <span className="job-type-label">
                      {job.job_type === 'internship' ? 'Internship' : 'Job'}
                    </span>
                    
                    <button
                      type="button"
                      className="btn-view-details"
                      onClick={() => handleViewDetails(job)}
                    >
                      View details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modern Glassmorphic Application Details Modal */}
      {selectedJob && (() => {
        const info = parseJobInfo(selectedJob);
        const skillsArray = selectedJob.skills_required 
          ? selectedJob.skills_required.split(',') 
          : [];

        return (
          <div className="modal-overlay">
            <div className={`modal-card ${isApplyingFormActive ? 'apply-form-card' : ''}`}>
              <div className="modal-header">
                <h2>{isApplyingFormActive ? 'Apply for Opportunity' : 'Opportunity Details'}</h2>
                <button 
                  type="button" 
                  className="close-modal-btn"
                  onClick={() => {
                    setSelectedJob(null);
                    setIsApplyingFormActive(false);
                  }}
                >
                  ×
                </button>
              </div>

              {isApplyingFormActive ? (
                /* --- Sleek Glassmorphic Apply Form --- */
                <div className="modal-content apply-form-content">
                  <div className="job-summary-badge">
                    <strong>{selectedJob.title}</strong>
                    <span>{selectedJob.company_name}</span>
                  </div>

                  {/* Availability Section */}
                  <div className="form-section">
                    <label className="form-label">Availability to Join</label>
                    <div className="availability-options">
                      <div 
                        className={`availability-radio ${availability === 'Immediate' ? 'selected' : ''}`}
                        onClick={() => setAvailability('Immediate')}
                      >
                        <input 
                          type="radio" 
                          name="availability"
                          checked={availability === 'Immediate'}
                          onChange={() => setAvailability('Immediate')}
                        />
                        <span>Immediate</span>
                      </div>
                      <div 
                        className={`availability-radio ${availability === '15_days' ? 'selected' : ''}`}
                        onClick={() => setAvailability('15_days')}
                      >
                        <input 
                          type="radio" 
                          name="availability"
                          checked={availability === '15_days'}
                          onChange={() => setAvailability('15_days')}
                        />
                        <span>Within 15 days</span>
                      </div>
                      <div 
                        className={`availability-radio ${availability === '30_days' ? 'selected' : ''}`}
                        onClick={() => setAvailability('30_days')}
                      >
                        <input 
                          type="radio" 
                          name="availability"
                          checked={availability === '30_days'}
                          onChange={() => setAvailability('30_days')}
                        />
                        <span>Within 30 days</span>
                      </div>
                      <div 
                        className={`availability-radio ${availability === 'custom' ? 'selected' : ''}`}
                        onClick={() => setAvailability('custom')}
                      >
                        <input 
                          type="radio" 
                          name="availability"
                          checked={availability === 'custom'}
                          onChange={() => setAvailability('custom')}
                        />
                        <span>Custom Notice Period</span>
                      </div>
                    </div>

                    {availability === 'custom' && (
                      <input 
                        type="text"
                        className="custom-availability-input"
                        placeholder="e.g. 2 months notice period"
                        value={customAvailabilityText}
                        onChange={(e) => setCustomAvailabilityText(e.target.value)}
                        required
                      />
                    )}
                  </div>

                  {/* Resume Section */}
                  <div className="form-section">
                    <label className="form-label">Select Resume Option</label>
                    <div className="resume-option-cards">
                      {/* Inbuilt Resume */}
                      <div 
                        className={`resume-option-card ${resumeOption === 'inbuilt' ? 'selected' : ''}`}
                        onClick={() => setResumeOption('inbuilt')}
                      >
                        <input 
                          type="radio" 
                          name="resumeOption"
                          checked={resumeOption === 'inbuilt'}
                          onChange={() => setResumeOption('inbuilt')}
                        />
                        <div className="option-card-body">
                          <span className="option-icon">📄</span>
                          <div className="option-info">
                            <strong>Use Inbuilt Interactive Resume</strong>
                            <p>Apply using the resume you completed in the profile section.</p>
                          </div>
                        </div>
                      </div>

                      {/* Custom Upload */}
                      <div 
                        className={`resume-option-card ${resumeOption === 'manual' ? 'selected' : ''}`}
                        onClick={() => setResumeOption('manual')}
                      >
                        <input 
                          type="radio" 
                          name="resumeOption"
                          checked={resumeOption === 'manual'}
                          onChange={() => setResumeOption('manual')}
                        />
                        <div className="option-card-body">
                          <span className="option-icon">📤</span>
                          <div className="option-info">
                            <strong>Upload Custom Resume</strong>
                            <p>Select a custom resume file (.pdf, .doc, .docx) from your device.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {resumeOption === 'manual' && (
                      <div className="manual-upload-zone">
                        <label className="file-upload-label">
                          <input 
                            type="file"
                            accept=".pdf,.doc,.docx"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                          />
                          {!customFileName ? (
                            <>
                              <span className="upload-icon">📁</span>
                              <div className="upload-prompt">
                                <strong>Click to choose file</strong> or drag & drop here
                                <p>PDF, DOC, DOCX up to 5MB</p>
                              </div>
                            </>
                          ) : (
                            <div className="uploaded-file-details">
                              <span className="upload-icon">✅</span>
                              <span className="file-name">{customFileName}</span>
                              <span className="upload-again-hint">Change selected file</span>
                            </div>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* --- Opportunity Details Content --- */
                <div className="modal-content">
                  <div className="modal-hero">
                    <div>
                      <h3>{selectedJob.title}</h3>
                      <p className="modal-company-title">{selectedJob.company_name}</p>
                    </div>
                    <span className="modal-type-badge">{selectedJob.job_type}</span>
                  </div>

                  <div className="modal-meta-grid">
                    <div className="meta-box">
                      <strong>Location</strong>
                      <p>{selectedJob.location}</p>
                    </div>
                    <div className="meta-box">
                      <strong>Stipend / Salary</strong>
                      <p>
                        {info.salaryMin === 'Negotiable' 
                          ? 'Negotiable' 
                          : `Rs ${info.salaryMin} - Rs ${info.salaryMax} / month`}
                      </p>
                    </div>
                    <div className="meta-box">
                      <strong>Duration</strong>
                      <p>{info.duration}</p>
                    </div>
                  </div>

                  <div className="modal-section">
                    <h4>Role Description</h4>
                    <p className="description-text">{info.rawDesc}</p>
                  </div>

                  {skillsArray.length > 0 && (
                    <div className="modal-section">
                      <h4>Required Professional Skills</h4>
                      <div className="modal-skills-list">
                        {skillsArray.map((skill, index) => (
                          <span key={index} className="modal-skill-pill">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="modal-footer">
                {isApplyingFormActive ? (
                  <>
                    <button
                      type="button"
                      className="btn-modal-cancel"
                      onClick={() => setIsApplyingFormActive(false)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn-modal-apply"
                      disabled={submittingApp || (resumeOption === 'manual' && !customFileBase64)}
                      onClick={handleSubmitApplication}
                    >
                      {submittingApp ? 'Submitting...' : 'Submit Application ✓'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-modal-cancel"
                      onClick={() => setSelectedJob(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-modal-apply"
                      disabled={applying}
                      onClick={handleInitiateApply}
                    >
                      {applying ? 'Checking eligibility...' : 'Apply Now ➔'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
