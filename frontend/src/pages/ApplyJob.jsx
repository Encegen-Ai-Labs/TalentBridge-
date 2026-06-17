import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { applyJob } from '../services/api';
import { toast } from 'react-toastify';
import './ApplyJob.css';

export default function ApplyJob() {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job;

  const [availability, setAvailability] = useState('immediately');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!job) {
      toast.error('Job details not found');
      navigate(-1);
    }
  }, [job, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
    }
  };

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!job) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      let resumeName = null;
      let resumeData = null;

      if (resumeFile) {
        resumeName = resumeFile.name;
        resumeData = await readFileAsBase64(resumeFile);
      }

      const details = {
        availability,
        cover_letter: coverLetter,
        resume_option: resumeFile ? 'custom' : 'existing',
        manual_resume_name: resumeName,
        manual_resume_data: resumeData,
      };

      await applyJob(job.job_id || job.id, details);
      toast.success('Application submitted successfully!');
      setTimeout(() => navigate('/applications'), 1500);
    } catch (err) {
      console.error('Application error:', err);
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) {
    return <div className="apply-loading">Loading...</div>;
  }

  return (
    <div className="apply-job-page">
      <div className="apply-container">
        <button className="back-link" onClick={() => navigate(-1)}>
          ← Back to Job
        </button>

        <div className="apply-header">
          <h1>Apply for {job.title}</h1>
          <p className="company-info">{job.company_name} • {job.location}</p>
        </div>

        <div className="apply-content-grid">
          <main className="apply-main">
            <div className="job-summary-card">
              <h2>Job Summary</h2>
              <div className="summary-row">
                <span className="summary-label">Position</span>
                <span className="summary-value">{job.title}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Company</span>
                <span className="summary-value">{job.company_name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Location</span>
                <span className="summary-value">{job.location || '-'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Type</span>
                <span className="summary-value">
                  {job.job_type === 'internship' ? 'Internship' : 'Full Time'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="apply-form">
              {/* Availability Section */}
              <section className="form-section">
                <h3 className="section-title">When can you join?</h3>
                <div className="availability-options">
                  <label className="option-radio">
                    <input
                      type="radio"
                      name="availability"
                      value="immediately"
                      checked={availability === 'immediately'}
                      onChange={(e) => setAvailability(e.target.value)}
                    />
                    <span className="radio-label">
                      <strong>Immediately</strong>
                      <small>I can join right away</small>
                    </span>
                  </label>

                  <label className="option-radio">
                    <input
                      type="radio"
                      name="availability"
                      value="notice"
                      checked={availability === 'notice'}
                      onChange={(e) => setAvailability(e.target.value)}
                    />
                    <span className="radio-label">
                      <strong>On Notice Period</strong>
                      <small>I need to serve a notice period</small>
                    </span>
                  </label>

                  <label className="option-radio">
                    <input
                      type="radio"
                      name="availability"
                      value="flexible"
                      checked={availability === 'flexible'}
                      onChange={(e) => setAvailability(e.target.value)}
                    />
                    <span className="radio-label">
                      <strong>Flexible</strong>
                      <small>Open to discussing timelines</small>
                    </span>
                  </label>

                  <label className="option-radio">
                    <input
                      type="radio"
                      name="availability"
                      value="other"
                      checked={availability === 'other'}
                      onChange={(e) => setAvailability(e.target.value)}
                    />
                    <span className="radio-label">
                      <strong>Other</strong>
                      <small>I'll discuss in an interview</small>
                    </span>
                  </label>
                </div>
              </section>

              {/* Cover Letter Section */}
              <section className="form-section">
                <h3 className="section-title">Cover Letter (Optional)</h3>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the employer why you're interested in this role..."
                  className="form-textarea"
                  rows={5}
                />
              </section>

              {/* Resume Upload Section */}
              <section className="form-section">
                <h3 className="section-title">Upload Resume</h3>
                <div className="resume-upload-area">
                  <input
                    type="file"
                    id="resume-file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="resume-file" className="file-label">
                    <div className="upload-icon">📄</div>
                    <p className="upload-text">
                      {resumeFile ? resumeFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <small>PDF, DOC, or DOCX • Max 5MB</small>
                  </label>
                </div>
              </section>

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-submit"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </main>

          <aside className="apply-sidebar">
            <div className="info-card">
              <h4>Important Information</h4>
              <ul className="info-list">
                <li>✓ Make sure your resume is up to date</li>
                <li>✓ Use a professional email address</li>
                <li>✓ The employer can see your profile information</li>
                <li>✓ You'll receive updates via email</li>
              </ul>
            </div>

            <div className="tips-card">
              <h4>Application Tips</h4>
              <p>
                Personalizing your application with a thoughtful cover letter can significantly improve your chances of getting noticed by the employer.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
