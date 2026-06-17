import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentProfile, updateStudentProfile } from '../services/api';
import { toast } from 'react-toastify';
import './UserProfile.css';

export default function UserProfile() {
  const navigate = useNavigate();
  
  // Loading & UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isSkillsTestOpen, setIsSkillsTestOpen] = useState(false);
  
  // Dynamic Profile States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [workStatus, setWorkStatus] = useState('Student');
  
  // Skills Test States
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);

  // Form Fields for Editing
  const [form, setForm] = useState({
    name: '',
    mobileNumber: '',
    branch: '',
    year: '',
    skills: '',
    resumeUrl: '',
    workStatus: 'Student'
  });
  const [errors, setErrors] = useState({});

  // FAQ accordion open states
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      const data = await getStudentProfile();
      if (data) {
        const u = data.user || {};
        const p = data.profile || {};
        
        setName(u.name || '');
        setEmail(u.email || '');
        setMobileNumber(u.mobile_number || '');
        setWorkStatus(u.work_status || 'Student');
        
        setBranch(p.branch || '');
        setYear(p.year ? String(p.year) : '');
        setSkills(p.skills || '');
        setResumeUrl(p.resume_url || '');
        
        // Setup editing form prefill
        setForm({
          name: u.name || '',
          mobileNumber: u.mobile_number || '',
          branch: p.branch || '',
          year: p.year ? String(p.year) : '',
          skills: p.skills || '',
          resumeUrl: p.resume_url || '',
          workStatus: u.work_status || 'Student'
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  // Profile completion calculation
  const calculateCompletion = () => {
    let score = 0;
    if (name.trim()) score += 15;
    if (email.trim()) score += 10;
    if (mobileNumber.trim()) score += 15;
    if (branch.trim()) score += 15;
    if (year.trim()) score += 15;
    if (skills.trim()) score += 15;
    if (resumeUrl.trim()) score += 15;
    return score;
  };

  const completionPercent = calculateCompletion();

  // Validate fields in real-time
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Too short (min 2 chars)';
        return '';
      case 'mobileNumber':
        if (!value.trim()) return 'Phone number is required';
        if (!/^\d{10}$/.test(value.trim())) return 'Must be exactly 10 digits';
        return '';
      case 'year':
        if (!value.trim()) return 'Graduation year is required';
        if (!/^\d{4}$/.test(value.trim())) return 'Must be a 4-digit year (e.g. 2026)';
        const yearInt = parseInt(value);
        if (yearInt < 2000 || yearInt > 2035) return 'Year must be between 2000 and 2035';
        return '';
      case 'branch':
        if (!value.trim()) return 'Branch/Location is required';
        return '';
      case 'skills':
        if (!value.trim()) return 'Skills are required (comma separated)';
        return '';
      case 'resumeUrl':
        if (value.trim() && !/^(https?:\/\/)?([\w\d-]+\.)+[\w-]+(\/[\w\d-./?%&=]*)?$/i.test(value.trim())) {
          return 'Please enter a valid URL (e.g. drive.google.com/...)';
        }
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.warning('Please fix validation errors first.');
      return;
    }

    setSaving(true);
    try {
      await updateStudentProfile({
        name: form.name.trim(),
        mobile_number: form.mobileNumber.trim(),
        branch: form.branch.trim(),
        year: parseInt(form.year),
        skills: form.skills.trim(),
        resume_url: form.resumeUrl.trim(),
        work_status: form.workStatus
      });

      toast.success('Profile updated successfully!');
      setIsEditModalOpen(false);
      fetchProfileDetails();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  // Mock stats based on name length for realism
  const searchAppearancesCount = name ? 30 + (name.length * 2) : 34;
  const recruiterActionsCount = name ? Math.max(1, Math.floor(name.length / 3)) : 5;

  // Circular Progress Ring Configuration
  const radius = 36;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  // FAQ Data List
  const faqs = [
    {
      q: "How do I apply for listed jobs or internships?",
      a: "Go to the Internships or Jobs tab, select an opening, review the criteria, and click 'Apply now'. You can submit with your portal interactive resume or upload a custom PDF."
    },
    {
      q: "How can I check the status of my applications?",
      a: "Click on 'My Applications' from the profile dropdown menu. You will see a dashboard with status indicators like Applied, Shortlisted, Selected, or Rejected."
    },
    {
      q: "How does direct recruiter chat work?",
      a: "Recruiter chat is a premium PRO feature that allows you to directly message HR managers inside applied campaigns. You can unlock it by clicking 'Boost Visibility'."
    },
    {
      q: "What is the completion gauge and how do I increase it?",
      a: "The circular percentage ring displays how complete your profile is. Fill in your location, mobile number, branch, skills, and add a link to your resume to reach 100% completion."
    }
  ];

  // Skills test questions
  const skillsQuestions = [
    {
      q: "Which keyword is used to define a constant variable in ES6 JavaScript?",
      a: ["var", "let", "const", "constant"],
      correct: 2
    },
    {
      q: "Which React Hook is used to handle side-effects like data fetching?",
      a: ["useState", "useEffect", "useContext", "useReducer"],
      correct: 1
    },
    {
      q: "What does HTML stand for?",
      a: [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Hyper Transfer Model Link",
        "Hyperlink Text Management Layout"
      ],
      correct: 0
    }
  ];

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === skillsQuestions[currentQuestion].correct) {
      setScore(prev => prev + 1);
    }
    
    if (currentQuestion + 1 < skillsQuestions.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setTestCompleted(true);
    }
  };

  const resetSkillsTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setTestCompleted(false);
    setIsSkillsTestOpen(false);
  };

  if (loading) {
    return (
      <div className="resume-loading-container" style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="resume-spinner"></div>
        <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Loading profile stats...</p>
      </div>
    );
  }

  // Get user headline dynamically
  const getHeadline = () => {
    if (workStatus === 'Experienced') {
      return branch ? `${branch} Professional` : 'Experienced Professional';
    }
    if (workStatus === 'Fresher') {
      return branch ? `${branch} Graduate` : 'Graduate Fresher';
    }
    return branch ? `${branch} Student` : 'Student at Career Portal';
  };

  return (
    <div className="user-profile-page">
      <div className="profile-dashboard-wrapper">
        
        {/* Main Card */}
        <div className="profile-main-card">
          <button className="card-close-btn" onClick={() => navigate('/')}>×</button>
          
          {/* Identity Block */}
          <div className="profile-identity-section">
            <div className="avatar-container">
              <svg className="progress-ring" width="90" height="90">
                <circle
                  className="progress-ring-circle-bg"
                  stroke="#f1f5f9"
                  strokeWidth={stroke}
                  fill="transparent"
                  r={normalizedRadius}
                  cx={45}
                  cy={45}
                />
                <circle
                  className="progress-ring-circle"
                  stroke="#22c55e"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={45}
                  cy={45}
                />
              </svg>
              <div className="avatar-image-wrapper">
                <span className="avatar-fallback">👤</span>
              </div>
              <div className="profile-completion-badge">
                {completionPercent}%
              </div>
            </div>

            <div className="identity-details">
              <h2 className="identity-name">{name || 'Add Name'}</h2>
              <span className="identity-headline">{getHeadline()}</span>
              <a className="identity-action-link" onClick={() => navigate('/profile/edit')}>
                View & Update Profile →
              </a>
            </div>
          </div>

          <hr className="profile-section-divider" />

          {/* Performance Area */}
          <div className="performance-header">
            <h3 className="performance-title">Your profile performance</h3>
            <span className="performance-timeframe">Last 90 days</span>
          </div>

          <div className="performance-grid">
            <div className="performance-card">
              <div className="performance-stat">
                {searchAppearancesCount}
                <span className="stat-dot"></span>
              </div>
              <span className="performance-label">Search Appearances</span>
              <span className="performance-link" onClick={() => toast.info('We track each time recruiters search matching your skills.')}>View all</span>
            </div>

            <div className="performance-card">
              <div className="performance-stat">
                {recruiterActionsCount}
                <span className="stat-dot"></span>
              </div>
              <span className="performance-label">Recruiter Actions</span>
              <span className="performance-link" onClick={() => navigate('/applications')}>View all</span>
            </div>
          </div>

          {/* Menu Lists */}
          <div className="profile-menu-list">
            <div className="profile-menu-item" onClick={() => navigate('/applications')}>
              <span className="menu-item-icon">📋</span>
              <span>Career guidance</span>
            </div>

            <div className="profile-menu-item" onClick={() => navigate('/edit-preferences')}>
              <span className="menu-item-icon">⚙️</span>
              <span>Settings</span>
            </div>

            <div className="profile-menu-item" onClick={() => setIsFaqOpen(!isFaqOpen)}>
              <span className="menu-item-icon">❓</span>
              <span>FAQs</span>
            </div>

            {isFaqOpen && (
              <div className="faq-list">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="faq-item">
                    <button className="faq-question-btn" onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}>
                      <span>{faq.q}</span>
                      <span>{openFaqIndex === idx ? '▲' : '▼'}</span>
                    </button>
                    {openFaqIndex === idx && (
                      <div className="faq-answer">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="profile-menu-item logout" onClick={handleLogout}>
              <span className="menu-item-icon">➡️</span>
              <span>Logout</span>
            </div>
          </div>

        </div>

        {/* Promo Grid Below Main Card */}
        <div className="promo-cards-grid">
          <div className="promo-card green" onClick={() => setIsProModalOpen(true)}>
            <div className="promo-icon-circle">🚀</div>
            <h4 className="promo-title">Boost Visibility</h4>
            <p className="promo-desc">Promote your profile to top agencies</p>
          </div>

          <div className="promo-card blue" onClick={() => navigate('/edit-resume')}>
            <div className="promo-icon-circle">📝</div>
            <h4 className="promo-title">Edit Resume</h4>
            <p className="promo-desc">Update your skills and experiences</p>
          </div>

          <div className="promo-card white" onClick={() => setIsSkillsTestOpen(true)}>
            <div className="promo-icon-circle">⭐</div>
            <h4 className="promo-title">Skills Test</h4>
            <p className="promo-desc">Get verified for expert-level roles</p>
          </div>
        </div>

      </div>

      {/* --- Overlay Modal: Edit Profile Form --- */}
      {isEditModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Account Details</h2>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleProfileSave} className="modal-scroll-content">
              <div className="modal-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    className={`form-input ${errors.name ? 'invalid' : ''}`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Read-only)</label>
                  <input
                    value={email}
                    disabled
                    className="form-input"
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      name="mobileNumber"
                      value={form.mobileNumber}
                      onChange={handleInputChange}
                      className={`form-input ${errors.mobileNumber ? 'invalid' : ''}`}
                      placeholder="e.g. 9876543210"
                    />
                    {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Work Status</label>
                    <select
                      name="workStatus"
                      value={form.workStatus}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="Student">Student</option>
                      <option value="Fresher">Fresher / Graduate</option>
                      <option value="Experienced">Experienced Professional</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label className="form-label">Branch / Stream</label>
                    <input
                      name="branch"
                      value={form.branch}
                      onChange={handleInputChange}
                      className={`form-input ${errors.branch ? 'invalid' : ''}`}
                      placeholder="e.g. Computer Science"
                    />
                    {errors.branch && <span className="error-text">{errors.branch}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Graduation Year</label>
                    <input
                      name="year"
                      value={form.year}
                      onChange={handleInputChange}
                      className={`form-input ${errors.year ? 'invalid' : ''}`}
                      placeholder="e.g. 2026"
                    />
                    {errors.year && <span className="error-text">{errors.year}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills (Comma-separated)</label>
                  <input
                    name="skills"
                    value={form.skills}
                    onChange={handleInputChange}
                    className={`form-input ${errors.skills ? 'invalid' : ''}`}
                    placeholder="e.g. React, Node.js, Python, CSS"
                  />
                  {errors.skills && <span className="error-text">{errors.skills}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Resume Link / URL</label>
                  <input
                    name="resumeUrl"
                    value={form.resumeUrl}
                    onChange={handleInputChange}
                    className={`form-input ${errors.resumeUrl ? 'invalid' : ''}`}
                    placeholder="e.g. https://drive.google.com/your-resume"
                  />
                  {errors.resumeUrl && <span className="error-text">{errors.resumeUrl}</span>}
                </div>
              </div>
            </form>

            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button 
                type="submit" 
                onClick={handleProfileSave}
                className="btn-modal-save" 
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Overlay Modal: Pro Upgrade --- */}
      {isProModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setIsProModalOpen(false)}>
          <div className="profile-modal-card pro-feature-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: '#ffffff' }}>
              <h2 style={{ color: '#ffffff' }}>✦ Unlock Premium Status ✦</h2>
              <button className="modal-close-btn" style={{ color: '#ffffff' }} onClick={() => setIsProModalOpen(false)}>×</button>
            </div>
            <div className="modal-scroll-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>🚀</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Direct Recruiter Messaging</strong>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>Chat with hiring recruiters inside applied opportunity loops.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>📈</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>200% Visibility Boost</strong>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>Put your profile at the top of recruiter searches automatically.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>📄</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Expert Portfolio Assessment</strong>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>Get professional feedback on your ATS-friendly resume templates.</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setIsProModalOpen(false)}>
                Close
              </button>
              <button 
                type="button" 
                className="btn-modal-save" 
                style={{ backgroundColor: '#22c55e' }}
                onClick={() => {
                  toast.success('Successfully upgraded to Premium PRO!');
                  setIsProModalOpen(false);
                }}
              >
                Buy PRO for $9.99
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Overlay Modal: Interactive Skills Test --- */}
      {isSkillsTestOpen && (
        <div className="profile-modal-overlay" onClick={resetSkillsTest}>
          <div className="profile-modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Quick Skills Verification</h2>
              <button className="modal-close-btn" onClick={resetSkillsTest}>×</button>
            </div>

            <div className="modal-scroll-content">
              {!testCompleted ? (
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', fontWeight: 600 }}>
                    Question {currentQuestion + 1} of {skillsQuestions.length}
                  </p>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                    {skillsQuestions[currentQuestion].q}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {skillsQuestions[currentQuestion].a.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        style={{
                          textAlign: 'left',
                          padding: '0.85rem 1rem',
                          borderRadius: '8px',
                          border: selectedAnswer === idx ? '2px solid #22c55e' : '1px solid #e2e8f0',
                          backgroundColor: selectedAnswer === idx ? '#f0fdf4' : '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          color: '#334155',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#0f172a', marginBottom: '0.5rem' }}>
                    Skills Test Complete!
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                    You scored <strong>{score} out of {skillsQuestions.length}</strong>.
                  </p>
                  {score === skillsQuestions.length ? (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '8px', color: '#166534', fontWeight: 600, fontSize: '0.85rem' }}>
                      ✓ Perfect score! Your profile has received a verification tick for recruiters.
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>
                      Try again to get a perfect score and verification badge!
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={resetSkillsTest}>
                {testCompleted ? 'Close' : 'Cancel'}
              </button>
              {!testCompleted ? (
                <button
                  className="btn-modal-save"
                  disabled={selectedAnswer === null}
                  onClick={handleNextQuestion}
                >
                  {currentQuestion + 1 === skillsQuestions.length ? 'Finish' : 'Next Question →'}
                </button>
              ) : (
                score < skillsQuestions.length && (
                  <button
                    className="btn-modal-save"
                    onClick={() => {
                      setCurrentQuestion(0);
                      setSelectedAnswer(null);
                      setScore(0);
                      setTestCompleted(false);
                    }}
                  >
                    Retry Test
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
