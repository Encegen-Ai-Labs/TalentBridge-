import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createJob, getCompanyProfileStatus, getCompanyProfile } from '../services/api';
import { toast } from 'react-toastify';
import './PostJob.css';

const PREDEFINED_SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'Python', 'Django', 
  'Java', 'Spring Boot', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'SQL', 'MongoDB', 
  'AWS', 'Docker', 'Kubernetes', 'Git', 'TypeScript', 'PHP', 'Laravel', 'Angular', 'Vue.js',
  'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX Design', 'Wireframing', 
  'Prototyping', 'Graphic Design', 'Motion Graphics', 'Blender', '3D Modeling', 'Canva',
  'SEO', 'SEM', 'Content Writing', 'Email Marketing', 'Social Media Management', 
  'Google Analytics', 'Copywriting', 'B2B Sales', 'Lead Generation', 'Customer Relations', 
  'Public Relations', 'Market Research', 'Digital Marketing',
  'Project Management', 'Product Management', 'Agile/Scrum', 'Business Analysis', 
  'Communication', 'Team Collaboration', 'Technical Writing', 'Problem Solving'
];

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileCheckLoading, setProfileCheckLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    category: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    roleOverview: '',
    requirements: '',
    additionalInformation: '',
    aboutCompany: '',
    jobType: 'internship',
    employmentType: 'full-time',
    jobMode: 'onsite',
    department: '',
    applicationDeadline: '',
    isFeatured: false,
    benefits: '',
    educationRequirements: '',
    preferredCandidate: '',
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Check profile status and fetch company details on component mount
  useEffect(() => {
    const checkProfileAndFetchCompany = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login first');
          navigate('/login');
          return;
        }

        const status = await getCompanyProfileStatus();
        
        if (!status.profile_completed) {
          setShowProfileModal(true);
          setProfileCheckLoading(false);
          return;
        }

        // Fetch company profile to get company name
        const profile = await getCompanyProfile();
        setCompanyProfile(profile.data);
        
        // Auto-fill company name and location from profile
        setFormData(prev => ({
          ...prev,
          company_name: profile.data.company_name || '',
          location: profile.data.location || '',
          aboutCompany: profile.data.about_company || profile.data.about || '',
        }));

        setProfileCheckLoading(false);
      } catch (err) {
        console.error('Error fetching company profile:', err);
        toast.error('Error loading company profile');
        setProfileCheckLoading(false);
      }
    };

    checkProfileAndFetchCompany();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (trimmed && !skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
        setSkillInput('');
        setShowDropdown(false);
      }
    }
  };

  const handleSelectSkill = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSkillInput('');
    setShowDropdown(false);
  };

  const handleRemoveSkill = (indexToRemove) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title || !formData.company_name || !formData.category || !formData.location) {
      toast.error('Please fill out all required fields.');
      return;
    }

    if (!formData.roleOverview || !formData.requirements) {
      toast.error('Please fill in Role Overview and Requirements.');
      return;
    }

    if (skills.length === 0) {
      toast.error('Please add at least one skill.');
      return;
    }

    setLoading(true);

    // Prepare job data - match exactly what backend expects
    const jobData = {
      title: formData.title,
      company_name: formData.company_name,
      description: JSON.stringify({
        description: formData.description || '',
        role_overview: formData.roleOverview || '',
        requirements: formData.requirements || '',
        additional_information: formData.additionalInformation || '',
        about_company: formData.aboutCompany || '',
      }),
      skills_required: skills.join(','),
      job_type: formData.jobType,
      employment_type: formData.employmentType || 'full-time',
      location: formData.location,
      job_mode: formData.jobMode || 'onsite',
      department: formData.department || null,
      salary_min: formData.salaryMin || null,
      salary_max: formData.salaryMax || null,
      application_deadline: formData.applicationDeadline || null,
      is_featured: formData.isFeatured || false,
      benefits: formData.benefits || null,
      education_requirements: formData.educationRequirements || null,
      preferred_candidate: formData.preferredCandidate || null,
      status: 'active'
    };

    try {
      const response = await createJob(jobData);
      console.log('Job created:', response);
      toast.success('Opportunity Created & Published Successfully!');
      setTimeout(() => {
        navigate('/company/dashboard');
      }, 1800);
    } catch (err) {
      console.error('Error creating job:', err);
      toast.error(err.message || 'Failed to publish opportunity.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = PREDEFINED_SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(skillInput.toLowerCase()) &&
      !skills.includes(skill)
  );

  if (profileCheckLoading) {
    return (
      <div className="post-job-page">
        <div className="post-job-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading company profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-job-page">
      {/* Profile Completion Modal */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">📋</div>
            <h2 className="modal-title">Complete Your Company Profile</h2>
            <p className="modal-subtitle">
              You must complete your company details before posting jobs.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => navigate('/company/dashboard')}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn-primary"
                onClick={() => navigate('/company/profile')}
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="post-job-container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/company/dashboard">Dashboard</Link>
          <span className="separator">&gt;</span>
          <span className="active-breadcrumb">Post a Job</span>
        </div>

        {/* Form Title & Subtitle */}
        <div className="page-header">
          <h1 className="form-title">Create New Job Opportunity</h1>
          <p className="form-subtitle">Fill in the details below to reach thousands of qualified candidates.</p>
        </div>

        <form onSubmit={handleSubmit} className="post-job-form">
          {/* Row 1: Job Title & Company Name */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Job Title</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g. Senior Graphic Designer"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Company Name</label>
              <input
                type="text"
                name="company_name"
                className="form-input company-name-input"
                placeholder="Your company name"
                value={formData.company_name}
                onChange={handleChange}
                required
                disabled={!!companyProfile}
              />
              {companyProfile && (
                <small className="field-hint">
                  ✓ Auto-filled from your company profile
                </small>
              )}
            </div>
          </div>

          {/* Row 2: Category, Department & Location */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Job Category</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">UX & Product Design</option>
                <option value="Product">Product Management</option>
                <option value="Marketing">Growth & Marketing</option>
                <option value="Sales">Sales & Business Development</option>
                <option value="Finance">Finance & Banking</option>
                <option value="HR">Human Resources</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                className="form-input"
                placeholder="e.g. Creative, Engineering"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. Pune, India or Remote"
                value={formData.location}
                onChange={handleChange}
                required
              />
              {companyProfile && (
                <small className="field-hint">
                  ℹ️ Auto-filled from your company profile
                </small>
              )}
            </div>
          </div>

          {/* Row 3: Salary Range & Experience */}
          <div className="form-row">
            <div className="form-group salary-group">
              <label className="form-label">Salary Range (Annual CTC)</label>
              <div className="salary-inputs">
                <input
                  type="number"
                  name="salaryMin"
                  className="form-input salary-input"
                  placeholder="Min (₹)"
                  value={formData.salaryMin}
                  onChange={handleChange}
                />
                <span className="to-divider">to</span>
                <input
                  type="number"
                  name="salaryMax"
                  className="form-input salary-input"
                  placeholder="Max (₹)"
                  value={formData.salaryMax}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input
                type="date"
                name="applicationDeadline"
                className="form-input"
                value={formData.applicationDeadline}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 4: Job Type, Employment Type & Work Mode */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Opportunity Type</label>
              <select
                name="jobType"
                className="form-select"
                value={formData.jobType}
                onChange={handleChange}
              >
                <option value="internship">Internship</option>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <select
                name="employmentType"
                className="form-select"
                value={formData.employmentType}
                onChange={handleChange}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Work Mode</label>
              <select
                name="jobMode"
                className="form-select"
                value={formData.jobMode}
                onChange={handleChange}
              >
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>

          {/* Row 5: Benefits */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Benefits & Perks</label>
              <input
                type="text"
                name="benefits"
                className="form-input"
                placeholder="e.g. Health insurance, Paid time off"
                value={formData.benefits}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 6: Required Skills */}
          <div className="form-group">
            <label className="form-label required">Required Skills</label>
            <div className="skills-tags-container">
              {skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  <button
                    type="button"
                    className="remove-skill-btn"
                    onClick={() => handleRemoveSkill(index)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="skills-dropdown-wrapper">
              <input
                type="text"
                className="form-input skills-input"
                placeholder="Add skills (e.g. Photoshop, Illustrator, 3D Design)"
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 250)}
                onKeyDown={handleAddSkill}
              />
              {showDropdown && filteredSkills.length > 0 && (
                <div className="skills-autocomplete-dropdown">
                  {filteredSkills.map((skill) => (
                    <div
                      key={skill}
                      className="skills-dropdown-item"
                      onClick={() => handleSelectSkill(skill)}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 7: Role Overview */}
          <div className="form-group desc-group">
            <label className="form-label required">Role Overview</label>
            <textarea
              name="roleOverview"
              className="form-textarea"
              placeholder="Describe the key responsibilities and day-to-day tasks..."
              value={formData.roleOverview}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          {/* Row 8: Requirements */}
          <div className="form-group desc-group">
            <label className="form-label required">Requirements</label>
            <textarea
              name="requirements"
              className="form-textarea"
              placeholder="List required skills, qualifications, and experience..."
              value={formData.requirements}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          {/* Row 9: Preferred Candidate */}
          <div className="form-group desc-group">
            <label className="form-label">Preferred Candidate</label>
            <textarea
              name="preferredCandidate"
              className="form-textarea"
              placeholder="Describe the ideal candidate profile..."
              value={formData.preferredCandidate}
              onChange={handleChange}
              rows="3"
            />
          </div>

          {/* Row 10: Education Requirements */}
          <div className="form-group desc-group">
            <label className="form-label">Education Requirements</label>
            <textarea
              name="educationRequirements"
              className="form-textarea"
              placeholder="e.g. BFA - Visual Communication, Any Graduate"
              value={formData.educationRequirements}
              onChange={handleChange}
              rows="2"
            />
          </div>

          {/* Row 11: Additional Information */}
          <div className="form-group desc-group">
            <label className="form-label">Additional Information</label>
            <textarea
              name="additionalInformation"
              className="form-textarea"
              placeholder="Any additional details about the role..."
              value={formData.additionalInformation}
              onChange={handleChange}
              rows="3"
            />
          </div>

          {/* Row 12: About Company */}
          <div className="form-group desc-group">
            <label className="form-label">About Company</label>
            <textarea
              name="aboutCompany"
              className="form-textarea"
              placeholder="Short blurb about your company..."
              value={formData.aboutCompany}
              onChange={handleChange}
              rows="3"
            />
            {companyProfile && (
              <small className="field-hint">
                ℹ️ Auto-filled from your company profile
              </small>
            )}
          </div>

          {/* Row 13: Full Job Description */}
          <div className="form-group desc-group">
            <label className="form-label">Full Job Description</label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="Detailed job description..."
              value={formData.description}
              onChange={handleChange}
              rows="5"
            />
          </div>

          {/* Row 14: Featured Job */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              <span>Feature this job posting</span>
              <small className="featured-hint">Featured jobs get 4x more visibility</small>
            </label>
          </div>

          {/* Quick Tips */}
          <div className="quick-tips-banner">
            <strong>💡 QUICK TIPS</strong>
            <ul>
              <li>Be specific about day-to-day tasks.</li>
              <li>List at least 3-5 core skills.</li>
              <li>Mention salary range for better applications.</li>
            </ul>
          </div>

          {/* Action Footer */}
          <div className="form-action-footer">
            <div className="footer-status-msg">
              <span className="green-check">✓</span>
              <span>Your job will be reviewed and posted immediately.</span>
            </div>
            <div className="footer-buttons">
              <button
                type="button"
                className="btn-draft"
                onClick={() => {
                  toast.info('Draft Saved Successfully.');
                  navigate('/company/dashboard');
                }}
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="btn-publish"
                disabled={loading}
              >
                {loading ? 'Publishing...' : 'Publish Job →'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}