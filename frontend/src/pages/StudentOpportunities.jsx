import React, { useEffect, useMemo, useState } from 'react';
import { getAllJobs, getCompanyInternships, getPreferences, updatePreferences, saveJob as apiSaveJob, hideJob as apiHideJob, getSavedJobs as apiGetSavedJobs, getHiddenJobs as apiGetHiddenJobs, removeSavedJob as apiRemoveSavedJob } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import './StudentOpportunities.css';
import PlacementStories from '../components/Placementstories';
import SimilarJobs from '../components/SimilarJobs';
export default function StudentOpportunities() {
  const navigate = useNavigate();
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Profile');
  const [lookingFor, setLookingFor] = useState(location.pathname === '/internships' ? 'Internships' : 'Jobs');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [hiddenJobs, setHiddenJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const isInternshipPage = location.pathname === '/internships';
        setLookingFor(isInternshipPage ? 'Internships' : 'Jobs');
        const data = isInternshipPage ? await getCompanyInternships() : await getAllJobs();
        setJobs(data || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [location.pathname]);

  useEffect(() => {
    const normalizeIds = (ids) => Array.isArray(ids) ? ids.map(String) : [];

    const loadPreferences = async () => {
      try {
        const prefs = await getPreferences();
        if (prefs) {
          if (Array.isArray(prefs.roles)) setSelectedRoles(prefs.roles);
          if (Array.isArray(prefs.locations)) setSelectedLocations(prefs.locations);
        }
      } catch (err) {
        // ignore if not logged in
      }

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const serverSaved = normalizeIds(await apiGetSavedJobs());
          const serverHidden = normalizeIds(await apiGetHiddenJobs());
          setSavedJobs(serverSaved);
          setHiddenJobs(serverHidden);
          localStorage.setItem('savedJobs', JSON.stringify(serverSaved));
          localStorage.setItem('hiddenJobs', JSON.stringify(serverHidden));
        } catch (err) {
          const saved = normalizeIds(JSON.parse(localStorage.getItem('savedJobs') || '[]'));
          const hidden = normalizeIds(JSON.parse(localStorage.getItem('hiddenJobs') || '[]'));
          setSavedJobs(saved);
          setHiddenJobs(hidden);
        }
      } else {
        const saved = normalizeIds(JSON.parse(localStorage.getItem('savedJobs') || '[]'));
        const hidden = normalizeIds(JSON.parse(localStorage.getItem('hiddenJobs') || '[]'));
        setSavedJobs(saved);
        setHiddenJobs(hidden);
      }
    };
    loadPreferences();
  }, []);

  const handleLookingForToggle = (type) => {
    if (type === lookingFor) return;
    setLookingFor(type);
    if (type === 'Internships') navigate('/internships');
    else navigate('/jobs');
  };

  const removeRole = (role) => {
    setSelectedRoles(selectedRoles.filter((item) => item !== role));
  };

  const parseJobInfo = (job) => {
    let salaryMin = job.salary_min || '';
    let salaryMax = job.salary_max || '';
    let duration = job.duration || '';
    let category = job.category || '';
    let skills = ['Illustrator', 'Graphic Designing', 'Graphics', 'Design'];

    try {
      if (job.description && typeof job.description === 'string' && job.description.startsWith('{')) {
        const parsed = JSON.parse(job.description);
        salaryMin = parsed.salary_min || salaryMin;
        salaryMax = parsed.salary_max || salaryMax;
        duration = parsed.duration || duration;
        category = parsed.category || category;
      }
    } catch (err) {
      console.error("JSON parsing error", err);
    }

    return { salaryMin, salaryMax, duration, category, skills };
  };

  const formatPostedDate = (dateValue) => {
    if (!dateValue) return 'Recently posted';
    const posted = new Date(dateValue);
    if (Number.isNaN(posted.getTime())) return 'Recently posted';

    const now = new Date();
    const diffMs = now - posted;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const jobIdOf = (job) => job.job_id || job.id || job._id;

  const matchesPreferences = (job) => {
    if (!job) return false;
    const id = jobIdOf(job);
    if (hiddenJobs.includes(String(id))) return false;

    // roles
    if (selectedRoles.length > 0) {
      const title = (job.title || '').toLowerCase();
      const cat = (job.category || '').toLowerCase();
      const foundRole = selectedRoles.some(r => {
        const rr = (r || '').toLowerCase();
        return title.includes(rr) || cat.includes(rr) || (job.description || '').toLowerCase().includes(rr);
      });
      if (!foundRole) return false;
    }

    // locations
    if (selectedLocations.length > 0) {
      const loc = (job.location || '').toLowerCase();
      const foundLoc = selectedLocations.some(l => loc.includes((l || '').toLowerCase()));
      if (!foundLoc) return false;
    }

    return true;
  };

  const filteredJobs = useMemo(() => jobs.filter(matchesPreferences), [jobs, selectedRoles, selectedLocations, hiddenJobs]);

  const displayJobs = activeTab === 'Profile' ? jobs : filteredJobs;

  const normalizeIds = (ids) => Array.isArray(ids) ? ids.map(String) : [];

  const persistSaved = (arr) => {
    const normalized = normalizeIds(arr);
    setSavedJobs(normalized);
    localStorage.setItem('savedJobs', JSON.stringify(normalized));
  };

  const persistHidden = (arr) => {
    const normalized = normalizeIds(arr);
    setHiddenJobs(normalized);
    localStorage.setItem('hiddenJobs', JSON.stringify(normalized));
  };

  const toggleSaveJob = async (job) => {
    const id = String(jobIdOf(job));
    const exists = savedJobs.includes(id);
    const token = localStorage.getItem('token');

    if (token) {
      try {
        if (exists) {
          const saved = await apiRemoveSavedJob(id);
          persistSaved(saved || savedJobs.filter(i => i !== id));
          toast.success('Removed from saved');
        } else {
          const saved = await apiSaveJob(id);
          persistSaved(saved || [id, ...savedJobs]);
          toast.success('Saved job');
        }
      } catch (error) {
        console.error('Save job error:', error);
        toast.error(exists ? 'Failed to remove saved job' : 'Failed to save');
      }
    } else {
      if (exists) {
        persistSaved(savedJobs.filter(i => i !== id));
        toast.success('Removed from saved');
      } else {
        persistSaved([id, ...savedJobs]);
        toast.success('Saved job');
      }
    }
  };

  const hideJob = async (job) => {
    const id = String(jobIdOf(job));
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const hidden = await apiHideJob(id);
        persistHidden(hidden || [id, ...hiddenJobs]);
        persistSaved(savedJobs.filter(i => i !== id));
        setJobs(prev => prev.filter(j => String(jobIdOf(j)) !== id));
        toast.info('Job hidden');
      } catch (error) {
        console.error('Hide job error:', error);
        toast.error('Failed to hide job');
      }
    } else {
      if (!hiddenJobs.includes(id)) persistHidden([id, ...hiddenJobs]);
      setJobs(prev => prev.filter(j => String(jobIdOf(j)) !== id));
      toast.info('Job hidden');
    }
  };

  const handleAddRole = async () => {
    const role = window.prompt('Add preferred role (e.g. Frontend Developer)');
    if (role && role.trim()) {
      const next = [role.trim(), ...selectedRoles];
      setSelectedRoles(next);
    }
  };

  const toggleLocation = (loc) => {
    const exists = selectedLocations.includes(loc);
    if (exists) setSelectedLocations(selectedLocations.filter(l => l !== loc));
    else setSelectedLocations([loc, ...selectedLocations]);
  };

  const handleUpdateMatches = async () => {
    try {
      await updatePreferences({ roles: selectedRoles, locations: selectedLocations });
      toast.success('Preferences updated');
      // re-filter jobs client-side
      setJobs(prev => prev.filter(j => matchesPreferences(j)));
    } catch (err) {
      toast.error('Failed to update preferences');
    }
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <section className="student-opportunities-outer">
        <div className="student-opportunities-page">
          <div className="student-opportunities-container">

        {/* TOP BANNER METRICS CONTROL */}
        <div className="header-meta-section">
          <div className="title-block">
            <h1 className="main-title">Recommended jobs for you</h1>
            <p className="subtitle">Based on your profile and activity.</p>
          </div>
          <div className="top-note-apply">
            <span className="note-text">You can select up to 5 jobs to apply</span>
            <button className="apply-now-btn">Apply</button>
          </div>
        </div>

        {/* TABS INTERNAL SUB-ROUTER */}
        <div className="tabs-row-container">
          <div className="tabs-row">
            {[
              { label: 'Profile', count: jobs.length },
              { label: 'You might like', count: filteredJobs.length },
              { label: 'Preferences', count: selectedRoles.length + selectedLocations.length },
            ].map(({ label, count }) => (
              <button
                key={label}
                className={`tab-btn ${activeTab === label ? 'active' : ''}`}
                onClick={() => setActiveTab(label)}
              >
                {`${label} (${count})`}
              </button>
            ))}
            <button className="tab-btn" onClick={() => navigate('/saved-jobs')}>
              {`Saved Jobs (${savedJobs.length})`}
            </button>
          </div>
        </div>

        <div className="jobs-pill-container">
          <span className="jobs-pill">Jobs ({jobs.length})</span>
        </div>

        {/* ३. GRID SYSTEM: डाव्या बाजूला विस्तीर्ण (3.2fr) आणि उजव्या बाजूला योग्य आकाराचा साइडबार (1fr) */}
        <div
          className="opportunities-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 1024 ? '3.2fr 1fr' : '1fr',
            gap: '32px',
            width: '100%',
            alignItems: 'start'
          }}
        >

          {/* MAIN CONTENT LISTINGS */}
          <main className="opportunities-main" style={{ width: '100%' }}>
            <div className="jobs-list">
              {displayJobs.length === 0 ? (
                <div className="empty-state">No opportunities found</div>
              ) : (
                displayJobs.map((job, index) => {
                  const info = parseJobInfo(job);
                  const firstLetter = job.company_name?.charAt(0) || 'C';
                  const id = String(jobIdOf(job));

                  return (
                    <React.Fragment key={id || index}>
                      {/* Inject full-width promo banner dynamically after first element */}
                      {index === 1 && (
                        <div className="interview-prep-banner">
                          <div className="banner-left">
                            <h2>Start your interview prep with real interview experiences</h2>
                            <p className="banner-stats">calibre_spark · 12+ interview experiences &nbsp;&nbsp;|&nbsp;&nbsp; 200+ job roles</p>
                            <button className="prep-btn">Start preparing now</button>
                          </div>
                          <div className="banner-shapes">
                            <div className="circle-shape shape-1"></div>
                            <div className="circle-shape shape-2"></div>
                          </div>
                        </div>
                      )}

                      <div className="job-card">
                        <div className="card-layout-wrapper">
                          <div className="selection-column">
                            <input
                              type="checkbox"
                              className="job-select-checkbox"
                              onChange={() => navigate(`/opportunity/${id}`, { state: { job } })}
                            />
                          </div>

                          <div className="content-column">
                            <div className="card-top-header">
                              <div className="meta-titles">
                                <h3 className="job-role-title">{job.title || "Graphic Designer"}</h3>
                                <p className="company-text-link">{job.company_name || "Prodigy Brains"}</p>
                              </div>
                              <div className={`company-avatar logo-bg-${index % 3}`}>
                                {firstLetter}
                              </div>
                            </div>

                            <div className="job-parameters-row">
                              <span className="param-item"><span className="icon">💼</span> 0-3 Yrs</span>
                              <span className="param-item">
                                <span className="icon">₹</span>
                                {info.salaryMin ? `${info.salaryMin} - ${info.salaryMax} Lacs PA` : "Not disclosed"}
                              </span>
                              <span className="param-item"><span className="icon">📍</span> {job.location || "Bengaluru"}</span>
                            </div>

                            <div className="job-snippet">
                              <p>
                                <span className="snippet-bold">Skills Required Preferred Candidate:</span> Candidate from Pune preferred Good understanding of design principles and tools like Illustrator, Photoshop...
                              </p>
                            </div>

                            <div className="skills-tags-container">
                              {info.skills.map((skill, idx) => (
                                <span key={idx} className="skill-tag">{skill}</span>
                              ))}
                            </div>

                            <div className="card-action-footer">
                              <span className="time-stamp-text">{formatPostedDate(job.created_at || job.posted_at || job.date)}</span>
                              <div className="footer-right-buttons">
                                <button type="button" className="action-inline-btn text-muted" onClick={() => hideJob(job)}>👁️‍🗨️ Hide</button>
                                <button type="button" className="action-inline-btn text-muted" onClick={() => toggleSaveJob(job)}>{savedJobs.includes(id) ? '🔖 Saved' : '🔖 Save'}</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </main>

          {/* SIDEBAR DASHBOARD CONTROL */}
          <aside className="preferences-sidebar" style={{ width: '100%' }}>
            <div className="preferences-sticky-card">
              <div className="sidebar-header">
                <h2>Add preferences</h2>
                <button className="settings-icon-btn">⚙️</button>
              </div>

              <div className="sidebar-section">
                <div className="section-label-row">
                  <label>Looking for</label>
                  <button className="edit-action-pencil">✏️</button>
                </div>
                <div className="pill-toggle-group">
                  {['Internships', 'Jobs'].map((type) => (
                    <button
                      key={type}
                      className={`toggle-pill ${lookingFor === type ? 'active' : ''}`}
                      onClick={() => handleLookingForToggle(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sidebar-section">
                <div className="section-label-row">
                  <label>Preferred job role</label>
                  <button className="edit-action-pencil">✏️</button>
                </div>
                <button className="add-role-dotted-trigger" onClick={handleAddRole}>+ Add role</button>
                <div className="locations-tags-cloud" style={{ marginTop: '12px', flexWrap: 'wrap' }}>
                  {selectedRoles.length > 0 ? (
                    selectedRoles.map((role) => (
                      <span key={role} className="location-chip active" style={{ cursor: 'pointer' }} onClick={() => removeRole(role)}>
                        {role} ✕
                      </span>
                    ))
                  ) : (
                    <span className="no-selection-text">No preferred roles added</span>
                  )}
                </div>
              </div>

              <div className="sidebar-section">
                <div className="section-label-row">
                  <label>Preferred work location</label>
                  <button className="edit-action-pencil">✏️</button>
                </div>
                <div className="locations-tags-cloud">
                  {['Thane', 'Pune', 'Mumbai', 'Bengaluru'].map((loc) => (
                    <span
                      key={loc}
                      className={`location-chip ${selectedLocations.includes(loc) ? 'active' : ''}`}
                      onClick={() => toggleLocation(loc)}
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="sidebar-section">
                <div className="section-label-row">
                  <label>Preferred salary (for jobs)</label>
                  <button className="edit-action-pencil">✏️</button>
                </div>
                <div className="salary-display-amount">₹ 3,00,000</div>
              </div>

              <button className="commit-matches-btn" onClick={handleUpdateMatches}>Update Matches</button>
            </div>
          </aside>

        </div>
      </div>
    </div>
  </section>
<PlacementStories />
<SimilarJobs jobs={filteredJobs} excludeId={null} limit={3} />
</>
  );
}