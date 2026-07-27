import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCompany } from '../services/api';
import { toast } from 'react-toastify';
import './EmployerRegister.css';

export default function EmployerRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile_number: '',
    company_name: '',
    industry: '',
    subscribe: false,
  });

  const [errors, setErrors] = useState({});

  // Field validation rules
  const validateField = (name, value) => {
    let error = '';

    if (name === 'name') {
      const trimmed = value.trim();
      if (!trimmed) {
        error = 'Representative name is required';
      } else if (value.startsWith(' ')) {
        error = 'Starting spaces are not allowed';
      } else if (trimmed.length < 3) {
        error = 'Minimum 3 characters required';
      } else if (trimmed.length > 40) {
        error = 'Maximum 40 characters allowed';
      } else if (!/^[A-Za-z ]+$/.test(trimmed)) {
        error = 'Numbers and special characters are not allowed';
      } else if (/\s{2,}/.test(trimmed)) {
        error = 'Multiple spaces are not allowed';
      }
    }

    if (name === 'email') {
      const trimmed = value.trim();
      if (!trimmed) {
        error = 'Corporate email is required';
      } else if (value.startsWith(' ')) {
        error = 'Starting spaces are not allowed';
      } else if (/\s/.test(value)) {
        error = 'Spaces are not allowed';
      } else if (/[A-Z]/.test(value)) {
        error = 'Capital letters are not allowed';
      } else if (/^\d/.test(value)) {
        error = 'Email cannot start with a number';
      } else {
        const emailRegex = /^[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/;
        if (!emailRegex.test(trimmed)) {
          error = 'Invalid email format';
        }
      }
    }

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
        error = 'At least one uppercase letter required';
      } else if (!/(?=.*[a-z])/.test(value)) {
        error = 'At least one lowercase letter required';
      } else if (!/(?=.*\d)/.test(value)) {
        error = 'At least one number required';
      } else if (!/(?=.*[!@#$%^&*])/.test(value)) {
        error = 'At least one special character required';
      }
    }

    if (name === 'mobile_number') {
      if (!value) {
        error = 'Mobile number is required';
      } else if (!/^[6-9]/.test(value)) {
        error = 'Mobile number must start with 6-9';
      } else if (!/^\d+$/.test(value)) {
        error = 'Only numbers are allowed';
      } else if (value.length < 10) {
        error = 'Mobile number must be 10 digits';
      } else if (value.length > 10) {
        error = 'More than 10 digits are not allowed';
      }
    }

    if (name === 'company_name') {
      const trimmed = value.trim();
      if (!trimmed) {
        error = 'Company name is required';
      } else if (trimmed.length < 2) {
        error = 'Minimum 2 characters required';
      }
    }

    if (name === 'industry') {
      if (!value) {
        error = 'Please select your industry vertical';
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'mobile_number') {
      const onlyDigits = value.replace(/\D/g, '');
      if (onlyDigits.length > 10) return;

      setFormData((prev) => ({ ...prev, mobile_number: onlyDigits }));
      const error = validateField('mobile_number', onlyDigits);
      setErrors((prev) => ({ ...prev, mobile_number: error }));
      return;
    }

    if (name === 'name') {
      if (/[^A-Za-z ]/.test(value)) return;
    }

    const updatedValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
    const error = validateField(name, updatedValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    let newErrors = {};

    Object.keys(formData).forEach((field) => {
      if (field === 'subscribe') return;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      await registerCompany({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        mobile_number: formData.mobile_number,
        company_name: formData.company_name.trim(),
        industry: formData.industry,
      });

      toast.success('Company Account Registered Successfully!');
      setTimeout(() => {
        navigate('/employer/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      const message = err.message?.toLowerCase() || '';

      if (message.includes('email')) {
        setErrors({ email: 'Corporate email already registered' });
      } else {
        toast.error('Registration failed. Please check field errors.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employer-register-page">
      <div className="employer-register-card">
        {/* Left Features Illustration Panel */}
        <div className="employer-register-features">
          <div className="features-glass-panel">
            <span className="badge-light">Employer Suite</span>
            <h3>Acquire Top Global Talent</h3>
            <p>Deploy custom job postings, scan verified student resumes, and collaborate with leading universities easily.</p>
            
            <div className="features-checklist">
              <div className="checklist-item">
                <span className="check-bullet">✓</span>
                <div>
                  <h4>Zero Listing Fees</h4>
                  <p>Publish internships, full-time jobs, and gig campaigns with no hidden charges.</p>
                </div>
              </div>


              <div className="checklist-item">
                <span className="check-bullet">✓</span>
                <div>
                  <h4>Applicant Tracking</h4>
                  <p>Shortlist, schedule interviews, and declare final hiring rounds seamlessly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="employer-register-form-container">
          <div className="form-header">
            <h2 className="register-title">Register Your Company</h2>
            <p className="register-subtitle">Set up your workspace and start hiring within minutes</p>
          </div>

          <form onSubmit={handleRegister}>
            {/* Representative Name */}
            <div className="form-group">
              <label className="form-label">Representative's Full Name</label>
              <input
                type="text"
                name="name"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="What is your name?"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            {/* Corporate Email */}
            <div className="form-group">
              <label className="form-label">Corporate Email ID</label>
              <input
                type="text"
                name="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="hr@yourcompany.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Min 6 characters (1 upper, 1 special)"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            {/* Mobile */}
            <div className="form-group">
              <label className="form-label">Contact Mobile Number</label>
              <input
                type="text"
                name="mobile_number"
                className={`form-input ${errors.mobile_number ? 'input-error' : ''}`}
                placeholder="Enter mobile number"
                value={formData.mobile_number}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.mobile_number && <p className="error-text">{errors.mobile_number}</p>}
            </div>

            {/* Company Name */}
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                name="company_name"
                className={`form-input ${errors.company_name ? 'input-error' : ''}`}
                placeholder="Enter official registered company name"
                value={formData.company_name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.company_name && <p className="error-text">{errors.company_name}</p>}
            </div>

            {/* Industry Verticals */}
            <div className="form-group">
              <label className="form-label">Industry Vertical</label>
              <select
                name="industry"
                className={`form-select ${errors.industry ? 'input-error' : ''}`}
                value={formData.industry}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Select Industry</option>
                <option value="IT & Software">IT & Software Development</option>
                <option value="Finance & Fintech">Finance & Fintech</option>
                <option value="Consulting">Strategy & Consulting</option>
                <option value="E-Commerce">E-Commerce & Retail</option>
                <option value="EdTech">Education & EdTech</option>
                <option value="Healthcare">Healthcare & Biotech</option>
                <option value="Marketing">Marketing & Advertising</option>
              </select>
              {errors.industry && <p className="error-text">{errors.industry}</p>}
            </div>

            {/* Subscribe Checkbox */}
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="subscribe"
                  checked={formData.subscribe}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                I agree to the Employer Terms of Service & Privacy Policy
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-register"
              disabled={loading}
            >
              {loading ? 'Creating Corporate Workspace...' : 'Register Workspace Now'}
            </button>

            {/* Login Navigation Link */}
            <div className="register-login-link">
              Already registered?{' '}
              <Link to="/employer/login">
                Workspace Log In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
