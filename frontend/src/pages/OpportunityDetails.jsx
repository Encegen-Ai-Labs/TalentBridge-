import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { getJobById, applyJob } from '../services/api';
import { toast } from 'react-toastify';
import PlacementStories from '../components/Placementstories';
import './OpportunityDetails.css';
import SimilarJobs from '../components/SimilarJobs';
export default function OpportunityDetails() {
  const { state } = useLocation();
  const { id } = useParams(); // job id from URL
  const navigate = useNavigate();

  const [job, setJob] = useState(state?.job || null);
  const [loading, setLoading] = useState(!job);

  // Apply form state
  const [coverLetter, setCoverLetter] = useState('');
  const [availability, setAvailability] = useState('immediately');
  const [customResumeFile, setCustomResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If we don't have job data, fetch it by id
    if (!job && id) {
      const fetchJob = async () => {
        try {
          const data = await getJobById(id);
          setJob(data);
        } catch (error) {
          console.error('Failed to fetch job details:', error);
          toast.error('Failed to load job details');
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    } else {
      setLoading(false);
    }
  }, [id, job]);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setCustomResumeFile(file || null);
  };

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!job) return;

    setSubmitting(true);
    try {
      let manual_resume_name = null;
      let manual_resume_data = null;

      if (customResumeFile) {
        manual_resume_name = customResumeFile.name;
        manual_resume_data = await readFileAsBase64(customResumeFile);
      }

      const details = {
        availability,
        resume_option: customResumeFile ? 'custom' : 'existing',
        manual_resume_name,
        manual_resume_data,
        cover_letter: coverLetter,
      };

      await applyJob(job.job_id, details);
      toast.success('Application submitted');
      navigate('/applications');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner" />
      </div>
    );
  }

  if (!job) {
    return <div className="empty-state">Job not found.</div>;
  }

  // parse potential JSON description
  let parsedDesc = {};
  try {
    if (job.description && typeof job.description === 'string' && job.description.startsWith('{')) {
      parsedDesc = JSON.parse(job.description);
    }
  } catch (e) {
    parsedDesc = {};
  }

  const descriptionText = parsedDesc.description || job.description || '';
  const salaryMin = parsedDesc.salary_min || job.salary_min || '';
  const salaryMax = parsedDesc.salary_max || job.salary_max || '';
  const duration = parsedDesc.duration || job.duration || '';

  return (
    <>
      <div className="opportunities-page">
      <div className="opportunities-container">
        <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
          ← Back
        </button>

        <div className="opportunity-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="main-title">{job.title}</h1>
            <h3 className="company-name">{job.company_name}</h3>
            <div style={{ marginTop: '8px', color: '#666' }}>
              <span style={{ marginRight: 12 }}>📍 {job.location || 'Location not specified'}</span>
              <span style={{ marginRight: 12 }}>💼 {job.job_type === 'internship' ? 'Internship' : 'Job'}</span>
              <span>📅 {duration || 'Not specified'}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              {salaryMin && salaryMax ? `₹ ${salaryMin} - ₹ ${salaryMax} / month` : 'Salary not disclosed'}
            </div>
            <div style={{ marginTop: 8 }}>
              <button className="apply-btn" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                Apply for this opportunity
              </button>
            </div>
          </div>
        </div>

        <div className="job-details" style={{ marginTop: '1.5rem' }}>
          <section className="section">
            <h3>Role Overview</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{parsedDesc.role_overview || parsedDesc.description || descriptionText || 'No overview provided.'}</p>
          </section>

          <section className="section">
            <h3>Requirements</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{parsedDesc.requirements || job.skills_required || 'No requirements specified.'}</p>
          </section>

          <section className="section">
            <h3>Additional Information</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{parsedDesc.additional_information || job.additional_information || 'No additional information.'}</p>
          </section>

          <section className="section">
            <h3>About {job.company_name}</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{parsedDesc.about_company || job.company_description || 'No company information provided.'}</p>
          </section>

          <section className="section" style={{ marginTop: 20 }}>
            <h3>Apply now</h3>

            <div className="apply-form" style={{ marginTop: 8 }}>
              <form onSubmit={handleSubmitApplication}>
                <div className="form-group">
                  <label>Cover letter</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Mention relevant skills or past experience you have for this opportunity"
                    rows={5}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm your availability</label>
                  <div>
                    <label style={{ display: 'block' }}>
                      <input type="radio" name="availability" checked={availability === 'immediately'} onChange={() => setAvailability('immediately')} />{' '}
                      Yes, I am available to join immediately
                    </label>
                    <label style={{ display: 'block' }}>
                      <input type="radio" name="availability" checked={availability === 'notice'} onChange={() => setAvailability('notice')} />{' '}
                      No, I am currently on notice period
                    </label>
                    <label style={{ display: 'block' }}>
                      <input type="radio" name="availability" checked={availability === 'other'} onChange={() => setAvailability('other')} />{' '}
                      Other
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Custom resume (optional)</label>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                  {customResumeFile && <div style={{ marginTop: 6 }}>{customResumeFile.name}</div>}
                </div>

                <div style={{ marginTop: 12 }}>
                  <button className="apply-btn" type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
    <PlacementStories />
    <SimilarJobs />
  </>
  );
}
