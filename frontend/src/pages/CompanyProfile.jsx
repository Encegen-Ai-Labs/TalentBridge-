import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { updateCompanyProfile } from '../services/api';
import { toast } from 'react-toastify';
import './CompanyProfile.css';

const urlRegex = /^(https?:\/\/)?[\w.-]+(\.[\w\.-]+)+[\w\-._~:\/?#\[\]@!$&'()*+,;=.]+$/i;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;

// Helper: Allow only lowercase, digits, @, . and - for email
const sanitizeEmail = (value) => {
  // Convert to lowercase
  let cleaned = value.toLowerCase();
  // Remove leading digits
  while (cleaned.length > 0 && /[0-9]/.test(cleaned[0])) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
};

// Helper: Allow only digits for phone (max 10)
const sanitizePhone = (value) => {
  const digits = value.replace(/[^\d]/g, '');
  return digits.slice(0, 10);
};

export default function CompanyProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    industry: '',
    company_email: '',
    hr_contact: '',
    website: '',
    company_size: '',
    founded_year: '',
    location: '',
    about_company: '',
    gst_number: '',
    registration_number: '',
    pan_number: '',
    linkedin_profile: '',
    official_website: '',
    official_company_email: ''
  });

  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState({
    gst_certificate: null,
    registration_certificate: null,
    pan_card: null,
    company_logo: null
  });

  // Validate field in real-time
  const validateFieldRealTime = (name, value) => {
    switch (name) {
      case 'company_name':
      case 'location':
        if (!value) return 'This field is required';
        if (/^\s+$/.test(value)) return 'Blank spaces not allowed';
        if (value.trim().length < 2) return 'Too short';
        return '';

      case 'company_email':
      case 'official_company_email':
        if (!value) return 'This field is required';
        if (/^[0-9]/.test(value)) return 'Cannot start with number';
        if (/[A-Z]/.test(value)) return 'Uppercase not allowed';
        if (!/^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) return 'Invalid email format';
        return '';

      case 'hr_contact':
        if (!value) return 'This field is required';
        if (/^\s+$/.test(value)) return 'Blank spaces not allowed';
        if (value.length > 10) return 'Maximum 10 digits allowed';
        if (!/^\d+$/.test(value)) return 'Only numbers allowed';
        if (value.length < 10) return 'Must be 10 digits';
        return '';

      case 'website':
      case 'official_website':
      case 'linkedin_profile':
        if (!value) return 'This field is required';
        if (!urlRegex.test(value)) return 'Invalid URL';
        return '';

      case 'founded_year':
        if (!value) return 'This field is required';
        if (/^\s+$/.test(value)) return 'Blank spaces not allowed';
        if (!/^\d{4}$/.test(value)) return 'Enter 4 digit year';
        return '';

      case 'about_company':
        if (!value) return 'This field is required';
        if (/^\s+$/.test(value)) return 'Blank spaces not allowed';
        if (value.trim().length < 10) return 'Too short (min 10 chars)';
        return '';

      case 'industry':
      case 'company_size':
        if (!value) return 'This field is required';
        return '';

      case 'registration_number':
        if (/^\s+$/.test(value)) return 'Blank spaces not allowed';
        if (value.trim().length < 3) return 'Too short';
        return '';

      case 'pan_number':
        if (/^\s+$/.test(value)) return 'Blank spaces not allowed';
        if (value && !panRegex.test(value.toUpperCase())) return 'Invalid PAN format';
        return '';

      case 'gst_number':
        // Temporarily no validation for GST
        if (/^\s+$/.test(value)) return 'Blank spaces not allowed';
        return '';

      default:
        return '';
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:5000/api/company/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.data) {
          const d = data.data;
          setForm((prev) => ({
            ...prev,
            company_name: d.company_name || '',
            industry: d.industry || '',
            company_email: d.company_email || '',
            hr_contact: d.hr_contact || '',
            website: d.website || '',
            company_size: d.company_size || '',
            founded_year: d.founded_year || '',
            location: d.location || '',
            about_company: d.about_company || '',
            gst_number: d.gst_number || '',
            registration_number: d.registration_number || '',
            pan_number: d.pan_number || '',
            linkedin_profile: d.linkedin_profile || '',
            official_website: d.official_website || '',
            official_company_email: d.official_company_email || ''
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === 'company_email' || name === 'official_company_email') {
      sanitized = sanitizeEmail(value);
    } else if (name === 'hr_contact') {
      sanitized = sanitizePhone(value);
    }

    setForm((prev) => ({ ...prev, [name]: sanitized }));
    setErrors((prev) => ({ ...prev, [name]: validateFieldRealTime(name, sanitized) }));
  };

  const handleFile = (e) => {
    const name = e.target.name;
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF/JPG/PNG allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max file size 5MB');
      return;
    }

    setFiles((prev) => ({ ...prev, [name]: file }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const renderUploadCard = (icon, label, hint, name) => {
    return (
      <label className="upload-card">
        <div className="upload-card-inner">
          <div className="upload-icon">{icon}</div>
          <div>
            <div className="upload-label">{label}</div>
            <div className="upload-hint">{hint}</div>
            <div className="upload-choose">{files[name] ? files[name].name : 'Choose File'}</div>
          </div>
        </div>
        <input type="file" name={name} accept=".pdf,image/png,image/jpeg" onChange={handleFile} />
      </label>
    );
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(form).forEach((k) => {
      const message = validateFieldRealTime(k, form[k]);
      if (message) newErrors[k] = message;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error('Please fix validation errors');
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => fd.append(k, form[k]));
      Object.keys(files).forEach((k) => {
        if (files[k]) fd.append(k, files[k]);
      });

      await updateCompanyProfile(fd);
      toast.success('Profile saved');
      navigate('/company/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-profile-page">
      <div className="profile-container">
        <div className="breadcrumbs">
          <Link to="/company/dashboard">Dashboard</Link>
          <span className="separator">&gt;</span>
          <span className="active-breadcrumb">Company Profile</span>
        </div>

        <div className="profile-header">
          <h1 className="profile-title">Company Profile</h1>
          <p className="profile-subtitle">Manage your organization's identity, verification status, and core documents.</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <div className="section-header">
              <h2>Basic Information</h2>
              <p>Manage your company's identity and core details.</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  className={`form-input ${errors.company_name ? 'invalid' : ''}`}
                  placeholder="e.g. Innovate Tech Solutions"
                />
                {errors.company_name && <div className="error-text">{errors.company_name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Industry</label>
                <select
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  className={`form-select ${errors.industry ? 'invalid' : ''}`}
                >
                  <option value="">Select Industry</option>
                  <option value="Software">Software & IT Services</option>
                  <option value="Technology & AI">Technology & AI</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Education">Education</option>
                  <option value="Media">Media & Entertainment</option>
                  <option value="Energy">Energy</option>
                  <option value="Telecommunications">Telecommunications</option>
                </select>
                {errors.industry && <div className="error-text">{errors.industry}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Email</label>
                <input
                  name="company_email"
                  value={form.company_email}
                  onChange={handleChange}
                  className={`form-input ${errors.company_email ? 'invalid' : ''}`}
                  placeholder="contact@company.com"
                />
                {errors.company_email && <div className="error-text">{errors.company_email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">HR Contact Number</label>
                <input
                  type="tel"
                  name="hr_contact"
                  value={form.hr_contact}
                  onChange={handleChange}
                  className={`form-input ${errors.hr_contact ? 'invalid' : ''}`}
                  placeholder="0123456789"
                />
                {errors.hr_contact && <div className="error-text">{errors.hr_contact}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className={`form-input ${errors.website ? 'invalid' : ''}`}
                  placeholder="https://www.company.com"
                />
                {errors.website && <div className="error-text">{errors.website}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Company Size</label>
                <select
                  name="company_size"
                  value={form.company_size}
                  onChange={handleChange}
                  className={`form-select ${errors.company_size ? 'invalid' : ''}`}
                >
                  <option value="">Select Company Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1001-5000">1001-5000 employees</option>
                  <option value="5000+">5000+ employees</option>
                </select>
                {errors.company_size && <div className="error-text">{errors.company_size}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Founded Year</label>
                <input
                  name="founded_year"
                  value={form.founded_year}
                  onChange={handleChange}
                  className={`form-input ${errors.founded_year ? 'invalid' : ''}`}
                  placeholder="2024"
                />
                {errors.founded_year && <div className="error-text">{errors.founded_year}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className={`form-input ${errors.location ? 'invalid' : ''}`}
                  placeholder="City, Country"
                />
                {errors.location && <div className="error-text">{errors.location}</div>}
              </div>
            </div>
            
          <div className="form-section">
            <div className="section-header">
              <h2>About Company</h2>
            </div>
            <div className="form-group full-width">
              <textarea
                name="about_company"
                value={form.about_company}
                onChange={handleChange}
                className={`form-textarea ${errors.about_company ? 'invalid' : ''}`}
                rows="5"
                placeholder="Describe your company's mission and culture..."
              />
              {errors.about_company && <div className="error-text">{errors.about_company}</div>}
            </div>
          </div>
        </div>
          <div className="form-section">
            <div className="section-header">
              <h2>Verification / Registration</h2>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">GST Number</label>
                <input
                  name="gst_number"
                  value={form.gst_number}
                  onChange={handleChange}
                  className={`form-input ${errors.gst_number ? 'invalid' : ''}`}
                  placeholder="22AAAAA0000A1Z5"
                />
                {errors.gst_number && <div className="error-text">{errors.gst_number}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Company Registration Number</label>
                <input
                  name="registration_number"
                  value={form.registration_number}
                  onChange={handleChange}
                  className={`form-input ${errors.registration_number ? 'invalid' : ''}`}
                  placeholder="U74999DL2024PTC123456"
                />
                {errors.registration_number && <div className="error-text">{errors.registration_number}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input
                  name="pan_number"
                  value={form.pan_number}
                  onChange={handleChange}
                  className={`form-input ${errors.pan_number ? 'invalid' : ''}`}
                  placeholder="ABCDE1234F"
                />
                {errors.pan_number && <div className="error-text">{errors.pan_number}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn Profile</label>
                <input
                  name="linkedin_profile"
                  value={form.linkedin_profile}
                  onChange={handleChange}
                  className={`form-input ${errors.linkedin_profile ? 'invalid' : ''}`}
                  placeholder="linkedin.com/company/yourname"
                />
                {errors.linkedin_profile && <div className="error-text">{errors.linkedin_profile}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Official Website</label>
                <input
                  name="official_website"
                  value={form.official_website}
                  onChange={handleChange}
                  className={`form-input ${errors.official_website ? 'invalid' : ''}`}
                  placeholder="https://corporate.company.com"
                />
                {errors.official_website && <div className="error-text">{errors.official_website}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Official Company Email</label>
                <input
                  name="official_company_email"
                  value={form.official_company_email}
                  onChange={handleChange}
                  className={`form-input ${errors.official_company_email ? 'invalid' : ''}`}
                  placeholder="legal@company.com"
                />
                {errors.official_company_email && <div className="error-text">{errors.official_company_email}</div>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h2>Document Uploads</h2>
            </div>

            <div className="form-row">
              {renderUploadCard('📄', 'GST Certificate', 'PDF or JPG (Max 5MB)', 'gst_certificate')}
              {renderUploadCard('🏛️', 'Registration Certificate', 'PDF or JPG (Max 5MB)', 'registration_certificate')}
            </div>
            <div className="form-row">
              {renderUploadCard('💳', 'PAN Card', 'PDF or JPG (Max 5MB)', 'pan_card')}
              {renderUploadCard('🖼️', 'Company Logo', 'PNG or SVG (Max 5MB)', 'company_logo')}
            </div>
          </div>


          <div className="form-actions">
            <button type="button" onClick={() => navigate('/company/dashboard')} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

      