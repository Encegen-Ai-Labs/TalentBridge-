import React, { useState, useEffect } from 'react';
import { getStudentProfile, updateStudentProfile } from '../services/api';
import { toast } from 'react-toastify';
import './EditResume.css';

const ALL_SECTIONS = [
  'CAREER OBJECTIVE',
  'EDUCATION',
  'WORK EXPERIENCE',
  'EXTRA CURRICULAR ACTIVITIES',
  'TRAINING / COURSES',
  'ACADEMIC / PERSONAL PROJECT',
  'SKILLS',
  'PORTFOLIO / WORK SAMPLES',
  'ACCOMPLISHMENTS'
];

export default function EditResume() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core User / Student details (Synced directly)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [location, setLocation] = useState('');
  const [skillsList, setSkillsList] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  // Structured Resume Data (JSON)
  const [careerObjective, setCareerObjective] = useState('');
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [extracurriculars, setExtracurriculars] = useState([]);
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [accomplishments, setAccomplishments] = useState([]);

  // Section Visibility (Users can hide/delete sections they don't want)
  const [hiddenSections, setHiddenSections] = useState([]);

  // Editing UI states (ID of item currently in edit mode)
  const [editNameMode, setEditNameMode] = useState(false);
  const [editObjectiveMode, setEditObjectiveMode] = useState(false);
  const [editContactMode, setEditContactMode] = useState(false);

  const [activeEducationForm, setActiveEducationForm] = useState(null); // 'new' or index
  const [educationForm, setEducationForm] = useState({ degree: '', stream: '', school: '', years: '' });

  const [activeExperienceForm, setActiveExperienceForm] = useState(null); // 'new' or index
  const [experienceForm, setExperienceForm] = useState({ title: '', company: '', type: 'Internship', duration: '', location: '' });

  const [activeExtracurricularForm, setActiveExtracurricularForm] = useState(null); // 'new' or index
  const [extracurricularText, setExtracurricularText] = useState('');

  const [activeCourseForm, setActiveCourseForm] = useState(null); // 'new' or index
  const [courseForm, setCourseForm] = useState({ name: '', organization: '', duration: '' });

  const [activeProjectForm, setActiveProjectForm] = useState(null); // 'new' or index
  const [projectForm, setProjectForm] = useState({ title: '', description: '', link: '' });

  const [activePortfolioForm, setActivePortfolioForm] = useState(null); // 'new' or index
  const [portfolioForm, setPortfolioForm] = useState({ platform: '', url: '' });

  const [activeAccomplishmentForm, setActiveAccomplishmentForm] = useState(null); // 'new' or index
  const [accomplishmentText, setAccomplishmentText] = useState('');

  useEffect(() => {
    // --- IMMEDIATE PREFILL FROM LOCALSTORAGE ---
    // Pre-populates Name and Email instantly for first-time profile load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.mobile_number) setMobileNumber(parsed.mobile_number);
      } catch (e) {
        console.error('Error prefilling from localStorage:', e);
      }
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getStudentProfile();
      if (data) {
        // Sync name, email, and phone from the backend if available, fallback to existing prefilled states
        if (data.user?.name) setName(data.user.name);
        if (data.user?.email) setEmail(data.user.email);
        if (data.user?.mobile_number) setMobileNumber(data.user.mobile_number);

        const skillsStr = data.profile?.skills || '';
        setSkillsList(skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(Boolean) : []);

        // Load structured resume JSON data
        const rData = data.profile?.resume_data || {};
        setLocation(rData.location || data.profile?.branch || 'Pune');
        setCareerObjective(rData.careerObjective || '');
        setEducation(rData.education || []);
        setExperience(rData.experience || []);
        setExtracurriculars(rData.extracurriculars || []);
        setCourses(rData.courses || []);
        setProjects(rData.projects || []);
        setPortfolio(rData.portfolio || []);
        setAccomplishments(rData.accomplishments || []);
        setHiddenSections(rData.hiddenSections || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load resume details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async (silent = false) => {
    setSaving(true);
    try {
      const skillsStr = skillsList.join(', ');
      const resumeData = {
        location,
        careerObjective,
        education,
        experience,
        extracurriculars,
        courses,
        projects,
        portfolio,
        accomplishments,
        hiddenSections
      };

      await updateStudentProfile({
        name,
        mobile_number: mobileNumber,
        skills: skillsStr,
        branch: location, // sync location to branch for standard reports
        year: education[0]?.years ? parseInt(education[0].years.split('-')[1]) || 2026 : 2026,
        resume_data: resumeData
      });

      // Update user details in localStorage too to keep UI in sync
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          parsed.name = name;
          localStorage.setItem('user', JSON.stringify(parsed));
        } catch (e) {}
      }

      if (!silent) {
        toast.success('Resume details saved successfully!');
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        toast.error('Failed to save resume details.');
      }
    } finally {
      setSaving(false);
    }
  };

  const triggerDownloadPDF = () => {
    const missing = [];

    // 1. Check core contact/header details
    if (!name || !name.trim() || name.trim() === 'Add Your Name') {
      missing.push('Full Name');
    }
    if (!email || !email.trim() || email.trim() === 'add.email@example.com') {
      missing.push('Email Address');
    }
    if (!mobileNumber || !mobileNumber.trim() || mobileNumber.trim() === 'Add Phone Number') {
      missing.push('Phone Number');
    }
    if (!location || !location.trim() || location.trim() === 'Add Location') {
      missing.push('Location');
    }

    // 2. Check each visible section
    if (!isSectionHidden('CAREER OBJECTIVE') && (!careerObjective || !careerObjective.trim())) {
      missing.push('Career Objective');
    }
    if (!isSectionHidden('EDUCATION') && education.length === 0) {
      missing.push('Education');
    }
    if (!isSectionHidden('WORK EXPERIENCE') && experience.length === 0) {
      missing.push('Work Experience');
    }
    if (!isSectionHidden('EXTRA CURRICULAR ACTIVITIES') && extracurriculars.length === 0) {
      missing.push('Extra Curricular Activities');
    }
    if (!isSectionHidden('TRAINING / COURSES') && courses.length === 0) {
      missing.push('Training / Courses');
    }
    if (!isSectionHidden('ACADEMIC / PERSONAL PROJECT') && projects.length === 0) {
      missing.push('Academic / Personal Project');
    }
    if (!isSectionHidden('SKILLS') && skillsList.length === 0) {
      missing.push('Skills');
    }
    if (!isSectionHidden('PORTFOLIO / WORK SAMPLES') && portfolio.length === 0) {
      missing.push('Portfolio / Work Samples');
    }
    if (!isSectionHidden('ACCOMPLISHMENTS') && accomplishments.length === 0) {
      missing.push('Accomplishments');
    }

    if (missing.length > 0) {
      toast.error(`Please fill or hide the following empty fields/sections: ${missing.join(', ')}`);
      return;
    }

    // Save current state first
    handleSaveAll(true);
    // Open standard printing flow
    window.print();
  };


  // --- HIDE/DELETE SECTIONS HANDLERS ---
  const toggleSection = (sectionName) => {
    if (hiddenSections.includes(sectionName)) {
      const updated = hiddenSections.filter(s => s !== sectionName);
      setHiddenSections(updated);
      toast.success(`Restored "${sectionName}" section!`, { autoClose: 1500 });
    } else {
      const updated = [...hiddenSections, sectionName];
      setHiddenSections(updated);
      toast.info(`Deleted/Hidden "${sectionName}". You can restore it from the "Manage Sections" bar.`, { autoClose: 2500 });
    }
  };

  const isSectionHidden = (sectionName) => {
    return hiddenSections.includes(sectionName);
  };

  // --- SKILLS HANDLERS ---
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skillsList.includes(newSkill.trim())) {
      const updated = [...skillsList, newSkill.trim()];
      setSkillsList(updated);
      setNewSkill('');
      toast.info(`Added "${newSkill.trim()}".`, { autoClose: 1000 });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skillsList.filter(s => s !== skillToRemove);
    setSkillsList(updated);
  };

  // --- EDUCATION HANDLERS ---
  const saveEducationItem = () => {
    if (!educationForm.degree || !educationForm.school) {
      toast.warning('Degree and School/College are required.');
      return;
    }

    if (activeEducationForm === 'new') {
      setEducation([...education, educationForm]);
    } else {
      const updated = [...education];
      updated[activeEducationForm] = educationForm;
      setEducation(updated);
    }
    setActiveEducationForm(null);
    setEducationForm({ degree: '', stream: '', school: '', years: '' });
  };

  const deleteEducationItem = (index) => {
    const updated = education.filter((_, i) => i !== index);
    setEducation(updated);
  };

  // --- EXPERIENCE HANDLERS ---
  const saveExperienceItem = () => {
    if (!experienceForm.title || !experienceForm.company) {
      toast.warning('Job Title and Company are required.');
      return;
    }

    if (activeExperienceForm === 'new') {
      setExperience([...experience, experienceForm]);
    } else {
      const updated = [...experience];
      updated[activeExperienceForm] = experienceForm;
      setExperience(updated);
    }
    setActiveExperienceForm(null);
    setExperienceForm({ title: '', company: '', type: 'Internship', duration: '', location: '' });
  };

  const deleteExperienceItem = (index) => {
    const updated = experience.filter((_, i) => i !== index);
    setExperience(updated);
  };

  // --- EXTRA CURRICULAR HANDLERS ---
  const saveExtracurricularItem = () => {
    if (!extracurricularText.trim()) return;

    if (activeExtracurricularForm === 'new') {
      setExtracurriculars([...extracurriculars, extracurricularText.trim()]);
    } else {
      const updated = [...extracurriculars];
      updated[activeExtracurricularForm] = extracurricularText.trim();
      setExtracurriculars(updated);
    }
    setActiveExtracurricularForm(null);
    setExtracurricularText('');
  };

  const deleteExtracurricularItem = (index) => {
    const updated = extracurriculars.filter((_, i) => i !== index);
    setExtracurriculars(updated);
  };

  // --- COURSE HANDLERS ---
  const saveCourseItem = () => {
    if (!courseForm.name || !courseForm.organization) {
      toast.warning('Course Name and Organization are required.');
      return;
    }

    if (activeCourseForm === 'new') {
      setCourses([...courses, courseForm]);
    } else {
      const updated = [...courses];
      updated[activeCourseForm] = courseForm;
      setCourses(updated);
    }
    setActiveCourseForm(null);
    setCourseForm({ name: '', organization: '', duration: '' });
  };

  const deleteCourseItem = (index) => {
    const updated = courses.filter((_, i) => i !== index);
    setCourses(updated);
  };

  // --- PROJECT HANDLERS ---
  const saveProjectItem = () => {
    if (!projectForm.title || !projectForm.description) {
      toast.warning('Project Title and Description are required.');
      return;
    }

    if (activeProjectForm === 'new') {
      setProjects([...projects, projectForm]);
    } else {
      const updated = [...projects];
      updated[activeProjectForm] = projectForm;
      setProjects(updated);
    }
    setActiveProjectForm(null);
    setProjectForm({ title: '', description: '', link: '' });
  };

  const deleteProjectItem = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
  };

  // --- PORTFOLIO HANDLERS ---
  const savePortfolioItem = () => {
    if (!portfolioForm.platform || !portfolioForm.url) {
      toast.warning('Platform and URL are required.');
      return;
    }

    if (activePortfolioForm === 'new') {
      setPortfolio([...portfolio, portfolioForm]);
    } else {
      const updated = [...portfolio];
      updated[activePortfolioForm] = portfolioForm;
      setPortfolio(updated);
    }
    setActivePortfolioForm(null);
    setPortfolioForm({ platform: '', url: '' });
  };

  const deletePortfolioItem = (index) => {
    const updated = portfolio.filter((_, i) => i !== index);
    setPortfolio(updated);
  };

  // --- ACCOMPLISHMENTS HANDLERS ---
  const saveAccomplishmentItem = () => {
    if (!accomplishmentText.trim()) return;

    if (activeAccomplishmentForm === 'new') {
      setAccomplishments([...accomplishments, accomplishmentText.trim()]);
    } else {
      const updated = [...accomplishments];
      updated[activeAccomplishmentForm] = accomplishmentText.trim();
      setAccomplishments(updated);
    }
    setActiveAccomplishmentForm(null);
    setAccomplishmentText('');
  };

  const deleteAccomplishmentItem = (index) => {
    const updated = accomplishments.filter((_, i) => i !== index);
    setAccomplishments(updated);
  };

  if (loading) {
    return (
      <div className="resume-loading-container">
        <div className="resume-spinner"></div>
        <p>Loading ATS-friendly resume template...</p>
      </div>
    );
  }

  return (
    <div className="resume-page-wrapper">
      {/* Floating Save Actions for desktop editor */}
      <div className="resume-save-banner no-print">
        <div className="banner-content">
          <span className="banner-text">
            {saving ? 'Saving changes...' : 'ATS-Friendly Interactive Editor. Save or Download when finished.'}
          </span>
          <div className="banner-buttons">
            <button 
              className="btn-save-resume" 
              onClick={() => handleSaveAll(false)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="resume-paper-sheet">
        
        {/* --- SECTION CONTROLLER BAR (no-print) --- */}
        <div className="section-manager no-print">
          <div className="manager-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Manage Resume Sections (Toggle Visibility):
          </div>
          <div className="manager-pills">
            {ALL_SECTIONS.map(sec => {
              const hidden = isSectionHidden(sec);
              return (
                <button
                  key={sec}
                  type="button"
                  className={`manager-pill ${hidden ? 'hidden-pill' : 'visible-pill'}`}
                  onClick={() => toggleSection(sec)}
                  title={hidden ? `Show ${sec} section` : `Hide ${sec} section`}
                >
                  <span className="pill-icon">{hidden ? '➕' : '➖'}</span>
                  {sec}
                </button>
              );
            })}
          </div>
        </div>

        {/* RESUME HEADER */}
        <div className="resume-header-block">
          <div className="header-left">
            {editNameMode ? (
              <div className="name-edit-form no-print">
                <input 
                  type="text" 
                  className="name-input"
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  autoFocus
                />
                <button className="btn-small-done" onClick={() => setEditNameMode(false)}>Done</button>
              </div>
            ) : (
              <h1 className="candidate-name" onClick={() => setEditNameMode(true)} title="Click to edit name">
                {name || 'Add Your Name'}
                <svg className="edit-icon-svg no-print" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                </svg>
              </h1>
            )}

            {/* Contact details */}
            {editContactMode ? (
              <div className="contact-edit-form no-print">
                <input 
                  type="text" 
                  className="contact-input"
                  value={mobileNumber} 
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Phone number"
                />
                <input 
                  type="text" 
                  className="contact-input"
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location (e.g. Pune)"
                />
                <button className="btn-small-done" onClick={() => setEditContactMode(false)}>Done</button>
              </div>
            ) : (
              <div className="candidate-contact" onClick={() => setEditContactMode(true)} title="Click to edit contact info">
                <span className="contact-item">{email || 'add.email@example.com'}</span>
                <span className="contact-divider">|</span>
                <span className="contact-item">{mobileNumber || 'Add Phone Number'}</span>
                <span className="contact-divider">|</span>
                <span className="contact-item">{location || 'Add Location'}</span>
                <svg className="edit-icon-svg no-print" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                </svg>
              </div>
            )}
          </div>

          <div className="header-right no-print">
            <button className="btn-download-pdf" onClick={triggerDownloadPDF}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* CAREER OBJECTIVE SECTION */}
        {!isSectionHidden('CAREER OBJECTIVE') && (
          <div className="resume-section-wrapper">
            <h2 className="section-title">
              CAREER OBJECTIVE
              <button 
                type="button" 
                className="btn-delete-section no-print"
                onClick={() => toggleSection('CAREER OBJECTIVE')}
                title="Hide CAREER OBJECTIVE section"
              >
                × Hide Section
              </button>
            </h2>
            <div className="interactive-block objective-block">
              {editObjectiveMode ? (
                <div className="objective-edit-form no-print">
                  <textarea 
                    className="objective-textarea"
                    value={careerObjective}
                    onChange={(e) => setCareerObjective(e.target.value)}
                    placeholder="Describe your career goals and objective..."
                    rows={4}
                  />
                  <button className="btn-small-done" onClick={() => setEditObjectiveMode(false)}>Done</button>
                </div>
              ) : (
                <div className="objective-display" onClick={() => setEditObjectiveMode(true)}>
                  <p className="objective-text">
                    {careerObjective || <span className="placeholder-text">+ Add your career objective</span>}
                  </p>
                  {careerObjective && (
                    <svg className="edit-icon-svg no-print block-edit" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EDUCATION SECTION */}
        {!isSectionHidden('EDUCATION') && (
          <div className="resume-section-wrapper">
            <h2 className="section-title">
              EDUCATION
              <button 
                type="button" 
                className="btn-delete-section no-print"
                onClick={() => toggleSection('EDUCATION')}
                title="Hide EDUCATION section"
              >
                × Hide Section
              </button>
            </h2>
            <div className="education-list">
              {education.map((edu, idx) => (
                <div key={idx} className="interactive-block education-item">
                  {activeEducationForm === idx ? (
                    <div className="inline-edit-form no-print">
                      <input 
                        type="text" 
                        placeholder="Degree / Certificate (e.g. Bachelor of Computer (B.C.S.))" 
                        value={educationForm.degree}
                        onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="Stream / Major (e.g. Computer Science)" 
                        value={educationForm.stream}
                        onChange={(e) => setEducationForm({ ...educationForm, stream: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="School / College / University" 
                        value={educationForm.school}
                        onChange={(e) => setEducationForm({ ...educationForm, school: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="Years / Duration (e.g. 2022 - 2025)" 
                        value={educationForm.years}
                        onChange={(e) => setEducationForm({ ...educationForm, years: e.target.value })}
                      />
                      <div className="form-actions">
                        <button className="btn-form-save" onClick={saveEducationItem}>Save</button>
                        <button className="btn-form-cancel" onClick={() => setActiveEducationForm(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="item-display">
                      <div className="item-main-row">
                        <span className="item-title">{edu.degree} {edu.stream ? `, ${edu.stream}` : ''}</span>
                        <span className="item-meta-right">{edu.years}</span>
                      </div>
                      <div className="item-sub-row">
                        <span className="item-subtitle">{edu.school}</span>
                      </div>
                      <div className="item-actions-overlay no-print">
                        <button className="btn-action-edit" onClick={() => {
                          setActiveEducationForm(idx);
                          setEducationForm(edu);
                        }}>
                          Edit
                        </button>
                        <button className="btn-action-delete" onClick={() => deleteEducationItem(idx)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {activeEducationForm === 'new' ? (
                <div className="inline-edit-form no-print new-item-form">
                  <input 
                    type="text" 
                    placeholder="Degree / Certificate (e.g. Bachelor of Computer (B.C.S.))" 
                    value={educationForm.degree}
                    onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="Stream / Major (e.g. Computer Science)" 
                    value={educationForm.stream}
                    onChange={(e) => setEducationForm({ ...educationForm, stream: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="School / College / University" 
                    value={educationForm.school}
                    onChange={(e) => setEducationForm({ ...educationForm, school: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="Years / Duration (e.g. 2022 - 2025)" 
                    value={educationForm.years}
                    onChange={(e) => setEducationForm({ ...educationForm, years: e.target.value })}
                  />
                  <div className="form-actions">
                    <button className="btn-form-save" onClick={saveEducationItem}>Add</button>
                    <button className="btn-form-cancel" onClick={() => setActiveEducationForm(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="btn-add-section-item no-print" 
                  onClick={() => {
                    setActiveEducationForm('new');
                    setEducationForm({ degree: '', stream: '', school: '', years: '' });
                  }}
                >
                  + Add education
                </button>
              )}
            </div>
          </div>
        )}

        {/* WORK EXPERIENCE SECTION */}
        {!isSectionHidden('WORK EXPERIENCE') && (
          <div className="resume-section-wrapper">
            <h2 className="section-title">
              WORK EXPERIENCE
              <button 
                type="button" 
                className="btn-delete-section no-print"
                onClick={() => toggleSection('WORK EXPERIENCE')}
                title="Hide WORK EXPERIENCE section"
              >
                × Hide Section
              </button>
            </h2>
            <div className="experience-list">
              {experience.map((exp, idx) => (
                <div key={idx} className="interactive-block experience-item">
                  {activeExperienceForm === idx ? (
                    <div className="inline-edit-form no-print">
                      <input 
                        type="text" 
                        placeholder="Job Title (e.g. UI/UX Designer)" 
                        value={experienceForm.title}
                        onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="Company / Organization Name" 
                        value={experienceForm.company}
                        onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                      />
                      <select 
                        value={experienceForm.type}
                        onChange={(e) => setExperienceForm({ ...experienceForm, type: e.target.value })}
                      >
                        <option value="Internship">Internship</option>
                        <option value="Job">Job / Full-Time</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Duration (e.g. Oct 2024 - Present)" 
                        value={experienceForm.duration}
                        onChange={(e) => setExperienceForm({ ...experienceForm, duration: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="Location / Virtual" 
                        value={experienceForm.location}
                        onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                      />
                      <div className="form-actions">
                        <button className="btn-form-save" onClick={saveExperienceItem}>Save</button>
                        <button className="btn-form-cancel" onClick={() => setActiveExperienceForm(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="item-display">
                      <div className="item-main-row">
                        <span className="item-title">{exp.title}</span>
                        <span className="item-meta-right">{exp.duration}</span>
                      </div>
                      <div className="item-sub-row">
                        <span className="item-subtitle">{exp.company} {exp.location ? `(${exp.location})` : ''}</span>
                        <span className="type-tag">{exp.type}</span>
                      </div>
                      <div className="item-actions-overlay no-print">
                        <button className="btn-action-edit" onClick={() => {
                          setActiveExperienceForm(idx);
                          setExperienceForm(exp);
                        }}>
                          Edit
                        </button>
                        <button className="btn-action-delete" onClick={() => deleteExperienceItem(idx)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {activeExperienceForm === 'new' ? (
                <div className="inline-edit-form no-print new-item-form">
                  <input 
                    type="text" 
                    placeholder="Job Title (e.g. UI/UX Designer)" 
                    value={experienceForm.title}
                    onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="Company / Organization Name" 
                    value={experienceForm.company}
                    onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                  />
                  <select 
                    value={experienceForm.type}
                    onChange={(e) => setExperienceForm({ ...experienceForm, type: e.target.value })}
                  >
                    <option value="Internship">Internship</option>
                    <option value="Job">Job / Full-Time</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Duration (e.g. Oct 2024 - Present)" 
                    value={experienceForm.duration}
                    onChange={(e) => setExperienceForm({ ...experienceForm, duration: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="Location / Virtual" 
                    value={experienceForm.location}
                    onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                  />
                  <div className="form-actions">
                    <button className="btn-form-save" onClick={saveExperienceItem}>Add</button>
                    <button className="btn-form-cancel" onClick={() => setActiveExperienceForm(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="experience-add-buttons no-print">
                  <button 
                    type="button" 
                    className="btn-add-section-item" 
                    onClick={() => {
                      setActiveExperienceForm('new');
                      setExperienceForm({ title: '', company: '', type: 'Job', duration: '', location: '' });
                    }}
                    style={{ marginRight: '1rem' }}
                  >
                    + Add job
                  </button>
                  <button 
                    type="button" 
                    className="btn-add-section-item" 
                    onClick={() => {
                      setActiveExperienceForm('new');
                      setExperienceForm({ title: '', company: '', type: 'Internship', duration: '', location: '' });
                    }}
                  >
                    + Add internship
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EXTRA CURRICULAR ACTIVITIES SECTION */}
        {!isSectionHidden('EXTRA CURRICULAR ACTIVITIES') && (
          <div className="resume-section-wrapper">
            <h2 className="section-title">
              EXTRA CURRICULAR ACTIVITIES
              <button 
                type="button" 
                className="btn-delete-section no-print"
                onClick={() => toggleSection('EXTRA CURRICULAR ACTIVITIES')}
                title="Hide EXTRA CURRICULAR ACTIVITIES section"
              >
                × Hide Section
              </button>
            </h2>
            <div className="bullets-list">
              {extracurriculars.map((act, idx) => (
                <div key={idx} className="interactive-block bullet-item">
                  {activeExtracurricularForm === idx ? (
                    <div className="inline-edit-form no-print">
                      <input 
                        type="text" 
                        value={extracurricularText}
                        onChange={(e) => setExtracurricularText(e.target.value)}
                      />
                      <div className="form-actions">
                        <button className="btn-form-save" onClick={saveExtracurricularItem}>Save</button>
                        <button className="btn-form-cancel" onClick={() => setActiveExtracurricularForm(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="item-display bullet-display">
                      <span className="bullet-dot">•</span>
                      <span className="bullet-content-text">{act}</span>
                      <div className="item-actions-overlay no-print">
                        <button className="btn-action-edit" onClick={() => {
                          setActiveExtracurricularForm(idx);
                          setExtracurricularText(act);
                        }}>
                          Edit
                        </button>
                        <button className="btn-action-delete" onClick={() => deleteExtracurricularItem(idx)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {activeExtracurricularForm === 'new' ? (
                <div className="inline-edit-form no-print new-item-form">
                  <input 
                    type="text" 
                    placeholder="e.g. President of the University Coding Club" 
                    value={extracurricularText}
                    onChange={(e) => setExtracurricularText(e.target.value)}
                  />
                  <div className="form-actions">
                    <button className="btn-form-save" onClick={saveExtracurricularItem}>Add</button>
                    <button className="btn-form-cancel" onClick={() => setActiveExtracurricularForm(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="btn-add-section-item no-print" 
                  onClick={() => {
                    setActiveExtracurricularForm('new');
                    setExtracurricularText('');
                  }}
                >
                  + Add extra curricular activities
                </button>
              )}
            </div>
          </div>
        )}

        {/* TRAINING / COURSES SECTION */}
        {!isSectionHidden('TRAINING / COURSES') && (
          <div className="resume-section-wrapper">
            <h2 className="section-title">
              TRAINING / COURSES
              <button 
                type="button" 
                className="btn-delete-section no-print"
                onClick={() => toggleSection('TRAINING / COURSES')}
                title="Hide TRAINING / COURSES section"
              >
                × Hide Section
              </button>
            </h2>
            <div className="courses-list">
              {courses.map((course, idx) => (
                <div key={idx} className="interactive-block course-item">
                  {activeCourseForm === idx ? (
                    <div className="inline-edit-form no-print">
                      <input 
                        type="text" 
                        placeholder="Course Title" 
                        value={courseForm.name}
                        onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="Organization / Platform" 
                        value={courseForm.organization}
                        onChange={(e) => setCourseForm({ ...courseForm, organization: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="Duration (e.g. 6 Months, 2024)" 
                        value={courseForm.duration}
                        onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                      />
                      <div className="form-actions">
                        <button className="btn-form-save" onClick={saveCourseItem}>Save</button>
                        <button className="btn-form-cancel" onClick={() => setActiveCourseForm(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="item-display">
                      <div className="item-main-row">
                        <span className="item-title">{course.name}</span>
                        <span className="item-meta-right">{course.duration}</span>
                      </div>
                      <div className="item-sub-row">
                        <span className="item-subtitle">{course.organization}</span>
                      </div>
                      <div className="item-actions-overlay no-print">
                        <button className="btn-action-edit" onClick={() => {
                          setActiveCourseForm(idx);
                          setCourseForm(course);
                        }}>
                          Edit
                        </button>
                        <button className="btn-action-delete" onClick={() => deleteCourseItem(idx)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {activeCourseForm === 'new' ? (
                <div className="inline-edit-form no-print new-item-form">
                  <input 
                    type="text" 
                    placeholder="Course Title" 
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="Organization / Platform" 
                    value={courseForm.organization}
                    onChange={(e) => setCourseForm({ ...courseForm, organization: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="Duration (e.g. 6 Months, 2024)" 
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  />
                  <div className="form-actions">
                    <button className="btn-form-save" onClick={saveCourseItem}>Add</button>
                    <button className="btn-form-cancel" onClick={() => setActiveCourseForm(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="btn-add-section-item no-print" 
                  onClick={() => {
                    setActiveCourseForm('new');
                    setCourseForm({ name: '', organization: '', duration: '' });
                  }}
                >
                  + Add training/ course
                </button>
              )}
            </div>
          </div>
        )}

        {/* ACADEMIC / PERSONAL PROJECT SECTION */}
        {!isSectionHidden('ACADEMIC / PERSONAL PROJECT') && (
          <div className="resume-section-wrapper">
            <h2 className="section-title">
              ACADEMIC / PERSONAL PROJECT
              <button 
                type="button" 
                className="btn-delete-section no-print"
                onClick={() => toggleSection('ACADEMIC / PERSONAL PROJECT')}
                title="Hide ACADEMIC / PERSONAL PROJECT section"
              >
                × Hide Section
              </button>
            </h2>
            <div className="projects-list">
              {projects.map((proj, idx) => (
                <div key={idx} className="interactive-block project-item">
                  {activeProjectForm === idx ? (
                    <div className="inline-edit-form no-print">
                      <input 
                        type="text" 
                        placeholder="Project Title" 
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      />
                      <textarea 
                        placeholder="Project Description" 
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        rows={3}
                      />
                      <input 
                        type="text" 
                        placeholder="Link (e.g. GitHub Repository)" 
                        value={projectForm.link}
                        onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                      />
                      <div className="form-actions">
                        <button className="btn-form-save" onClick={saveProjectItem}>Save</button>
                        <button className="btn-form-cancel" onClick={() => setActiveProjectForm(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="item-display">
                      <div className="item-main-row">
                        <span className="item-title">{proj.title}</span>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noreferrer" className="project-link-anchor no-print">
                            Project Link ↗
                          </a>
                        )}
                      </div>
                      <p className="project-description">{proj.description}</p>
                      {proj.link && <span className="project-link-print print-only">Link: {proj.link}</span>}
                      <div className="item-actions-overlay no-print">
                        <button className="btn-action-edit" onClick={() => {
                          setActiveProjectForm(idx);
                          setProjectForm(proj);
                        }}>
                          Edit
                        </button>
                        <button className="btn-action-delete" onClick={() => deleteProjectItem(idx)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {activeProjectForm === 'new' ? (
                <div className="inline-edit-form no-print new-item-form">
                  <input 
                    type="text" 
                    placeholder="Project Title" 
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  />
                  <textarea 
                    placeholder="Project Description" 
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    rows={3}
                  />
                  <input 
                    type="text" 
                    placeholder="Link (e.g. GitHub Repository)" 
                    value={projectForm.link}
                    onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                  />
                  <div className="form-actions">
                    <button className="btn-form-save" onClick={saveProjectItem}>Add</button>
                    <button className="btn-form-cancel" onClick={() => setActiveProjectForm(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="btn-add-section-item no-print" 
                  onClick={() => {
                    setActiveProjectForm('new');
                    setProjectForm({ title: '', description: '', link: '' });
                  }}
                >
                  + Add academic/ personal project
                </button>
              )}
            </div>
          </div>
        )}

        {/* SKILLS SECTION */}
        {!isSectionHidden('SKILLS') && (
          <div className="resume-section-wrapper">
            <h2 className="section-title">
              SKILLS
              <button 
                type="button" 
                className="btn-delete-section no-print"
                onClick={() => toggleSection('SKILLS')}
                title="Hide SKILLS section"
              >
                × Hide Section
              </button>
            </h2>
            <div className="interactive-block skills-block">
              <div className="skills-grid">
                {skillsList.map((skill, idx) => (
                  <div key={idx} className="skill-chip">
                    <span className="skill-chip-text">{skill}</span>
                    <button 
                      type="button" 
                      className="btn-remove-skill no-print"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSkill} className="add-skill-form no-print">
                <input 
                  type="text" 
                  className="add-skill-input"
                  placeholder="Type skill and press Enter" 
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <button type="submit" className="btn-add-skill-trigger">
                  + Add skill
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PORTFOLIO / WORK SAMPLES SECTION */}
        {!isSectionHidden('PORTFOLIO / WORK SAMPLES') && (
          <div className="resume-section-wrapper">
            <h2 className="section-title">
              PORTFOLIO / WORK SAMPLES
              <button 
                type="button" 
                className="btn-delete-section no-print"
                onClick={() => toggleSection('PORTFOLIO / WORK SAMPLES')}
                title="Hide PORTFOLIO / WORK SAMPLES section"
              >
                × Hide Section
              </button>
            </h2>
            <div className="portfolio-list">
              {portfolio.map((port, idx) => (
                <div key={idx} className="interactive-block portfolio-item">
                  {activePortfolioForm === idx ? (
                    <div className="inline-edit-form no-print">
                      <input 
                        type="text" 
                        placeholder="Platform / Label (e.g. GitHub Profile)" 
                        value={portfolioForm.platform}
                        onChange={(e) => setPortfolioForm({ ...portfolioForm, platform: e.target.value })}
                      />
                      <input 
                        type="text" 
                        placeholder="URL" 
                        value={portfolioForm.url}
                        onChange={(e) => setPortfolioForm({ ...portfolioForm, url: e.target.value })}
                      />
                      <div className="form-actions">
                        <button className="btn-form-save" onClick={savePortfolioItem}>Save</button>
                        <button className="btn-form-cancel" onClick={() => setActivePortfolioForm(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="item-display">
                      <div className="portfolio-row">
                        <span className="platform-label">{port.platform}: </span>
                        <a href={port.url} target="_blank" rel="noreferrer" className="portfolio-link-anchor no-print">
                          {port.url}
                        </a>
                        <span className="portfolio-link-print print-only">{port.url}</span>
                      </div>
                      <div className="item-actions-overlay no-print">
                        <button className="btn-action-edit" onClick={() => {
                          setActivePortfolioForm(idx);
                          setPortfolioForm(port);
                        }}>
                          Edit
                        </button>
                        <button className="btn-action-delete" onClick={() => deletePortfolioItem(idx)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {activePortfolioForm === 'new' ? (
                <div className="inline-edit-form no-print new-item-form">
                  <input 
                    type="text" 
                    placeholder="Platform / Label (e.g. GitHub Profile)" 
                    value={portfolioForm.platform}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, platform: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="URL" 
                    value={portfolioForm.url}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, url: e.target.value })}
                  />
                  <div className="form-actions">
                    <button className="btn-form-save" onClick={savePortfolioItem}>Add</button>
                    <button className="btn-form-cancel" onClick={() => setActivePortfolioForm(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="btn-add-section-item no-print" 
                  onClick={() => {
                    setActivePortfolioForm('new');
                    setPortfolioForm({ platform: '', url: '' });
                  }}
                >
                  + Add portfolio/ work sample
                </button>
              )}
            </div>
          </div>
        )}

        {/* ACCOMPLISHMENTS SECTION */}
        {!isSectionHidden('ACCOMPLISHMENTS') && (
          <div className="resume-section-wrapper">
            <h2 className="section-title">
              ACCOMPLISHMENTS / ADDITIONAL DETAILS
              <button 
                type="button" 
                className="btn-delete-section no-print"
                onClick={() => toggleSection('ACCOMPLISHMENTS')}
                title="Hide ACCOMPLISHMENTS section"
              >
                × Hide Section
              </button>
            </h2>
            <div className="bullets-list">
              {accomplishments.map((acc, idx) => (
                <div key={idx} className="interactive-block bullet-item">
                  {activeAccomplishmentForm === idx ? (
                    <div className="inline-edit-form no-print">
                      <input 
                        type="text" 
                        value={accomplishmentText}
                        onChange={(e) => setAccomplishmentText(e.target.value)}
                      />
                      <div className="form-actions">
                        <button className="btn-form-save" onClick={saveAccomplishmentItem}>Save</button>
                        <button className="btn-form-cancel" onClick={() => setActiveAccomplishmentForm(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="item-display bullet-display">
                      <span className="bullet-dot">•</span>
                      <span className="bullet-content-text">{acc}</span>
                      <div className="item-actions-overlay no-print">
                        <button className="btn-action-edit" onClick={() => {
                          setActiveAccomplishmentForm(idx);
                          setAccomplishmentText(acc);
                        }}>
                          Edit
                        </button>
                        <button className="btn-action-delete" onClick={() => deleteAccomplishmentItem(idx)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {activeAccomplishmentForm === 'new' ? (
                <div className="inline-edit-form no-print new-item-form">
                  <input 
                    type="text" 
                    placeholder="e.g. Secured 1st place in the national hackathon out of 300 teams" 
                    value={accomplishmentText}
                    onChange={(e) => setAccomplishmentText(e.target.value)}
                  />
                  <div className="form-actions">
                    <button className="btn-form-save" onClick={saveAccomplishmentItem}>Add</button>
                    <button className="btn-form-cancel" onClick={() => setActiveAccomplishmentForm(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="btn-add-section-item no-print" 
                  onClick={() => {
                    setActiveAccomplishmentForm('new');
                    setAccomplishmentText('');
                  }}
                >
                  + Add accomplishment/ additional detail
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
