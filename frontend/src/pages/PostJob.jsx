import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createJob, getCompanyProfileStatus } from '../services/api';
import { toast } from 'react-toastify';
import './PostJob.css';

const PREDEFINED_SKILLS = [
  // Tech Skills
  'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'Python', 'Django', 
  'Java', 'Spring Boot', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'SQL', 'MongoDB', 
  'AWS', 'Docker', 'Kubernetes', 'Git', 'TypeScript', 'PHP', 'Laravel', 'Angular', 'Vue.js',
  // Designer Skills
  'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX Design', 'Wireframing', 
  'Prototyping', 'Graphic Design', 'Motion Graphics', 'Blender', '3D Modeling', 'Canva',
  // Sales / Marketing Skills
  'SEO', 'SEM', 'Content Writing', 'Email Marketing', 'Social Media Management', 
  'Google Analytics', 'Copywriting', 'B2B Sales', 'Lead Generation', 'Customer Relations', 
  'Public Relations', 'Market Research', 'Digital Marketing',
  // Other Skills
  'Project Management', 'Product Management', 'Agile/Scrum', 'Business Analysis', 
  'Communication', 'Team Collaboration', 'Technical Writing', 'Problem Solving'
];

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileCheckLoading, setProfileCheckLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    roleOverview: '',
    requirements: '',
    additionalInformation: '',
    aboutCompany: '',
    jobType: 'internship' // defaults to internship
  });

  const [skills, setSkills] = useState(['Figma', 'React', 'Project Management', 'Technical Writing']);
  const [skillInput, setSkillInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Check profile status on component mount
  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const status = await getCompanyProfileStatus();
        if (!status.profile_completed) {
          setShowProfileModal(true);
        }
      } catch (err) {
        console.error('Error checking profile status:', err);
        toast.error('Error checking profile status');
      } finally {
        setProfileCheckLoading(false);
      }
    };

    checkProfileStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.title || !formData.category || !formData.location || !formData.description) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    // Smart JSON serialization for segregated description fields so the details page
    // can render Role Overview, Requirements, Additional Information and About Company.
    const complexDescription = JSON.stringify({
      description: formData.description || '',
      role_overview: formData.roleOverview || '',
      requirements: formData.requirements || '',
      additional_information: formData.additionalInformation || '',
      about_company: formData.aboutCompany || '',
      salary_min: formData.salaryMin || 'Negotiable',
      salary_max: formData.salaryMax || 'Not Specified',
      category: formData.category
    });

    const jobData = {
      title: formData.title,
      description: complexDescription,
      skills_required: skills.join(','),
      job_type: formData.jobType, // 'internship' or 'full-time'
      location: formData.location,
      job_mode: 'DIRECT' // direct posting from Company Dashboard
    };

    try {
      await createJob(jobData);
      toast.success('Opportunity Created & Published Successfully!');
      setTimeout(() => {
        navigate('/company/dashboard');
      }, 1800);
    } catch (err) {
      console.error(err);
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
          <h1 className="form-title">Create New Internship Opportunity</h1>
          <p className="form-subtitle">Fill in the details below to reach thousands of qualified candidates on HireKarma.</p>
        </div>

        <form onSubmit={handleSubmit} className="post-job-form">
          {/* Row 1: Job Title & Category */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g. Senior UX Designer"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Category</label>
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
              </select>
            </div>
          </div>

          {/* Row 2: Location, Salary Range, and Job Type */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                className="form-input icon-input"
                placeholder="City, State or Remote"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Opportunity Type</label>
              <select
                name="jobType"
                className="form-select"
                value={formData.jobType}
                onChange={handleChange}
              >
                <option value="internship">Internship Campaign</option>
                <option value="full-time">Full-Time Job Opportunity</option>
              </select>
            </div>

            <div className="form-group salary-group">
              <label className="form-label">Salary Range (Monthly / Annual)</label>
              <div className="salary-inputs">
                <input
                  type="text"
                  name="salaryMin"
                  className="form-input salary-input"
                  placeholder="Rs Min"
                  value={formData.salaryMin}
                  onChange={handleChange}
                />
                <span className="to-divider">to</span>
                <input
                  type="text"
                  name="salaryMax"
                  className="form-input salary-input"
                  placeholder="Rs Max"
                  value={formData.salaryMax}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Segregated Job Description Fields */}
          <div className="form-group desc-group">
            <label className="form-label">Role Overview</label>
            <textarea
              name="roleOverview"
              className="form-textarea"
              placeholder="Describe the role overview and primary responsibilities"
              value={formData.roleOverview}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          <div className="form-group desc-group">
            <label className="form-label">Requirements</label>
            <textarea
              name="requirements"
              className="form-textarea"
              placeholder="List required skills, qualifications, and experience"
              value={formData.requirements}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          <div className="form-group desc-group">
            <label className="form-label">Additional Information</label>
            <textarea
              name="additionalInformation"
              className="form-textarea"
              placeholder="Any stipend, perks, or extra info"
              value={formData.additionalInformation}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group desc-group">
            <label className="form-label">About Company (will show on opportunity)</label>
            <textarea
              name="aboutCompany"
              className="form-textarea"
              placeholder="Short blurb about your company"
              value={formData.aboutCompany}
              onChange={handleChange}
              rows="3"
            />
          </div>

          {/* Row 4: Required Skills */}
          <div className="form-group skills-group">
            <label className="form-label">Required Skills</label>
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
                placeholder="Search or Select a skill... (Or type and press Enter)"
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

          {/* Form Banner Overlays */}
          <div className="form-banner-split">
            {/* Boost Visibility Banner */}
            <div className="boost-banner">
              <div className="boost-icon">🚀</div>
              <div className="boost-content">
                <strong>Boost Visibility</strong>
                <p>Promoted jobs receive 4x more relevant applications on average. Add a featured badge to your listing for just $20. <Link to="#">Learn more about Developer Boost</Link></p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="quick-tips-banner">
              <strong>QUICK TIPS</strong>
              <ul>
                <li>Be specific about day-to-day tasks.</li>
                <li>List at least 3-5 core skills.</li>
              </ul>
            </div>
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
                {loading ? 'Publishing Opportunity...' : 'Publish Job ➔'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
