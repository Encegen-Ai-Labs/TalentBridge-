import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { toast } from 'react-toastify';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [areasOfInterest, setAreasOfInterest] = useState([]);
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [careerGoal, setCareerGoal] = useState('');
  const [interestSearch, setInterestSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile_number: '',
    work_status: 'fresher',
    subscribe: false,
  });

  const [errors, setErrors] = useState({});

  // ================= VALIDATION =================

  const validateField = (name, value) => {
    let error = '';

    // ================= NAME =================
    if (name === 'name') {
      const trimmed = value.trim();

      if (!trimmed) {
        error = 'Full name is required';
      } else if (value.startsWith(' ')) {
        error = 'Starting spaces are not allowed';
      } else if (trimmed.length < 3) {
        error = 'Minimum 3 characters required';
      } else if (trimmed.length > 40) {
        error = 'Maximum 40 characters allowed';
      } else if (!/^[A-Za-z ]+$/.test(trimmed)) {
        error =
          'Numbers and special characters are not allowed';
      } else if (/\s{2,}/.test(trimmed)) {
        error = 'Multiple spaces are not allowed';
      }
    }

    // ================= EMAIL =================
    if (name === 'email') {
      const trimmed = value.trim();

      if (!trimmed) {
        error = 'Email is required';
      } else if (value.startsWith(' ')) {
        error = 'Starting spaces are not allowed';
      } else if (/\s/.test(value)) {
        error = 'Spaces are not allowed';
      } else if (/[A-Z]/.test(value)) {
        error = 'Capital letters are not allowed';
      } else if (/^\d/.test(value)) {
        error = 'Email cannot start with number';
      } else {
        const emailRegex =
          /^[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/;

        if (!emailRegex.test(trimmed)) {
          error = 'Invalid email format';
        }
      }
    }

    // ================= PASSWORD =================
    if (name === 'password') {
      if (!value.trim()) {
        error = 'Password is required';
      } else if (value.startsWith(' ')) {
        error = 'Starting spaces are not allowed';
      } else if (/\s/.test(value)) {
        error = 'Spaces are not allowed';
      } else if (value.length < 6) {
        error = 'Minimum 6 characters required';
      } else if (value.length > 16) {
        error = 'Maximum 16 characters allowed';
      } else if (!/(?=.*[A-Z])/.test(value)) {
        error =
          'At least one uppercase letter required';
      } else if (!/(?=.*[a-z])/.test(value)) {
        error =
          'At least one lowercase letter required';
      } else if (!/(?=.*\d)/.test(value)) {
        error =
          'At least one number required';
      } else if (
        !/(?=.*[!@#$%^&*])/.test(value)
      ) {
        error =
          'At least one special character required';
      }
    }

    // ================= MOBILE =================
    if (name === 'mobile_number') {
      if (!value) {
        error = 'Mobile number is required';
      } else if (!/^[6-9]/.test(value)) {
        error =
          'Mobile number must start from 6-9';
      } else if (!/^\d+$/.test(value)) {
        error = 'Only numbers are allowed';
      } else if (value.length < 10) {
        error = 'Mobile number must be 10 digits';
      } else if (value.length > 10) {
        error =
          'More than 10 digits are not allowed';
      }
    }

    return error;
  };

  // ================= HANDLE CHANGE =================



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // ===== MOBILE =====
    if (name === 'mobile_number') {
      const onlyDigits = value.replace(/\D/g, '');

      if (onlyDigits.length > 10) return;

      setFormData((prev) => ({
        ...prev,
        mobile_number: onlyDigits,
      }));

      // live validation
      const error = validateField(
        'mobile_number',
        onlyDigits
      );

      setErrors((prev) => ({
        ...prev,
        mobile_number: error,
      }));

      return;
    }

    // ===== NAME RESTRICTION =====
    if (name === 'name') {

      // block numbers & special chars
      if (/[^A-Za-z ]/.test(value)) return;
    }

    const updatedValue =
      type === 'checkbox'
        ? checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    // LIVE VALIDATION
    const error = validateField(
      name,
      updatedValue
    );

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };
  const handleBlur = (e) => {
    const { name, value } = e.target;

    const error = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    let newErrors = {};

    Object.keys(formData).forEach((field) => {
      if (field === 'subscribe') return;

      const error = validateField(
        field,
        formData[field]
      );

      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct errors on Step 1');
      return;
    }
    setStep(2);
  };

  // ================= REGISTER =================

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        mobile_number: formData.mobile_number,
        work_status: formData.work_status,
        preferences: {
          areasOfInterest,
          preferredLocations,
          careerGoal
        }
      });

      toast.success('Registration Successful!');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.log(err);
      const message = err.message?.toLowerCase() || '';

      if (message.includes('email')) {
        setStep(1);
        setErrors({
          email: 'Email already exists',
        });
      } else if (message.includes('mobile')) {
        setStep(1);
        setErrors({
          mobile_number:
            'Mobile number already registered',
        });
      } else {
        toast.error('Registration Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="register-card">

        {/* LEFT */}
        <div className="register-illustration-container">
          <div className="illustration-content-box">
            <div className="illustration-graphic">
              <img src="/Register.png" alt="Registration" />
            </div>

            <div className="features-list">
              <h3>On registering, you can</h3>

              <ul>
                <li>
                  <span className="check-icon">✓</span>
                  Build your profile and let recruiters find you
                </li>

                <li>
                  <span className="check-icon">✓</span>
                  Get job postings delivered right to your email
                </li>

                <li>
                  <span className="check-icon">✓</span>
                  Find a job and grow your career
                </li>
              </ul>
            </div>
          </div>

          <div className="resume-badge">
            AI Resume Analyzer
          </div>
        </div>

        {/* RIGHT */}
        <div className="register-form-container">
          {step === 1 ? (
            <>
              <h2 className="register-title">
                Create your profile
              </h2>

              <p className="register-subtitle">
                Search & apply to jobs from India's no.1 job site
              </p>

              <form onSubmit={handleNextStep}>

                {/* NAME */}
                <div className="form-group">
                  <label className="form-label">
                    Full name
                  </label>

                  <input
                    type="text"
                    name="name"
                    className={`form-input ${errors.name ? 'input-error' : ''
                      }`}
                    placeholder="What is your name?"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}

                  />

                  {errors.name && (
                    <p className="error-text">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div className="form-group">
                  <label className="form-label">
                    Email ID
                  </label>

                  <input
                    type="text"
                    name="email"
                    className={`form-input ${errors.email ? 'input-error' : ''
                      }`}
                    placeholder="Tell us your Email ID"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}

                  />

                  {errors.email && (
                    <p className="error-text">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="form-group">
                  <label className="form-label">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    className={`form-input ${errors.password
                      ? 'input-error'
                      : ''
                      }`}
                    placeholder="Enter strong password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}

                  />

                  {errors.password && (
                    <p className="error-text">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* MOBILE */}
                <div className="form-group">
                  <label className="form-label">
                    Mobile number
                  </label>

                  <input
                    type="text"
                    name="mobile_number"
                    className={`form-input ${errors.mobile_number
                      ? 'input-error'
                      : ''
                      }`}
                    placeholder="Enter mobile number"
                    value={formData.mobile_number}
                    onChange={handleChange}
                    onBlur={handleBlur}

                  />

                  {errors.mobile_number && (
                    <p className="error-text">
                      {errors.mobile_number}
                    </p>
                  )}
                </div>

                {/* WORK STATUS */}
                <div className="form-group">
                  <label className="form-label">
                    Work status
                  </label>

                  <div className="work-status-options">

                    <div
                      className={`status-card ${formData.work_status ===
                        'experienced'
                        ? 'selected'
                        : ''
                        }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          work_status: 'experienced',
                        })
                      }
                    >
                      <div className="status-content">
                        <h4>I'm experienced</h4>
                        <p>
                          I have work experience
                        </p>
                      </div>

                      <div className="status-icon">
                        💼
                      </div>
                    </div>

                    <div
                      className={`status-card ${formData.work_status ===
                        'fresher'
                        ? 'selected'
                        : ''
                        }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          work_status: 'fresher',
                        })
                      }
                    >
                      <div className="status-content">
                        <h4>I'm a fresher</h4>
                        <p>
                          I am a student
                        </p>
                      </div>

                      <div className="status-icon">
                        🎓
                      </div>
                    </div>

                  </div>

                  {errors.work_status && (
                    <p className="error-text">
                      {errors.work_status}
                    </p>
                  )}
                </div>

                {/* CHECKBOX */}
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="subscribe"
                      checked={formData.subscribe}
                      onChange={handleChange}
                    />

                    Send me updates & promotions
                  </label>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  className="btn-register"
                >
                  Next ➔
                </button>

                {/* LOGIN LINK */}
                <div className="register-login-link">
                  Already have an account?{' '}

                  <Link to="/login">
                    Login
                  </Link>
                </div>

              </form>
            </>
          ) : (
            <>
              <div className="preferences-header">
                <button type="button" className="btn-back-step" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <h2 className="register-title">Your preferences</h2>
              </div>
              <p className="register-subtitle">
                Help us personalize your internship search experience.
              </p>

              <form onSubmit={handleRegister}>
                {/* AREA OF INTEREST */}
                <div className="form-group">
                  <label className="form-label">Area(s) of interest</label>
                  <div className="search-tag-input-container">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Graphic Design"
                      value={interestSearch}
                      onChange={(e) => setInterestSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (interestSearch.trim() && !areasOfInterest.includes(interestSearch.trim())) {
                            setAreasOfInterest([...areasOfInterest, interestSearch.trim()]);
                            setInterestSearch('');
                          }
                        }
                      }}
                    />
                  </div>

                  {/* Selected tags */}
                  <div className="selected-tags-container">
                    {areasOfInterest.map((interest) => (
                      <span key={interest} className="preference-tag-chip">
                        {interest}
                        <button
                          type="button"
                          className="remove-tag-btn"
                          onClick={() => setAreasOfInterest(areasOfInterest.filter((t) => t !== interest))}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="suggestions-meta-block">
                    <span>Also select the following to get more opportunities:</span>
                    <div className="suggested-pills-row">
                      {['Film Making', 'Videography', 'Cinematography'].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className="suggestion-pill-btn"
                          onClick={() => {
                            if (!areasOfInterest.includes(suggestion)) {
                              setAreasOfInterest([...areasOfInterest, suggestion]);
                            }
                          }}
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="popular-interests-block">
                    <label className="form-label-secondary">Popular career interests</label>
                    <div className="interests-grid-pills">
                      {[
                        'Sales', 'Data Entry', 'Digital Marketing', 'Web Development', 
                        'Marketing', 'Human Resources (HR)', 'General Management', 
                        'Social Media Marketing', 'Finance', 'Software Development', 
                        'Telecalling', 'Market/Business Research', 'Content Writing', 
                        'Accounts', 'Project Management', 'Client Servicing', 'Operations'
                      ].map((interest) => {
                        const isSelected = areasOfInterest.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            className={`interest-pill-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              if (isSelected) {
                                setAreasOfInterest(areasOfInterest.filter((i) => i !== interest));
                              } else {
                                setAreasOfInterest([...areasOfInterest, interest]);
                              }
                            }}
                          >
                            {interest} {isSelected ? '✓' : '+'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* PREFERRED CITY */}
                <div className="form-group" style={{ marginTop: '2rem' }}>
                  <label className="form-label">Preferred city for jobs/internships (Maximum 3)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pune"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (locationSearch.trim() && preferredLocations.length < 3 && !preferredLocations.includes(locationSearch.trim())) {
                          setPreferredLocations([...preferredLocations, locationSearch.trim()]);
                          setLocationSearch('');
                        }
                      }
                    }}
                  />

                  {/* Selected locations */}
                  <div className="selected-tags-container">
                    {preferredLocations.map((loc) => (
                      <span key={loc} className="preference-tag-chip location-chip">
                        {loc}
                        <button
                          type="button"
                          className="remove-tag-btn"
                          onClick={() => setPreferredLocations(preferredLocations.filter((t) => t !== loc))}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="popular-interests-block">
                    <div className="interests-grid-pills">
                      {['Pune', 'Mumbai', 'Delhi / NCR', 'Bangalore', 'Hyderabad', 'Chennai'].map((loc) => {
                        const isSelected = preferredLocations.includes(loc);
                        return (
                          <button
                            key={loc}
                            type="button"
                            className={`interest-pill-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              if (isSelected) {
                                setPreferredLocations(preferredLocations.filter((l) => l !== loc));
                              } else if (preferredLocations.length < 3) {
                                setPreferredLocations([...preferredLocations, loc]);
                              } else {
                                toast.warning('Maximum 3 preferred cities allowed.');
                              }
                            }}
                          >
                            {loc} {isSelected ? '✓' : '+'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* CAREER GOAL */}
                <div className="form-group" style={{ marginTop: '2rem' }}>
                  <label className="form-label">What is your current career goal?</label>
                  <div className="career-goals-vertical-list">
                    {[
                      'Get an online degree from a premium institute in India',
                      'Go for study abroad',
                      'Enroll in job-guaranteed training to get a job',
                      'Prepare for government exams'
                    ].map((goal) => (
                      <label key={goal} className="career-goal-radio-option">
                        <input
                          type="radio"
                          name="careerGoal"
                          checked={careerGoal === goal}
                          onChange={() => setCareerGoal(goal)}
                        />
                        <span>{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* REGISTER BUTTON */}
                <div className="preferences-form-footer">
                  <button
                    type="submit"
                    className="btn-register btn-preferences-save"
                    disabled={loading}
                  >
                    {loading ? 'Saving Preferences...' : 'Save & Register ➔'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}