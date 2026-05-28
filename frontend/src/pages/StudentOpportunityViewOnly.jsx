import React, { useEffect, useMemo, useState } from 'react';
import { getAllJobs, getCompanyInternships, getPreferences, updatePreferences, applyJob } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import './StudentOpportunities.css';

// SVG Icons for professional styling and 100% build safety
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
);

const SuitcaseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
);

const RupeeIcon = () => (
  <span style={{ fontWeight: '600', fontSize: '13px', marginRight: '2px' }}>₹</span>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

const getPostedTimeText = (createdAt) => {
  if (!createdAt) return 'Today';
  try {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} Days Ago`;
  } catch {
    return 'Today';
  }
};

export default function StudentOpportunityViewOnly() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Backend and default seed jobs
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Layout tabs state
  const [activeTab, setActiveTab] = useState('Profile'); // 'Profile' | 'You might like' | 'Preferences'

  // Saved / Hidden state
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('saved_opportunities') || '[]');
    } catch {
      return [];
    }
  });

  const [hiddenJobIds, setHiddenJobIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hidden_opportunities') || '[]');
    } catch {
      return [];
    }
  });

  // Checkbox selection state
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  // Feedback banner state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showFeedbackChoice, setShowFeedbackChoice] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    lookingFor: ['Jobs'], // default Jobs highlighted
    preferredRoles: ['Graphic Designer', 'Visual Designer'], // default seeded roles
    preferredLocations: ['Thane', 'Pune', 'Mumbai', 'Bengaluru'], // default work locations
    salary: '3,00,000', // default salary
  });
  
  const [prefLoading, setPrefLoading] = useState(true);

  // Sidebar Inline Edit states
  const [editSection, setEditSection] = useState(null); // 'lookingFor' | 'roles' | 'locations' | 'salary'
  const [newRoleInput, setNewRoleInput] = useState('');
  const [newLocInput, setNewLocInput] = useState('');
  const [salaryInput, setSalaryInput] = useState('');

  // 1. FETCH JOBS
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const isInternshipPage = location.pathname === '/internships';
        const data = isInternshipPage ? await getCompanyInternships() : await getAllJobs();
        setJobs(data || []);
      } catch (error) {
        console.error('Failed to load opportunities:', error);
        toast.error('Failed to fetch opportunities from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [location.pathname]);

  // 2. FETCH PREFERENCES
  useEffect(() => {
    const fetchStudentPreferences = async () => {
      if (!token) {
        setPrefLoading(false);
        return;
      }
      try {
        const pref = await getPreferences();
        if (pref) {
          setPreferences({
            lookingFor: pref.areasOfInterest && pref.areasOfInterest.length > 0 ? pref.areasOfInterest : ['Jobs'],
            preferredRoles: pref.preferredRoles && pref.preferredRoles.length > 0 ? pref.preferredRoles : ['Graphic Designer', 'Visual Designer'],
            preferredLocations: pref.preferredLocations && pref.preferredLocations.length > 0 ? pref.preferredLocations : ['Thane', 'Pune', 'Mumbai', 'Bengaluru'],
            salary: pref.salary || '3,00,000',
          });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setPrefLoading(false);
      }
    };

    fetchStudentPreferences();
  }, [token]);

  // Parsing helper to support both standard fields and JSON description formats
  const parseJobInfo = (job) => {
    let salaryMin = '';
    let salaryMax = '';
    let duration = '';
    let category = '';
    let description = '';

    try {
      if (job.description && typeof job.description === 'string' && job.description.startsWith('{')) {
        const parsed = JSON.parse(job.description);
        salaryMin = parsed.salary_min || job.salary_min || '';
        salaryMax = parsed.salary_max || job.salary_max || '';
        duration = parsed.duration || job.duration || '';
        category = parsed.category || job.category || '';
        description = parsed.description || '';
      } else {
        salaryMin = job.salary_min || '';
        salaryMax = job.salary_max || '';
        duration = job.duration || job.experience_required || '';
        category = job.category || '';
        description = job.description || '';
      }
    } catch (err) {
      salaryMin = job.salary_min || '';
      salaryMax = job.salary_max || '';
      duration = job.duration || '';
      category = job.category || '';
      description = job.description || '';
    }

    if (!salaryMin || salaryMin === 'Not disclosed') {
      salaryMin = 'Not disclosed';
      salaryMax = '';
    }

    return {
      salaryMin,
      salaryMax,
      duration: duration || '0-3 Yrs',
      category: category || 'General',
      description: description || 'Opportunity details and candidate criteria.'
    };
  };

  // 3. FILTER JOBS BY ACTIVE TAB AND PREFERENCES
  const filteredJobs = useMemo(() => {
    // Exclude hidden jobs
    let list = jobs.filter(job => !hiddenJobIds.includes(job.job_id));

    // Filter based on active tab
    if (activeTab === 'Profile') {
      // Show jobs matching user's location or seeded first
      return list;
    }

    if (activeTab === 'Preferences') {
      // Strict matching based on selected sidebar preferences
      return list.filter(job => {
        const info = parseJobInfo(job);
        
        // Location Match
        const jobLoc = (job.location || '').toLowerCase();
        const matchesLocation = preferences.preferredLocations.some(
          loc => jobLoc.includes(loc.toLowerCase())
        );

        // Job Role Match
        const jobTitle = (job.title || '').toLowerCase();
        const matchesRole = preferences.preferredRoles.some(
          role => jobTitle.includes(role.toLowerCase())
        );

        // Looking For Match (job_type mapping)
        const matchesType = preferences.lookingFor.some(type => {
          if (type.toLowerCase().includes('job')) return job.job_type === 'job' || !job.job_type;
          if (type.toLowerCase().includes('internship')) return job.job_type === 'internship';
          return true;
        });

        return matchesLocation || matchesRole || matchesType;
      });
    }

    if (activeTab === 'You might like') {
      // Mix and shuffle slightly, representing recommendation algorithm
      return [...list].reverse();
    }

    return list;
  }, [jobs, activeTab, hiddenJobIds, preferences]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const activeJobsList = jobs.filter(job => !hiddenJobIds.includes(job.job_id));
    const profileCount = activeJobsList.length;
    const likeCount = activeJobsList.length;
    
    // Preferences count is strictly calculated based on filter
    const prefCount = activeJobsList.filter(job => {
      const jobLoc = (job.location || '').toLowerCase();
      const matchesLocation = preferences.preferredLocations.some(loc => jobLoc.includes(loc.toLowerCase()));
      const jobTitle = (job.title || '').toLowerCase();
      const matchesRole = preferences.preferredRoles.some(role => jobTitle.includes(role.toLowerCase()));
      return matchesLocation || matchesRole;
    }).length;

    return {
      Profile: profileCount,
      YouMightLike: likeCount,
      Preferences: prefCount
    };
  }, [jobs, hiddenJobIds, preferences]);

  // 4. ACTION HANDLERS
  const handleCheckboxToggle = (jobId) => {
    setSelectedJobIds(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId);
      } else {
        if (prev.length >= 5) {
          toast.warning('You can select up to 5 jobs to apply.');
          return prev;
        }
        return [...prev, jobId];
      }
    });
  };

  const handleSaveToggle = (jobId) => {
    if (!token) {
      toast.info('Please log in to save opportunities.');
      navigate('/login');
      return;
    }

    setSavedJobIds(prev => {
      let updated;
      if (prev.includes(jobId)) {
        updated = prev.filter(id => id !== jobId);
        toast.info('Opportunity removed from saved list.');
      } else {
        updated = [...prev, jobId];
        toast.success('Opportunity saved successfully!');
      }
      localStorage.setItem('saved_opportunities', JSON.stringify(updated));
      return updated;
    });
  };

  const handleHideJob = (jobId) => {
    if (!token) {
      toast.info('Please log in to hide opportunities.');
      navigate('/login');
      return;
    }

    // Toggle visually by adding to hidden array with fade out
    const cardEl = document.getElementById(`job-card-${jobId}`);
    if (cardEl) {
      cardEl.classList.add('fade-out-exit');
    }

    setTimeout(() => {
      setHiddenJobIds(prev => {
        const updated = [...prev, jobId];
        localStorage.setItem('hidden_opportunities', JSON.stringify(updated));
        return updated;
      });
      setSelectedJobIds(prev => prev.filter(id => id !== jobId));
      toast.info('Opportunity hidden.');
    }, 300);
  };

  // Bulk Apply Functionality
  const handleBulkApply = async () => {
    if (!token) {
      toast.info('Please log in to apply for opportunities.');
      navigate('/login');
      return;
    }

    setIsApplyingBulk(true);
    let successCount = 0;
    let failCount = 0;

    for (const jobId of selectedJobIds) {
      // Mock job IDs bypass the backend API but succeed locally
      if (jobId.toString().startsWith('seed-')) {
        successCount++;
        continue;
      }

      try {
        await applyJob(jobId, {
          availability: 'Immediate',
          resume_option: 'inbuilt',
        });
        successCount++;
      } catch (err) {
        console.error(`Failed applying to ${jobId}:`, err);
        failCount++;
      }
    }

    setIsApplyingBulk(false);
    setSelectedJobIds([]);

    if (successCount > 0) {
      toast.success(`Successfully applied to ${successCount} opportunity(s)!`);
    }
    if (failCount > 0) {
      toast.error(`Failed to apply to ${failCount} opportunity(s). Complete your resume first.`);
    }
  };

  // 5. PREFERENCES INLINE EDIT HANDLERS
  const toggleEditSection = (section) => {
    if (!token) {
      toast.info('Please log in to edit preferences.');
      navigate('/login');
      return;
    }

    if (editSection === section) {
      setEditSection(null);
    } else {
      setEditSection(section);
      if (section === 'salary') {
        setSalaryInput(preferences.salary);
      }
    }
  };

  // Add / Remove Job Roles
  const handleAddRole = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (newRoleInput.trim() && !preferences.preferredRoles.includes(newRoleInput.trim())) {
        setPreferences(prev => ({
          ...prev,
          preferredRoles: [...prev.preferredRoles, newRoleInput.trim()]
        }));
        setNewRoleInput('');
      }
    }
  };

  const handleRemoveRole = (role) => {
    setPreferences(prev => ({
      ...prev,
      preferredRoles: prev.preferredRoles.filter(r => r !== role)
    }));
  };

  // Add / Remove Locations
  const handleAddLocation = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (newLocInput.trim() && !preferences.preferredLocations.includes(newLocInput.trim())) {
        setPreferences(prev => ({
          ...prev,
          preferredLocations: [...prev.preferredLocations, newLocInput.trim()]
        }));
        setNewLocInput('');
      }
    }
  };

  const handleRemoveLocation = (loc) => {
    setPreferences(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations.filter(l => l !== loc)
    }));
  };

  // Toggle lookingFor options
  const handleToggleLookingFor = (type) => {
    setPreferences(prev => {
      let updated;
      if (prev.lookingFor.includes(type)) {
        updated = prev.lookingFor.filter(t => t !== type);
      } else {
        updated = [...prev.lookingFor, type];
      }
      return { ...prev, lookingFor: updated };
    });
  };

  // Save Salary Input
  const handleSaveSalary = () => {
    if (salaryInput.trim()) {
      setPreferences(prev => ({ ...prev, salary: salaryInput.trim() }));
      setEditSection(null);
    }
  };

  // Save preferences to DB
  const handleSavePreferences = async () => {
    if (!token) {
      toast.info('Please log in to save matches.');
      navigate('/login');
      return;
    }

    try {
      // Map preferences to structure expected by Backend student model
      await updatePreferences({
        areasOfInterest: preferences.lookingFor,
        preferredLocations: preferences.preferredLocations,
        preferredRoles: preferences.preferredRoles,
        salary: preferences.salary,
        careerGoal: preferences.preferredRoles.join(', ') || 'Opportunities'
      });
      
      setEditSection(null);
      toast.success('Matches updated successfully from backend!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update preferences on server.');
    }
  };

  // Helper for generating deterministic initials logos
  const getLogoStyles = (companyName) => {
    const initials = companyName ? companyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'C';
    let bgColor = '#93c5fd'; // Default pastel blue
    const hash = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);

    // Dynamic, premium color palettes matching mockup
    const colors = [
      '#6366f1', // Indigo (PB)
      '#ef4444', // Red/Pink (N)
      '#10b981', // Emerald
      '#8b5cf6', // Violet
      '#f97316', // Orange
      '#1e1b4b'  // Dark Navy
    ];
    bgColor = colors[hash % colors.length];

    return { initials, bgColor };
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="opportunities-page">
      <div className="opportunities-container">

        {/* 1. TOP TABS ROW */}
        <div className="tabs-row-container">
          <div className="tabs-row">
            <button
              className={`tab-btn ${activeTab === 'Profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('Profile')}
            >
              Profile ({tabCounts.Profile})
            </button>
            <button
              className={`tab-btn ${activeTab === 'You might like' ? 'active' : ''}`}
              onClick={() => setActiveTab('You might like')}
            >
              You might like ({tabCounts.YouMightLike})
            </button>
            <button
              className={`tab-btn ${activeTab === 'Preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('Preferences')}
            >
              Preferences ({tabCounts.Preferences})
            </button>
          </div>
        </div>

        {/* 2. MATCH PILL HEADER */}
        <div className="pill-header-row">
          <span className="jobs-pill">Jobs ({filteredJobs.length})</span>
        </div>

        {/* 3. GRID LAYOUT */}
        <div className="opportunities-grid">

          {/* LEFT LIST PANEL */}
          <main className="opportunities-main">
            <div className="jobs-list">
              {filteredJobs.length === 0 ? (
                <div className="empty-state">No matching opportunities found. Try adjusting preferences.</div>
              ) : (
                filteredJobs.map((job, index) => {
                  const { salaryMin, salaryMax, duration, description } = parseJobInfo(job);
                  const isSelected = selectedJobIds.includes(job.job_id);
                  const isSaved = savedJobIds.includes(job.job_id);
                  const { initials, bgColor } = getLogoStyles(job.company_name);
                  const isMock = job.job_id.toString().startsWith('seed-');

                  return (
                    <React.Fragment key={job.job_id}>
                      {/* CARD */}
                      <div
                        id={`job-card-${job.job_id}`}
                        className={`job-card ${isSelected ? 'selected' : ''}`}
                      >
                        {/* CHECKBOX AND LOGO COLUMNS */}
                        <div className="job-card-header-row">
                          <label className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCheckboxToggle(job.job_id)}
                            />
                            <span className="checkmark-box"></span>
                          </label>

                          <div className="job-card-content">
                            <div className="title-row">
                              <h3>{job.title}</h3>
                            </div>
                            <div className="company-rating-row">
                              <span className="company-name">{job.company_name || 'Company'}</span>
                              {job.rating && (
                                <span className="rating-badge">★ {job.rating}</span>
                              )}
                            </div>
                          </div>

                          <div className="company-logo" style={{ backgroundColor: bgColor }}>
                            {initials}
                          </div>
                        </div>

                        {/* META STATS ROW */}
                        <div className="job-meta-row">
                          <div className="meta-item">
                            <SuitcaseIcon />
                            <span>{duration}</span>
                          </div>
                          <div className="meta-item">
                            <RupeeIcon />
                            <span>{salaryMin}{salaryMax ? ` - ${salaryMax}` : ''}</span>
                          </div>
                          <div className="meta-item">
                            <MapPinIcon />
                            <span className="location-text">{job.location || 'Bengaluru'}</span>
                          </div>
                        </div>

                        {/* SKILLS REQUIRED ROW */}
                        <div className="job-description-block">
                          <span className="desc-label">Skills Required: </span>
                          <span className="desc-text">{job.skills_required || 'Not specified'}</span>
                        </div>

                        {/* TAG CHIPS ROW */}
                        <div className="tags-row-chips">
                          {(job.skills_required || 'Design')
                            .split(',')
                            .map((tag) => tag.trim())
                            .filter(Boolean)
                            .map((tag, tIdx) => (
                              <span key={tIdx} className="skill-chip">{tag.toLowerCase()}</span>
                            ))}
                        </div>

                        {/* FOOTER ACTIONS */}
                        <div className="job-card-footer">
                          <span className="posted-time">
                            {getPostedTimeText(job.created_at)}
                          </span>
                          <div className="action-buttons-group">
                            <button
                              type="button"
                              className="action-btn hide-btn"
                              onClick={() => handleHideJob(job.job_id)}
                            >
                              <EyeOffIcon />
                              <span>Hide</span>
                            </button>
                            <button
                              type="button"
                              className={`action-btn save-btn ${isSaved ? 'saved' : ''}`}
                              onClick={() => handleSaveToggle(job.job_id)}
                            >
                              <BookmarkIcon filled={isSaved} />
                              <span>{isSaved ? 'Saved' : 'Save'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 4. INTERVIEW PREP BANNER (RENDERED BETWEEN CARD 1 AND 2) */}
                      {index === 0 && (
                        <div className="interview-prep-banner">
                          <div className="banner-left">
                            <h2>Start your interview prep with real interview experiences</h2>
                            <p className="banner-stats">
                              colors__spark, 3L+ interview experiences &nbsp;•&nbsp; 200+ job roles
                            </p>
                            <button
                              type="button"
                              className="prep-btn"
                              onClick={() => toast.success('Launching interview preparation suite...')}
                            >
                              Start preparing now
                            </button>
                          </div>
                          <div className="banner-shapes">
                            <div className="circle-shape shape-1"></div>
                            <div className="circle-shape shape-2"></div>
                            <div className="circle-shape shape-3"></div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              )}

              {/* 5. BOTTOM FEEDBACK WIDGET */}
              <div className="feedback-widget">
                {!feedbackSubmitted ? (
                  <>
                    <p>Are these jobs relevant for you?</p>
                    <div className="feedback-buttons">
                      <button
                        className="feedback-yes-btn"
                        onClick={() => {
                          setFeedbackSubmitted(true);
                          toast.success('Thank you for your feedback! Tuning matches.');
                        }}
                      >
                        Yes
                      </button>
                      <button
                        className="feedback-no-btn"
                        onClick={() => setShowFeedbackChoice(true)}
                      >
                        No
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="thanks-msg">✓ Thanks! We will customize your recommendations.</p>
                )}

                {showFeedbackChoice && !feedbackSubmitted && (
                  <div className="feedback-reasons-dropdown">
                    <p>Help us improve. What was wrong?</p>
                    <div className="reason-pills">
                      {['Wrong Location', 'Lower Salary', 'Mismatched Role', 'Required Experience'].map((reason) => (
                        <button
                          key={reason}
                          onClick={() => {
                            setFeedbackSubmitted(true);
                            setShowFeedbackChoice(false);
                            toast.info(`Feedback logged: ${reason}`);
                          }}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* RIGHT SIDEBAR PREFERENCES */}
          <aside className="preferences-panel">
            <div className="preferences-card">
              
              {/* HEADER */}
              <div className="preferences-card-header">
                <h2>Add preferences</h2>
                <button
                  type="button"
                  className={`settings-cog-btn ${editSection ? 'active' : ''}`}
                  onClick={() => toggleEditSection(editSection ? null : 'lookingFor')}
                >
                  <SettingsIcon />
                </button>
              </div>

              {/* LOOKING FOR SECTION */}
              <div className="pref-section">
                <div className="pref-section-title-row">
                  <h3>Looking for</h3>
                  <button
                    type="button"
                    className="edit-pencil-btn"
                    onClick={() => toggleEditSection('lookingFor')}
                  >
                    <PencilIcon />
                  </button>
                </div>
                {editSection === 'lookingFor' ? (
                  <div className="edit-looking-for-row">
                    <button
                      type="button"
                      className={`pref-pill-toggle ${preferences.lookingFor.includes('Internships') ? 'selected' : ''}`}
                      onClick={() => handleToggleLookingFor('Internships')}
                    >
                      Internships
                    </button>
                    <button
                      type="button"
                      className={`pref-pill-toggle ${preferences.lookingFor.includes('Jobs') ? 'selected' : ''}`}
                      onClick={() => handleToggleLookingFor('Jobs')}
                    >
                      Jobs
                    </button>
                  </div>
                ) : (
                  <div className="pref-chip-row">
                    <span className={`pref-chip ${preferences.lookingFor.includes('Internships') ? 'selected' : ''}`}>
                      Internships
                    </span>
                    <span className={`pref-chip ${preferences.lookingFor.includes('Jobs') ? 'selected' : ''}`}>
                      Jobs
                    </span>
                  </div>
                )}
              </div>

              {/* PREFERRED JOB ROLES SECTION */}
              <div className="pref-section">
                <div className="pref-section-title-row">
                  <h3>Preferred job role</h3>
                </div>

                <div className="pref-roles-wrapper">
                  {preferences.preferredRoles.map((role) => (
                    <span key={role} className="role-tag-chip">
                      {role}
                      <button
                        type="button"
                        className="remove-role-btn"
                        onClick={() => handleRemoveRole(role)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  {editSection === 'roles' ? (
                    <div className="add-role-input-box">
                      <input
                        type="text"
                        placeholder="Type role & press Enter"
                        value={newRoleInput}
                        onChange={(e) => setNewRoleInput(e.target.value)}
                        onKeyDown={handleAddRole}
                        autoFocus
                      />
                      <button type="button" onClick={handleAddRole}>
                        <CheckIcon />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="add-role-dotted-btn"
                      onClick={() => toggleEditSection('roles')}
                    >
                      + Add role
                    </button>
                  )}
                </div>
              </div>

              {/* PREFERRED LOCATIONS SECTION */}
              <div className="pref-section">
                <div className="pref-section-title-row">
                  <h3>Preferred work location</h3>
                  <button
                    type="button"
                    className="edit-pencil-btn"
                    onClick={() => toggleEditSection('locations')}
                  >
                    <PencilIcon />
                  </button>
                </div>

                <div className="pref-chip-row">
                  {preferences.preferredLocations.map((loc) => (
                    <span key={loc} className="pref-chip selected">
                      {loc}
                      {editSection === 'locations' && (
                        <button
                          type="button"
                          className="remove-chip-btn"
                          onClick={() => handleRemoveLocation(loc)}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {editSection === 'locations' && (
                  <div className="add-location-input-box">
                    <input
                      type="text"
                      placeholder="Add city & press Enter"
                      value={newLocInput}
                      onChange={(e) => setNewLocInput(e.target.value)}
                      onKeyDown={handleAddLocation}
                    />
                    <button type="button" onClick={handleAddLocation}>
                      <CheckIcon />
                    </button>
                  </div>
                )}
              </div>

              {/* PREFERRED SALARY SECTION */}
              <div className="pref-section">
                <div className="pref-section-title-row">
                  <h3>Preferred salary (for jobs)</h3>
                  <button
                    type="button"
                    className="edit-pencil-btn"
                    onClick={() => toggleEditSection('salary')}
                  >
                    <PencilIcon />
                  </button>
                </div>
                {editSection === 'salary' ? (
                  <div className="salary-edit-input-box">
                    <input
                      type="text"
                      value={salaryInput}
                      onChange={(e) => setSalaryInput(e.target.value)}
                      placeholder="e.g. 3,00,000"
                      autoFocus
                    />
                    <button type="button" onClick={handleSaveSalary}>
                      <CheckIcon />
                    </button>
                  </div>
                ) : (
                  <div className="salary-display-value">
                    ₹ {preferences.salary}
                  </div>
                )}
              </div>

              {/* UPDATE MATCHES ACTION */}
              <button
                type="button"
                className="update-matches-btn"
                onClick={handleSavePreferences}
              >
                Update Matches
              </button>

              {prefLoading && token && (
                <div className="pref-loading-overlay-text">Syncing with backend...</div>
              )}
            </div>
          </aside>
        </div>

        {/* 6. FLOATING BULK APPLY ACTION TOOLBAR */}
        {selectedJobIds.length > 0 && (
          <div className="floating-apply-toolbar">
            <div className="toolbar-info">
              <span className="count-badge">{selectedJobIds.length}</span>
              <p>job(s) selected to apply</p>
            </div>
            <div className="toolbar-actions">
              <button
                type="button"
                className="cancel-select-btn"
                onClick={() => setSelectedJobIds([])}
              >
                Clear Selection
              </button>
              <button
                type="button"
                className="bulk-apply-action-btn"
                onClick={handleBulkApply}
                disabled={isApplyingBulk}
              >
                {isApplyingBulk ? 'Applying...' : 'Apply Now ➔'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
