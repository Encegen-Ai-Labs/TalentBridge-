import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getStudentProfile, updateStudentProfile, getPreferences, updatePreferences } from '../services/api';
import './ProfileEditor.css';

// ─── Completion weights ────────────────────────────────────
const WEIGHTS = {
  name: 5, phone: 3, email: 3, degree: 3, college: 3,
  location: 2, gender: 2, dob: 2,
  prefJobType: 4, prefLocation: 4,
  skills: 8, languages: 5, summary: 8,
  education: 8, internships: 8, projects: 6,
  employment: 6, certifications: 4, awards: 3,
  competitiveExams: 4, academicAchievements: 4, resume: 8,
};
const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

function calcCompletion(p) {
  const check = {
    name: !!p.name?.trim(),
    phone: !!p.phone?.trim(),
    email: !!p.email?.trim(),
    degree: !!p.degree?.trim(),
    college: !!p.college?.trim(),
    location: !!p.location?.trim(),
    gender: !!p.gender,
    dob: !!p.dob,
    prefJobType: !!p.prefJobType?.trim(),
    prefLocation: !!p.prefLocation?.trim(),
    skills: p.skills?.length > 0,
    languages: p.languages?.length > 0,
    summary: !!p.summary?.trim(),
    education: p.education?.length > 0,
    internships: p.internships?.length > 0,
    projects: p.projects?.length > 0,
    employment: p.employment?.length > 0,
    certifications: p.certifications?.length > 0,
    awards: p.awards?.length > 0,
    competitiveExams: p.competitiveExams?.length > 0,
    academicAchievements: p.academicAchievements?.length > 0,
    resume: !!p.resume?.fileName,
  };
  const earned = Object.entries(WEIGHTS).reduce((s, [k, w]) => s + (check[k] ? w : 0), 0);
  return Math.round((earned / TOTAL_WEIGHT) * 100);
}

function getMissingTips(p) {
  const tips = [];
  if (!p.phone?.trim()) tips.push({ label: 'Add mobile number', delta: 3 });
  if (!p.internships?.length) tips.push({ label: 'Add Internship', delta: 8 });
  if (!p.competitiveExams?.length) tips.push({ label: 'Add competitive exam', delta: 4 });
  if (!p.projects?.length) tips.push({ label: 'Add a project', delta: 6 });
  if (!p.certifications?.length) tips.push({ label: 'Add Certification', delta: 4 });
  if (!p.summary?.trim()) tips.push({ label: 'Add profile summary', delta: 8 });
  if (!p.employment?.length) tips.push({ label: 'Add work experience', delta: 6 });
  return tips.slice(0, 3);
}

// ─── SVG Progress Ring ─────────────────────────────────────
function ProgressRing({ pct }) {
  const r = 34, circ = 2 * Math.PI * r;
  const color = pct < 40 ? '#ef4444' : pct < 70 ? '#f97316' : '#16a34a';
  return (
    <div className="pe-ring">
      <svg width="84" height="84" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="42" cy="42" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          style={{ strokeDasharray: circ, strokeDashoffset: circ * (1 - pct / 100), transition: 'stroke-dashoffset .5s ease' }}
        />
      </svg>
      <div className="pe-ring-label">
        <span className="pe-ring-pct">{pct}%</span>
        <span className="pe-ring-sub">Profile</span>
      </div>
    </div>
  );
}

const EMPTY = {
  name: '', email: '', phone: '', degree: '', college: '',
  location: '', gender: '', dob: '', summary: '',
  skills: [], languages: [], education: [],
  internships: [], projects: [], employment: [],
  certifications: [], awards: [], competitiveExams: [],
  academicAchievements: [], resume: null,
  prefJobType: '', prefLocation: '', availability: '',
};

export default function ProfileEditor() {
  const fileRef = useRef(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(EMPTY);
  const [activeLink, setActiveLink] = useState('preference');
  
  const [newSkill, setNewSkill] = useState('');
  const [newInternship, setNewInternship] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newAward, setNewAward] = useState('');
  const [newCompetitiveExam, setNewCompetitiveExam] = useState('');

  // ── Fetch on mount ────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setPageLoading(false); return; }

    Promise.all([
      getStudentProfile().catch(() => null),
      getPreferences().catch(() => null),
    ]).then(([profileRes, prefsRes]) => {
      if (profileRes) {
        const { user, profile: sp } = profileRes;
        const rd = sp?.resume_data || {};

        setProfile({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.mobile_number || '',
          degree: sp?.branch || rd.degree || 'B.Sc',
          college: rd.college || '',
          location: rd.location || '',
          gender: rd.gender || 'Male',
          dob: rd.dob || '',
          summary: rd.summary || '',
          skills: rd.skills || (sp?.skills ? sp.skills.split(',').map(s => s.trim()).filter(Boolean) : []),
          languages: rd.languages || [],
          education: rd.education || [],
          internships: rd.internships || [],
          projects: rd.projects || [],
          employment: rd.employment || [],
          certifications: rd.certifications || [],
          awards: rd.awards || [],
          competitiveExams: rd.competitiveExams || [],
          academicAchievements: rd.academicAchievements || [],
          resume: rd.resume || (sp?.resume_url ? { fileName: sp.resume_url, uploadedDate: '' } : null),
          prefJobType: prefsRes?.prefJobType || rd.prefJobType || 'Jobs, Internships',
          prefLocation: prefsRes?.prefLocation || rd.prefLocation || '',
          availability: prefsRes?.availability || rd.availability || 'Immediate joiner',
        });
      }
    }).finally(() => setPageLoading(false));
  }, []);

  // ── Active section scroll tracking ───────────────────────
  useEffect(() => {
    const onScroll = () => {
      const sections = ['preference', 'education', 'key-skills', 'languages', 'interests', 'projects', 'profile-summary', 'accomplishments', 'competitive-exams', 'employment', 'academic-achievements', 'resume'];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) {
          setActiveLink(id); break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const completionRate = useMemo(() => calcCompletion(profile), [profile]);
  const missingTips = useMemo(() => getMissingTips(profile), [profile]);

  // ── Direct State Updates ───────────────────────────────────
  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedArrayChange = (field, id, subField, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].map(item => item.id === id ? { ...item, [subField]: value } : item)
    }));
  };

  const addArrayItem = (field, defaultObj) => {
    const newItem = { id: Math.random().toString(36).slice(2, 9), ...defaultObj };
    setProfile(prev => ({ ...prev, [field]: [...prev[field], newItem] }));
  };

  const removeArrayItem = (field, id) => {
    setProfile(prev => ({ ...prev, [field]: prev[field].filter(item => item.id !== id) }));
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      if (!profile.skills.includes(newSkill.trim())) {
        setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      }
      setNewSkill('');
    }
  };

  const handleAddInternship = (e) => {
    if (e.key === 'Enter' && newInternship.trim()) {
      addArrayItem('internships', { 
        company: newInternship.trim(), 
        role: '', 
        duration: '', 
        description: '' 
      });
      setNewInternship('');
    }
  };

  const handleAddProject = (e) => {
    if (e.key === 'Enter' && newProject.trim()) {
      addArrayItem('projects', { 
        title: newProject.trim(), 
        description: '', 
        technologies: '', 
        link: '' 
      });
      setNewProject('');
    }
  };

  const handleAddCertification = (e) => {
    if (e.key === 'Enter' && newCertification.trim()) {
      addArrayItem('certifications', { 
        name: newCertification.trim(), 
        issuer: '', 
        year: '' 
      });
      setNewCertification('');
    }
  };

  const handleAddAward = (e) => {
    if (e.key === 'Enter' && newAward.trim()) {
      addArrayItem('awards', { 
        name: newAward.trim(), 
        issuer: '', 
        year: '' 
      });
      setNewAward('');
    }
  };

  const handleAddCompetitiveExam = (e) => {
    if (e.key === 'Enter' && newCompetitiveExam.trim()) {
      addArrayItem('competitiveExams', { 
        name: newCompetitiveExam.trim(), 
        score: '', 
        year: '' 
      });
      setNewCompetitiveExam('');
    }
  };

  // ── Save to Backend Trigger ────────────────────────────────
  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Please login to save your profile'); return; }
    setSaving(true);
    try {
      const resume_data = { ...profile };
      await Promise.all([
        updateStudentProfile({
          name: profile.name,
          mobile_number: profile.phone,
          skills: profile.skills.join(', '),
          branch: profile.degree,
          resume_data,
          work_status: null,
        }),
        profile.prefJobType
          ? updatePreferences({ 
              prefJobType: profile.prefJobType, 
              prefLocation: profile.prefLocation, 
              availability: profile.availability 
            })
          : Promise.resolve(),
      ]);
      toast.success('Profile synced with backend successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Max file size 2MB'); return; }
    handleChange('resume', { fileName: file.name, uploadedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) });
    toast.info('Resume selected. Remember to click "Save Changes"');
    e.target.value = '';
  };

  if (pageLoading) return <div className="pe-fullpage-loader"><div className="pe-spinner-lg" /><p>Loading profile...</p></div>;

  return (
    <div className="pe-wrap">
      <nav className="pe-tabs">
        <button className="pe-tab active">← View &amp; Edit</button>
        <button className="pe-tab">Activity insights</button>
      </nav>

      <div className="pe-body">
        {/* LEFT SIDEBAR LINKS */}
        <aside className="pe-sidebar">
          <div className="pe-sidebar-inner">
            <div className="pe-comp-card">
              <div className="pe-comp-top">
                <ProgressRing pct={completionRate} />
                <div className="pe-comp-info">
                  <div className="pe-comp-title">Profile Strength</div>
                  <div className="pe-comp-status" style={{ color: completionRate < 40 ? '#ef4444' : completionRate < 70 ? '#f97316' : '#16a34a' }}>
                    {completionRate}% complete
                  </div>
                </div>
              </div>
            </div>

            <div className="pe-quicklinks">
              <h4 className="pe-ql-title">Quick links</h4>
              <nav className="pe-ql-nav">
                {[
                  { id: 'preference', label: 'Preferences' },
                  { id: 'education', label: 'Education' },
                  { id: 'key-skills', label: 'Key skills' },
                  { id: 'languages', label: 'Languages' },
                  { id: 'interests', label: 'Interests' },
                  { id: 'projects', label: 'Projects' },
                  { id: 'profile-summary', label: 'Profile summary' },
                  { id: 'accomplishments', label: 'Accomplishments' },
                  { id: 'competitive-exams', label: 'Competitive exams' },
                  { id: 'employment', label: 'Employment' },
                  { id: 'academic-achievements', label: 'Academic achievements' },
                  { id: 'resume', label: 'Resume' }
                ].map(({ id, label }) => (
                  <a key={id} href={`#${id}`} className={`pe-ql-link ${activeLink === id ? 'active' : ''}`}>
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* MAIN FORM PANEL */}
        <main className="pe-main">
          {/* PROFILE IDENTITY AREA */}
          <section className="pe-hero">
            <div className="pe-hero-grid">
              <div className="pe-hero-left">
                <ProgressRing pct={completionRate} />
                <div className="pe-identity">
                  <div className="pe-name-row">
                    <input 
                      type="text" 
                      className="pe-inline-input name-bold" 
                      value={profile.name} 
                      placeholder="Your Name"
                      onChange={e => handleChange('name', e.target.value)}
                    />
                    <span className="pe-degree-tag">{profile.degree}</span>
                  </div>
                  
                  <input 
                    type="text" 
                    className="pe-inline-input sub-bold" 
                    value={profile.college} 
                    placeholder="Add college / university name"
                    onChange={e => handleChange('college', e.target.value)}
                  />

                  <div className="pe-meta">
                    <span>📍 <input type="text" className="pe-inline-input dynamic-width" value={profile.location} placeholder="Location" onChange={e => handleChange('location', e.target.value)} /></span>
                    <span>👤 
                      <select className="pe-inline-select dynamic-width" value={profile.gender} onChange={e => handleChange('gender', e.target.value)}>
                        {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </span>
                    <span>📅 <input type="date" className="pe-inline-input dynamic-width" value={profile.dob} onChange={e => handleChange('dob', e.target.value)} /></span>
                  </div>

                  <div className="pe-stats-row">
                    <span className="pe-stat-item">0 <span className="pe-stat-label">Followers</span></span>
                    <span className="pe-stat-item">0 <span className="pe-stat-label">Following</span></span>
                    <span className="pe-stat-item">0 <span className="pe-stat-label">Saved</span></span>
                  </div>
                </div>
              </div>

              <div className="pe-hero-right">
                <div className="pe-contact-row">
                  <span className="pe-contact-icon">📞</span>
                  <input type="text" className="pe-inline-input phone-field" value={profile.phone} placeholder="Add phone" onChange={e => handleChange('phone', e.target.value)} />
                  {profile.phone && <span className="pe-verify-badge">Verify</span>}
                </div>
                <div className="pe-contact-row">
                  <span className="pe-contact-icon">✉️</span>
                  <input type="email" className="pe-inline-input email-field" value={profile.email} placeholder="Add email" onChange={e => handleChange('email', e.target.value)} />
                  {profile.email && <span className="pe-verified">✅</span>}
                </div>
              </div>
            </div>

            {missingTips.length > 0 && (
              <div className="pe-tips-banner">
                {missingTips.map((t, i) => (
                  <span key={i} className="pe-tip-item">{t.label} <strong className="pe-delta">↑ {t.delta}%</strong></span>
                ))}
              </div>
            )}
          </section>

          {/* CAREER PREFERENCES */}
          <section className="pe-card" id="preference">
            <div className="pe-card-hd"><h3>Your career preferences</h3></div>
            <div className="pe-pref-grid">
              <div className="pe-pref-cell">
                <span className="pe-pref-lbl">PREFERRED JOB TYPE</span>
                <select className="pe-inline-select value-bold" value={profile.prefJobType} onChange={e => handleChange('prefJobType', e.target.value)}>
                  {['Jobs', 'Internships', 'Jobs, Internships'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="pe-pref-cell">
                <span className="pe-pref-lbl">AVAILABILITY TO WORK</span>
                <select className="pe-inline-select value-bold green" value={profile.availability} onChange={e => handleChange('availability', e.target.value)}>
                  {['Immediate joiner', '15 days', '30 days', '60+ days'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="pe-pref-cell full">
                <span className="pe-pref-lbl">PREFERRED LOCATION</span>
                <input type="text" className="pe-inline-input" value={profile.prefLocation} placeholder="Add locations..." onChange={e => handleChange('prefLocation', e.target.value)} />
              </div>
            </div>
          </section>

          {/* EDUCATION */}
          <section className="pe-card" id="education">
            <div className="pe-card-hd">
              <h3>Education</h3>
              <button className="pe-add-btn" onClick={() => addArrayItem('education', { institution: '', type: 'Graduation', stream: 'Science', marks: '', year: '' })}>Add</button>
            </div>
            {profile.education.map(edu => (
              <div key={edu.id} className="pe-timeline-row">
                <div className="pe-tl-dot" />
                <div className="pe-tl-body">
                  <div className="pe-item-hd">
                    <input type="text" className="pe-inline-input bold-item-title" value={edu.institution} placeholder="Institution / University Name" onChange={e => handleNestedArrayChange('education', edu.id, 'institution', e.target.value)} />
                    <button className="pe-del" onClick={() => removeArrayItem('education', edu.id)}>🗑️</button>
                  </div>
                  <div className="pe-sub-row">
                    <select className="pe-inline-select dynamic-sub" value={edu.stream} onChange={e => handleNestedArrayChange('education', edu.id, 'stream', e.target.value)}>
                      {['Science', 'Commerce', 'Arts', 'Engineering', 'Maharashtra Board', 'CBSE'].map(str => <option key={str} value={str}>{str}</option>)}
                    </select>
                    <span> · </span>
                    <input type="text" className="pe-inline-input inline-marks" value={edu.marks} placeholder="Marks / Percentage" onChange={e => handleNestedArrayChange('education', edu.id, 'marks', e.target.value)} />
                  </div>
                  <input type="text" className="pe-inline-input text-meta-small" value={edu.year} placeholder="Year (e.g., Passed out in 2024)" onChange={e => handleNestedArrayChange('education', edu.id, 'year', e.target.value)} />
                </div>
              </div>
            ))}
          </section>

          {/* KEY SKILLS */}
          <section className="pe-card" id="key-skills">
            <div className="pe-card-hd"><h3>Key skills</h3></div>
            <div className="pe-chips">
              {profile.skills.map((s, i) => (
                <span key={i} className="pe-chip grey">
                  {s} <button onClick={() => handleChange('skills', profile.skills.filter((_, j) => j !== i))}>×</button>
                </span>
              ))}
              <input 
                type="text" 
                className="pe-inline-input add-skill-placeholder" 
                placeholder="+ Type skill & hit Enter" 
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill}
              />
            </div>
          </section>

          {/* LANGUAGES */}
          <section className="pe-card" id="languages">
            <div className="pe-card-hd">
              <h3>Languages</h3>
              <button className="pe-add-btn" onClick={() => addArrayItem('languages', { name: '', capability: 'Can read and write' })}>Add</button>
            </div>
            <div className="pe-lang-grid">
              {profile.languages.map(l => (
                <div key={l.id} className="pe-lang-item">
                  <div className="pe-lang-top">
                    <input type="text" className="pe-inline-input bold-item-title" value={l.name} placeholder="Language" onChange={e => handleNestedArrayChange('languages', l.id, 'name', e.target.value)} />
                    <button className="pe-del" onClick={() => removeArrayItem('languages', l.id)}>🗑️</button>
                  </div>
                  <select className="pe-inline-select capability-dropdown" value={l.capability} onChange={e => handleNestedArrayChange('languages', l.id, 'capability', e.target.value)}>
                    {['Can read', 'Can read and write', 'Can speak, read and write'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </section>

          {/* INTERESTS / INTERNSHIPS */}
          <section className="pe-card" id="interests">
            <div className="pe-card-hd">
              <h3>Internships</h3>
            </div>
            <div className="pe-chips">
              {profile.internships.map((item, i) => (
                <span key={i} className="pe-chip grey">
                  {item.company} 
                  <button onClick={() => removeArrayItem('internships', item.id)}>×</button>
                </span>
              ))}
              <input 
                type="text" 
                className="pe-inline-input add-skill-placeholder" 
                placeholder="+ Add internship company..." 
                value={newInternship}
                onChange={e => setNewInternship(e.target.value)}
                onKeyDown={handleAddInternship}
              />
            </div>
            <p className="pe-hint-text">Find out the company you interested in, what projects you are interested in, what you are looking for to start</p>
          </section>

          {/* PROJECTS */}
          <section className="pe-card" id="projects">
            <div className="pe-card-hd">
              <h3>Projects</h3>
            </div>
            <div className="pe-chips">
              {profile.projects.map((item, i) => (
                <span key={i} className="pe-chip grey">
                  {item.title} 
                  <button onClick={() => removeArrayItem('projects', item.id)}>×</button>
                </span>
              ))}
              <input 
                type="text" 
                className="pe-inline-input add-skill-placeholder" 
                placeholder="+ Add project..." 
                value={newProject}
                onChange={e => setNewProject(e.target.value)}
                onKeyDown={handleAddProject}
              />
            </div>
          </section>

          {/* PROFILE SUMMARY */}
          <section className="pe-card" id="profile-summary">
            <div className="pe-card-hd"><h3>Profile summary</h3></div>
            <textarea 
              className="pe-inline-textarea" 
              value={profile.summary} 
              placeholder="Write an impactful overview of your skills..."
              onChange={e => handleChange('summary', e.target.value)}
            />
          </section>

          {/* ACCOMPLISHMENTS */}
          <section className="pe-card" id="accomplishments">
            <div className="pe-card-hd"><h3>Accomplishments</h3></div>
            
            {/* Certifications */}
            <div className="pe-sub-section">
              <div className="pe-sub-header">
                <h4>Certifications</h4>
                <button className="pe-add-btn" onClick={() => addArrayItem('certifications', { name: '', issuer: '', year: '' })}>Add</button>
              </div>
              <div className="pe-chips">
                {profile.certifications.map((item, i) => (
                  <span key={i} className="pe-chip grey">
                    {item.name} 
                    <button onClick={() => removeArrayItem('certifications', item.id)}>×</button>
                  </span>
                ))}
                <input 
                  type="text" 
                  className="pe-inline-input add-skill-placeholder" 
                  placeholder="+ Add certification..." 
                  value={newCertification}
                  onChange={e => setNewCertification(e.target.value)}
                  onKeyDown={handleAddCertification}
                />
              </div>
            </div>

            {/* Awards */}
            <div className="pe-sub-section">
              <div className="pe-sub-header">
                <h4>Awards</h4>
                <button className="pe-add-btn" onClick={() => addArrayItem('awards', { name: '', issuer: '', year: '' })}>Add</button>
              </div>
              <div className="pe-chips">
                {profile.awards.map((item, i) => (
                  <span key={i} className="pe-chip grey">
                    {item.name} 
                    <button onClick={() => removeArrayItem('awards', item.id)}>×</button>
                  </span>
                ))}
                <input 
                  type="text" 
                  className="pe-inline-input add-skill-placeholder" 
                  placeholder="+ Add award..." 
                  value={newAward}
                  onChange={e => setNewAward(e.target.value)}
                  onKeyDown={handleAddAward}
                />
              </div>
            </div>

            {/* Club & Competitions */}
            <div className="pe-sub-section">
              <div className="pe-sub-header">
                <h4>Club &amp; Competitions</h4>
                <button className="pe-add-btn" onClick={() => addArrayItem('competitiveExams', { name: '', score: '', year: '' })}>Add</button>
              </div>
              <div className="pe-chips">
                {profile.competitiveExams.map((item, i) => (
                  <span key={i} className="pe-chip grey">
                    {item.name} 
                    <button onClick={() => removeArrayItem('competitiveExams', item.id)}>×</button>
                  </span>
                ))}
                <input 
                  type="text" 
                  className="pe-inline-input add-skill-placeholder" 
                  placeholder="+ Add competition..." 
                  value={newCompetitiveExam}
                  onChange={e => setNewCompetitiveExam(e.target.value)}
                  onKeyDown={handleAddCompetitiveExam}
                />
              </div>
            </div>
          </section>

          {/* COMPETITIVE EXAMS */}
          <section className="pe-card" id="competitive-exams">
            <div className="pe-card-hd"><h3>Competitive exams</h3></div>
            <p className="pe-hint-text">Find out the competitive exams that you are interested in</p>
            <div className="pe-chips">
              {profile.competitiveExams.map((item, i) => (
                <span key={i} className="pe-chip grey">
                  {item.name} {item.score && `(${item.score})`}
                  <button onClick={() => removeArrayItem('competitiveExams', item.id)}>×</button>
                </span>
              ))}
            </div>
          </section>

          {/* EMPLOYMENT */}
          <section className="pe-card" id="employment">
            <div className="pe-card-hd">
              <h3>Employment</h3>
              <button className="pe-add-btn" onClick={() => addArrayItem('employment', { company: '', duration: '', totalExp: '' })}>Add</button>
            </div>
            {profile.employment.map(emp => (
              <div key={emp.id} className="pe-emp-row">
                <div className="pe-emp-avatar">🏢</div>
                <div className="pe-emp-details">
                  <div className="pe-item-hd">
                    <input type="text" className="pe-inline-input bold-item-title" value={emp.company} placeholder="Company Name" onChange={e => handleNestedArrayChange('employment', emp.id, 'company', e.target.value)} />
                    <button className="pe-del" onClick={() => removeArrayItem('employment', emp.id)}>🗑️</button>
                  </div>
                  <input type="text" className="pe-inline-input duration-input" value={emp.duration} placeholder="Duration (e.g. Aug'23 to Aug'24)" onChange={e => handleNestedArrayChange('employment', emp.id, 'duration', e.target.value)} />
                  <p className="pe-warning-text">🚨 Total experience: <input type="text" className="pe-inline-input compact" value={emp.totalExp} placeholder="2 years" onChange={e => handleNestedArrayChange('employment', emp.id, 'totalExp', e.target.value)} /></p>
                </div>
              </div>
            ))}
          </section>

          {/* ACADEMIC ACHIEVEMENTS */}
          <section className="pe-card" id="academic-achievements">
            <div className="pe-card-hd">
              <h3>Academic achievements</h3>
              <button className="pe-add-btn" onClick={() => addArrayItem('academicAchievements', { title: '', desc: '' })}>Add</button>
            </div>
            {profile.academicAchievements.map(ach => (
              <div key={ach.id} className="pe-ach-row">
                <div className="pe-item-hd">
                  <input type="text" className="pe-inline-input bold-item-title" value={ach.title} placeholder="Title (e.g., During B.Sc)" onChange={e => handleNestedArrayChange('academicAchievements', ach.id, 'title', e.target.value)} />
                  <button className="pe-del" onClick={() => removeArrayItem('academicAchievements', ach.id)}>🗑️</button>
                </div>
                <input type="text" className="pe-inline-input full-desc" value={ach.desc} placeholder="Description of achievements..." onChange={e => handleNestedArrayChange('academicAchievements', ach.id, 'desc', e.target.value)} />
              </div>
            ))}
          </section>

          {/* RESUME MANAGEMENT */}
          <section className="pe-card" id="resume">
            <div className="pe-card-hd"><h3>Resume</h3></div>
            <p className="pe-resume-caption">Your resume is the first impression you make on potential employers.</p>
            {profile.resume && (
              <div className="pe-resume-box">
                <div>
                  <div className="pe-filename">{profile.resume.fileName}</div>
                  <div className="pe-date">Uploaded on {profile.resume.uploadedDate}</div>
                </div>
                <button className="pe-del-btn" onClick={() => handleChange('resume', null)}>🗑️</button>
              </div>
            )}
            <div className="pe-upload-zone" onClick={() => fileRef.current?.click()}>
              <button className="pe-upload-trigger">Update resume</button>
              <div className="pe-constraints">Supported formats: doc, docx, rtf, pdf up to 2MB</div>
              <input type="file" ref={fileRef} style={{ display: 'none' }} accept=".doc,.docx,.rtf,.pdf" onChange={handleResumeChange} />
            </div>
          </section>
        </main>
      </div>

      {/* FOOTER SAVE BAR */}
      <footer className="pe-footer-bar">
        <span>Updates apply instantly to local views. Sync with backend permanently before leaving.</span>
        <button className="pe-main-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Syncing..." : "Ask to edit"}
        </button>
      </footer>
    </div>
  );
}