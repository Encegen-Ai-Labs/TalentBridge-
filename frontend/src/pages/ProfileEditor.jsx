import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentProfile, updateStudentProfile } from '../services/api';
import { toast } from 'react-toastify';
import './ProfileEditor.css';

const defaultResumeData = {
  careerPreferences: {
    preferredJobType: '',
    preferredLocations: '',
    availabilityToWork: ''
  },
  education: [],
  skills: [],
  languages: [],
  internships: [],
  projects: [],
  summary: '',
  accomplishments: {
    certifications: [],
    awards: [],
    clubs: []
  },
  competitiveExams: [],
  employment: [],
  academicAchievements: [],
  resumeFile: null
};

function safeParseJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch (e) { return null; }
}

export default function ProfileEditor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeFormSection, setActiveFormSection] = useState(null);
  
  // Local item states for managing dynamic lists (Add/Edit modals or inline forms)
  const [editingItem, setEditingItem] = useState(null);

  const [profile, setProfile] = useState({
    name: '',
    degree: '',
    college: '',
    location: '',
    gender: '',
    dob: '',
    phone: '',
    email: '',
    resumeUrl: '',
    strengthPercent: 0
  });

  const [resumeData, setResumeData] = useState(defaultResumeData);

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const getStrengthPercent = (profileData, resumeDataState) => {
    const items = [
      profileData.name,
      profileData.phone,
      profileData.email,
      profileData.location,
      profileData.gender,
      profileData.dob,
      resumeDataState.summary,
      resumeDataState.skills.length,
      resumeDataState.education.length,
      resumeDataState.projects.length,
      resumeDataState.internships.length
    ];
    const filled = items.filter((value) => {
      if (typeof value === 'number') return value > 0;
      return value && value.toString().trim().length > 0;
    }).length;
    return Math.round((filled / items.length) * 100);
  };

  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      const data = await getStudentProfile();
      if (data) {
        const user = data.user || {};
        const profileRecord = data.profile || {};
        const resumeJson = safeParseJson(profileRecord.resume_data) || {};
        const education = Array.isArray(resumeJson.education) ? resumeJson.education : [];

        setProfile({
          name: user.name || `${resumeJson.first_name || ''} ${resumeJson.last_name || ''}`.trim(),
          degree: education[0]?.qualification || '',
          college: education[0]?.institution || '',
          location: resumeJson.location || profileRecord.branch || '',
          gender: resumeJson.gender || '',
          dob: resumeJson.dob || '',
          phone: user.mobile_number || '',
          email: user.email || '',
          resumeUrl: resumeJson.resumeUrl || profileRecord.resume_url || '',
          strengthPercent: getStrengthPercent({
            name: user.name || `${resumeJson.first_name || ''} ${resumeJson.last_name || ''}`.trim(),
            phone: user.mobile_number || '',
            email: user.email || '',
            location: resumeJson.location || profileRecord.branch || '',
            gender: resumeJson.gender || '',
            dob: resumeJson.dob || ''
          }, {
            ...resumeJson,
            skills: Array.isArray(resumeJson.skills) ? resumeJson.skills : typeof profileRecord.skills === 'string' ? profileRecord.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
            education,
            projects: Array.isArray(resumeJson.projects) ? resumeJson.projects : [],
            internships: Array.isArray(resumeJson.internships) ? resumeJson.internships : []
          })
        });

        setResumeData({
          careerPreferences: {
            ...defaultResumeData.careerPreferences,
            ...(resumeJson.careerPreferences || {})
          },
          education,
          skills: Array.isArray(resumeJson.skills) ? resumeJson.skills : typeof profileRecord.skills === 'string' ? profileRecord.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
          languages: Array.isArray(resumeJson.languages) ? resumeJson.languages : [],
          internships: Array.isArray(resumeJson.internships) ? resumeJson.internships : [],
          projects: Array.isArray(resumeJson.projects) ? resumeJson.projects : [],
          summary: resumeJson.summary || '',
          accomplishments: {
            certifications: Array.isArray(resumeJson.accomplishments?.certifications) ? resumeJson.accomplishments.certifications : [],
            awards: Array.isArray(resumeJson.accomplishments?.awards) ? resumeJson.accomplishments.awards : [],
            clubs: Array.isArray(resumeJson.accomplishments?.clubs) ? resumeJson.accomplishments.clubs : []
          },
          competitiveExams: Array.isArray(resumeJson.competitiveExams) ? resumeJson.competitiveExams : [],
          employment: Array.isArray(resumeJson.employment) ? resumeJson.employment : [],
          academicAchievements: Array.isArray(resumeJson.academicAchievements) ? resumeJson.academicAchievements : [],
          resumeFile: resumeJson.resumeFile || null
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handlePreferenceChange = (key, value) => {
    setResumeData(prev => ({
      ...prev,
      careerPreferences: { ...prev.careerPreferences, [key]: value }
    }));
  };

  // List Management handlers
  const deleteListItem = (section, id) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
    toast.info('Item removed.');
  };

  const deleteSkill = (skillToDelete) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToDelete)
    }));
  };

  const addSkill = (newSkill) => {
    if (!newSkill) return;
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const mergedResumeData = {
        ...resumeData,
        gender: profile.gender,
        dob: profile.dob,
        location: profile.location,
        first_name: profile.name?.split(' ')[0] || '',
        last_name: profile.name?.split(' ').slice(1).join(' ') || ''
      };

      await updateStudentProfile({
        name: profile.name,
        mobile_number: profile.phone,
        branch: profile.location,
        year: resumeData.education[0]?.qualification || '',
        skills: resumeData.skills.join(', '),
        resume_url: profile.resumeUrl || '',
        resume_data: JSON.stringify(mergedResumeData)
      });

      toast.success('Profile configurations updated successfully.');
      await fetchProfileDetails();
      setActiveFormSection(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save profile structural updates.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-app-container loading-wrapper">
        <div className="app-spinner" />
        <p>Assembling profile layout...</p>
      </div>
    );
  }

  return (
    <div className="profile-app-container">
      {/* Top action header bar */}
      <div className="app-topbar-nav">
        <button className="nav-back-button" onClick={() => navigate('/profile')}>
          <span className="arrow">←</span> View & Edit
        </button>
        <div className="nav-right-actions">
          <span className="insights-tab-trigger active">Activity insights</span>
        </div>
      </div>

      <div className="profile-dashboard-layout">
        
        {/* Main interactive form card groups */}
        <main className="dashboard-main-content">
          
          {/* Top Profile Summary Widget Grid */}
          <div className="profile-hero-card">
            <div className="hero-identity-block">
              <div className="completion-ring-box">
                <svg className="progress-ring" width="80" height="80">
                  <circle className="progress-ring-bg" stroke="#f1f5f9" strokeWidth="6" fill="transparent" r="34" cx="40" cy="40"/>
                  <circle className="progress-ring-bar" stroke="#f97316" strokeWidth="6" fill="transparent" r="34" cx="40" cy="40" style={{ strokeDasharray: 213, strokeDashoffset: 213 - (213 * profile.strengthPercent) / 100 }}/>
                </svg>
                <div className="progress-text">
                  <span className="percent">{profile.strengthPercent}%</span>
                  <span className="label">Approval pending</span>
                </div>
              </div>

              <div className="identity-details">
                <div className="name-header">
                  <h2>{profile.name || 'Unnamed student'}</h2>
                  <button className="icon-edit-pencil" onClick={() => setActiveFormSection('identity')}>✏️</button>
                </div>
                <p className="degree-subtext">{profile.degree || 'Degree not set'}</p>
                <p className="college-subtext">{profile.college || 'College not set'}</p>
                
                <div className="meta-contact-row">
                  <span>📍 {profile.location || 'Location not set'}</span>
                  <span>👤 {profile.gender || 'Gender not set'}</span>
                  <span>📅 {profile.dob || 'DOB not set'}</span>
                </div>
              </div>
            </div>

            <div className="hero-contact-block">
              <div className="contact-item">
                <span className="phone-icon">📞</span>
                <span className="val">{profile.phone}</span>
                <button className="verify-badge-btn">Verify</button>
              </div>
              <div className="contact-item">
                <span className="email-icon">✉️</span>
                <span className="val">{profile.email}</span>
                <span className="verified-check-icon">✅</span>
              </div>
            </div>

            <div className="hero-missing-prompts">
              <ul>
                <li><span>📝 Verify mobile</span> <span className="delta green">↑ 2%</span></li>
                <li><span>📝 Add competitive exam</span> <span className="delta green">↑ 6%</span></li>
                <li><span>📝 Add Internship</span> <span className="delta green">↑ 8%</span></li>
              </ul>
              <button className="add-missing-details-btn">Add 5 missing details</button>
            </div>
          </div>

          {/* SECTION: Career Preferences */}
          <section className="dashboard-section-card" id="preference">
            <div className="section-card-header">
              <h3>Your career preferences</h3>
              <button className="action-trigger-btn edit" onClick={() => setActiveFormSection('preference')}>✏️</button>
            </div>
            <div className="preferences-subgrid">
              <div className="pref-cell">
                <span className="cell-title">PREFERRED JOB TYPE</span>
                <span className="cell-value">{resumeData.careerPreferences.preferredJobType || 'Not set'}</span>
              </div>
              <div className="pref-cell">
                <span className="cell-title">PREFERRED LOCATION</span>
                <span className="cell-value">{resumeData.careerPreferences.preferredLocations || 'Not set'}</span>
              </div>
              <div className="pref-cell">
                <span className="cell-title">AVAILABILITY TO WORK</span>
                <span className="cell-value highlighted">{resumeData.careerPreferences.availabilityToWork || 'Add work availability'}</span>
              </div>
            </div>
          </section>

          {/* SECTION: Education History */}
          <section className="dashboard-section-card" id="education">
            <div className="section-card-header">
              <h3>Education</h3>
              <button className="action-trigger-btn add" onClick={() => setActiveFormSection('add-education')}>Add</button>
            </div>
            <div className="education-list-wrapper">
              {resumeData.education.map((edu) => (
                <div key={edu.id} className="education-timeline-node">
                  <div className="node-content">
                    <h4>{edu.institution}</h4>
                    <span className="edit-node-pencil" onClick={() => { setEditingItem(edu); setActiveFormSection('edit-education'); }}>✏️</span>
                    <p className="qual-text">{edu.qualification}</p>
                    {edu.stream && <p className="stream-text">{edu.stream}</p>}
                    {edu.marks && <p className="marks-text">{edu.marks}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION: Key Skills */}
          <section className="dashboard-section-card" id="key-skills">
            <div className="section-card-header">
              <h3>Key skills</h3>
              <button className="action-trigger-btn edit" onClick={() => setActiveFormSection('skills')}>✏️</button>
            </div>
            <div className="interactive-chips-row">
              {resumeData.skills.map((skill, i) => (
                <div key={i} className="skill-badge-chip">
                  <span>{skill}</span>
                  <button className="remove-chip-cross" onClick={() => deleteSkill(skill)}>×</button>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION: Languages */}
          <section className="dashboard-section-card" id="languages">
            <div className="section-card-header">
              <h3>Languages</h3>
              <button className="action-trigger-btn add" onClick={() => setActiveFormSection('languages')}>Add</button>
            </div>
            <div className="languages-display-grid">
              {resumeData.languages.map((lang, idx) => (
                <div key={idx} className="language-item-row">
                  <div className="lang-meta">
                    <span className="lang-name">{lang.name}</span>
                    <span className="edit-lang-btn" onClick={() => setActiveFormSection('languages')}>✏️</span>
                  </div>
                  <span className="lang-capabilities">
                    {[
                      lang.read && 'Can read',
                      lang.write && 'write',
                      lang.speak && 'speak'
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION: Internships */}
          <section className="dashboard-section-card" id="internships">
            <div className="section-card-header">
              <h3>Internships</h3>
              <button className="action-trigger-btn add" onClick={() => setActiveFormSection('internships')}>Add</button>
            </div>
            {resumeData.internships.length === 0 ? (
              <div className="empty-placeholder-block">
                <p>Talk about the company you interned at, what projects you undertook and what special skills you learned</p>
              </div>
            ) : null}
          </section>

          {/* SECTION: Projects */}
          <section className="dashboard-section-card" id="projects">
            <div className="section-card-header">
              <h3>Projects</h3>
              <button className="action-trigger-btn add" onClick={() => setActiveFormSection('projects')}>Add</button>
            </div>
            {resumeData.projects.length === 0 ? (
              <div className="empty-placeholder-block">
                <p>Talk about your projects that made you proud and contributed to your learnings</p>
              </div>
            ) : null}
          </section>

          {/* SECTION: Profile Summary */}
          <section className="dashboard-section-card" id="profile-summary">
            <div className="section-card-header">
              <h3>Profile summary</h3>
              <button className="action-trigger-btn edit" onClick={() => setActiveFormSection('summary')}>✏️</button>
            </div>
            <p className="editable-summary-paragraph">{resumeData.summary}</p>
          </section>

          {/* SECTION: Accomplishments */}
          <section className="dashboard-section-card" id="accomplishments">
            <div className="section-card-header">
              <h3>Accomplishments</h3>
            </div>
            <div className="sub-accomplishment-row">
              <div className="sub-acc-header">
                <div className="label-group">
                  <h4>Certifications</h4>
                  <p>Talk about any certified courses that you completed</p>
                </div>
                <button className="action-trigger-btn add" onClick={() => setActiveFormSection('accomplishments')}>Add</button>
              </div>
            </div>
            <div className="sub-accomplishment-row">
              <div className="sub-acc-header">
                <div className="label-group">
                  <h4>Awards</h4>
                  <p>Talk about any special recognitions that you received that makes you proud</p>
                </div>
                <button className="action-trigger-btn add" onClick={() => setActiveFormSection('accomplishments')}>Add</button>
              </div>
            </div>
            <div className="sub-accomplishment-row">
              <div className="sub-acc-header">
                <div className="label-group">
                  <h4>Club & committees</h4>
                  <p>Add details of position of responsibilities that you have held</p>
                </div>
                <button className="action-trigger-btn add" onClick={() => setActiveFormSection('accomplishments')}>Add</button>
              </div>
            </div>
          </section>

          {/* SECTION: Competitive Exams */}
          <section className="dashboard-section-card" id="competitive-exams">
            <div className="section-card-header">
              <h3>Competitive exams</h3>
              <button className="action-trigger-btn add" onClick={() => setActiveFormSection('exams')}>Add</button>
            </div>
            <div className="empty-placeholder-block">
              <p>Talk about any competitive exam that you appeared for and the rank received</p>
            </div>
          </section>

          {/* SECTION: Employment */}
          <section className="dashboard-section-card" id="employment">
            <div className="section-card-header">
              <h3>Employment</h3>
              <button className="action-trigger-btn add" onClick={() => setActiveFormSection('employment')}>Add</button>
            </div>
            {resumeData.employment.map((emp) => (
              <div key={emp.id} className="employment-row-card">
                <div className="emp-icon-avatar">🏢</div>
                <div className="emp-main-details">
                  <div className="emp-headline-row">
                    <h4>{emp.company}</h4>
                    <span className="edit-node-pencil" onClick={() => setActiveFormSection('employment')}>✏️</span>
                  </div>
                  <span className="duration-pill">{emp.duration}</span>
                  <p className="experience-alert-warning">⚠️ My total work experience is 2 years 2 months</p>
                </div>
              </div>
            ))}
          </section>

          {/* SECTION: Academic Achievements */}
          <section className="dashboard-section-card" id="academic-achievements">
            <div className="section-card-header">
              <h3>Academic achievements</h3>
            </div>
            <div className="academic-achievements-list">
              {resumeData.academicAchievements.map((ach) => (
                <div key={ach.id} className="achievement-row-node">
                  <div className="ach-header-row">
                    <h5>{ach.phase}</h5>
                    <span className="edit-node-pencil" onClick={() => setActiveFormSection('academic')}>✏️</span>
                  </div>
                  <p className="ach-body-desc">{ach.details}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION: Resume Upload Box */}
          <section className="dashboard-section-card" id="resume">
            <div className="section-card-header">
              <h3>Resume</h3>
            </div>
            <p className="resume-tip-caption">Your resume is the first impression you make on potential employers. Craft it carefully to secure your desired job or internship.</p>
            
            {resumeData.resumeFile ? (
              <div className="uploaded-resume-vault-card">
                <div className="file-icon-badge">📄</div>
                <div className="file-metadata-info">
                  <span className="filename-label">{resumeData.resumeFile.name}</span>
                  <span className="upload-timestamp">Uploaded on {resumeData.resumeFile.uploadedAt}</span>
                </div>
                <div className="vault-actions">
                  <button className="vault-download-btn" title="Download">📥</button>
                  <button className="vault-delete-btn" title="Delete" onClick={() => setResumeData(p => ({...p, resumeFile: null}))}>🗑️</button>
                </div>
              </div>
            ) : null}

            <div className="dashed-drag-drop-zone">
              <button className="trigger-upload-system-btn">Update resume</button>
              <span className="file-constraints-label">Supported formats: doc, docx, rtf, pdf, up to 2MB</span>
            </div>
          </section>

        </main>

        {/* Floating Quick Links Sidebar Nav Component */}
        <aside className="dashboard-sidebar-navigation">
          <div className="sidebar-sticky-panel">
            <h4 className="sidebar-title">Quick links</h4>
            <nav className="vertical-anchor-nav">
              <a href="#preference" className="anchor-link">Preference</a>
              <a href="#education" className="anchor-link">Education</a>
              <a href="#key-skills" className="anchor-link">Key skills</a>
              <a href="#languages" className="anchor-link">Languages</a>
              <a href="#internships" className="anchor-link">Internships</a>
              <a href="#projects" className="anchor-link">Projects</a>
              <a href="#profile-summary" className="anchor-link">Profile summary</a>
              <a href="#accomplishments" className="anchor-link">Accomplishments</a>
              <a href="#competitive-exams" className="anchor-link">Competitive exams</a>
              <a href="#employment" className="anchor-link">Employment</a>
              <a href="#academic-achievements" className="anchor-link">Academic achievements</a>
              <a href="#resume" className="anchor-link">Resume</a>
            </nav>
          </div>
        </aside>

      </div>

      {/* Global Form Controller Actions Footer Panel */}
      <div className="floating-sticky-save-bar">
        <p>Changes will apply live to application records.</p>
        <button className="app-main-save-btn" onClick={saveProfile} disabled={saving}>
          {saving ? 'Processing updates...' : 'Save Profile Changes'}
        </button>
      </div>
    </div>
  );
}