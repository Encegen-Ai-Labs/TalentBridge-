// StudentOpportunities.jsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  getAllJobs,
  getCompanyInternships,
} from '../services/api';

import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

import './StudentOpportunities.css';

export default function StudentOpportunities() {
  const navigate = useNavigate();
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // DEFAULT ACTIVE
  const [activeFilter, setActiveFilter] =
    useState('All');

  // FILTER BUTTONS
  const filterPills = [
    'All',
    'Big brands',
    'Work from home',
    'Part-time',
    'Engineering',
    'Media',
    'Design',
    'Data Science',
  ];

  // FETCH JOBS
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const isInternshipPage =
          location.pathname === '/internships';

        const data = isInternshipPage
          ? await getCompanyInternships()
          : await getAllJobs();

        console.log('BACKEND JOBS:', data);

        setJobs(data || []);
      } catch (error) {
        console.error(error);

        toast.error(
          'Failed to load opportunities'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [location.pathname]);

  // PARSE BACKEND DATA
  const parseJobInfo = (job) => {
    let salaryMin = '';
    let salaryMax = '';
    let duration = '';
    let category = '';
    let rawDesc = '';

    try {
      if (
        job.description &&
        typeof job.description ===
          'string' &&
        job.description.startsWith('{')
      ) {
        const parsed = JSON.parse(
          job.description
        );

        salaryMin =
          parsed.salary_min ||
          job.salary_min ||
          '';

        salaryMax =
          parsed.salary_max ||
          job.salary_max ||
          '';

        duration =
          parsed.duration ||
          job.duration ||
          '';

        category =
          parsed.category ||
          job.category ||
          '';

        rawDesc =
          parsed.description || '';
      } else {
        salaryMin =
          job.salary_min || '';

        salaryMax =
          job.salary_max || '';

        duration =
          job.duration || '';

        category =
          job.category || '';

        rawDesc =
          job.description || '';
      }
    } catch (err) {
      console.log(err);

      salaryMin = job.salary_min || '';
      salaryMax = job.salary_max || '';
      duration = job.duration || '';
      category = job.category || '';
      rawDesc = job.description || '';
    }

    return {
      salaryMin,
      salaryMax,
      duration,
      category,
      rawDesc,
    };
  };

  // FILTER LOGIC
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const info = parseJobInfo(job);

      // ALL
      if (activeFilter === 'All') {
        return true;
      }

      // WORK FROM HOME
      if (activeFilter === 'Work from home') {
        return (
          job.location
            ?.toLowerCase()
            .includes('remote') ||
          job.location
            ?.toLowerCase()
            .includes('home')
        );
      }

      // PART TIME
      if (activeFilter === 'Part-time') {
        return (
          job.job_type === 'internship'
        );
      }

      // ENGINEERING
      if (activeFilter === 'Engineering') {
        return (
          info.category === 'Engineering'
        );
      }

      // DESIGN
      if (activeFilter === 'Design') {
        return info.category === 'Design';
      }

      // MEDIA
      if (activeFilter === 'Media') {
        return info.category === 'Media';
      }

      // DATA SCIENCE
      if (
        activeFilter === 'Data Science'
      ) {
        return (
          info.category === 'Data Science'
        );
      }

      // BIG BRANDS
      if (activeFilter === 'Big brands') {
        return (
          job.company_name
            ?.toLowerCase()
            .includes('vanguard') ||
          job.company_name
            ?.toLowerCase()
            .includes('visa') ||
          job.company_name
            ?.toLowerCase()
            .includes('amazon') ||
          job.company_name
            ?.toLowerCase()
            .includes('google') ||
          job.company_name
            ?.toLowerCase()
            .includes('microsoft')
        );
      }

      return true;
    });
  }, [jobs, activeFilter]);

  // REDIRECT TO DETAILS PAGE
  const handleViewDetails = (job) => {
    navigate(`/opportunity/${job.job_id}`, {
      state: {
        job,
      },
    });
  };

  // LOADING
  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="opportunities-page">

      <div className="opportunities-container">

        {/* TITLE */}
        <h1 className="main-title">
          Fresher Jobs
        </h1>

        {/* FILTERS */}
        <div className="filters-row">

          {filterPills.map((pill) => (
            <button
              key={pill}
              className={`filter-pill ${
                activeFilter === pill
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveFilter(pill)
              }
            >
              {pill}
            </button>
          ))}
        </div>

        {/* JOBS GRID */}
        <div className="jobs-grid">

          {filteredJobs.length === 0 ? (
            <div className="empty-state">
              No opportunities found
            </div>
          ) : (
            filteredJobs.map(
              (job, index) => {
                const info =
                  parseJobInfo(job);

                const firstLetter =
                  job.company_name?.charAt(
                    0
                  ) || 'C';

                return (
                  <div
                    key={job.job_id}
                    className="job-card"
                  >
                    {/* TOP */}
                    <div className="card-top">

                      <div className="hiring-badge">
                        Actively Hiring
                      </div>

                      <div
                        className={`company-logo color-${index % 3}`}
                      >
                        {firstLetter}
                      </div>
                    </div>

                    {/* TITLE */}
                    <div className="job-info">

                      <h3>{job.title}</h3>

                      <p className="company-name">
                        {job.company_name ||
                          'Company'}
                      </p>
                    </div>

                    {/* DETAILS */}
                    <div className="details-list">

                      <div className="detail-row">
                        <span>📍</span>

                        <span>
                          {job.location ||
                            'Location not specified'}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span>₹</span>

                        <span>
                          {info.salaryMin &&
                          info.salaryMax
                            ? `₹ ${info.salaryMin} - ${info.salaryMax} / month`
                            : 'Salary not disclosed'}
                        </span>
                      </div>

                      <div className="detail-row">
                        <span>📅</span>

                        <span>
                          {info.duration ||
                            'Not specified'}
                        </span>
                      </div>
                    </div>

                    {/* JOB TYPE */}
                    <div className="job-tag">
                      {job.job_type ===
                      'internship'
                        ? 'Internship'
                        : 'Job'}
                    </div>

                    {/* BUTTON */}
                    <div className="card-footer">

                      <button
                        className="view-btn"
                        onClick={() =>
                          handleViewDetails(
                            job
                          )
                        }
                      >
                        View details
                      </button>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>
    </div>
  );
}