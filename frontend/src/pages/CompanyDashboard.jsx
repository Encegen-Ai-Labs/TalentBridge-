import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import { toast } from 'react-toastify';
import './CompanyDashboard.css';

export default function CompanyDashboard() {
  const [stats, setStats] = useState({
    company_name: '',
    totalJobs: 0,
    totalApplications: 0,
    totalInvites: 0,
    totalHirings: 0,
    recentApplicants: [],
    recentJobs: []
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load logged-in user profile
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch stats
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="company-dashboard-container">
      {/* 1. Header Banner matching the Figma exactly */}
      <div className="dashboard-hero-banner">
        <div className="hero-left">
          <p className="welcome-sub">Welcome To Hire karma</p>
          <h1 className="welcome-title">{user?.name || 'John Doe'}</h1>
        </div>
        <div className="hero-right">
          {/* Custom vector illustration of two people at a desk, matching Figma exactly */}
          <svg className="hero-illustration-svg" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Table */}
            <rect x="120" y="140" width="160" height="8" rx="4" fill="#E2E8F0" />
            <line x1="160" y1="148" x2="160" y2="185" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            <line x1="240" y1="148" x2="240" y2="185" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            <line x1="130" y1="185" x2="190" y2="185" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
            <line x1="210" y1="185" x2="270" y2="185" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />

            {/* Left Character */}
            <circle cx="95" cy="80" r="14" fill="#3B82F6" />
            <path d="M75 135C75 110 84 98 95 98C106 98 115 110 115 135" fill="#3B82F6" />
            {/* Left Character Arms & Desk Laptop */}
            <path d="M100 110 L135 115 L145 135" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="140" y="125" width="22" height="15" rx="2" fill="#64748B" />
            <line x1="140" y1="139" x2="162" y2="139" stroke="#475569" strokeWidth="2" />

            {/* Right Character */}
            <circle cx="305" cy="80" r="14" fill="#10B981" />
            <path d="M285 135C285 110 294 98 305 98C316 98 325 110 325 135" fill="#10B981" />
            {/* Right Character Arms & Desk Laptop */}
            <path d="M300 110 L265 115 L255 135" stroke="#10B981" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="238" y="125" width="22" height="15" rx="2" fill="#64748B" />
            <line x1="238" y1="139" x2="260" y2="139" stroke="#475569" strokeWidth="2" />

            {/* Chat Bubble Overlays */}
            <rect x="70" y="30" width="60" height="25" rx="12" fill="#FFFFFF" fillOpacity="0.25" />
            <polygon points="100,55 106,62 108,55" fill="#FFFFFF" fillOpacity="0.25" />
            <circle cx="88" cy="42" r="3" fill="#FFFFFF" />
            <circle cx="100" cy="42" r="3" fill="#FFFFFF" />
            <circle cx="112" cy="42" r="3" fill="#FFFFFF" />

            <rect x="270" y="30" width="60" height="25" rx="12" fill="#FFFFFF" fillOpacity="0.25" />
            <polygon points="300,55 294,62 292,55" fill="#FFFFFF" fillOpacity="0.25" />
            <circle cx="288" cy="42" r="3" fill="#FFFFFF" />
            <circle cx="300" cy="42" r="3" fill="#FFFFFF" />
            <circle cx="312" cy="42" r="3" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* 2. Metrics Row matching Figma layout exactly */}
      <div className="dashboard-metrics-grid">
        {/* Card 1: Job Posts */}
        <div className="metric-card">
          <div className="metric-info">
            <p className="metric-label">Job Posts</p>
            <h2 className="metric-value">{stats.totalJobs || 0}</h2>
            <span className="metric-trend trend-up">+2.5%</span>
          </div>
          <div className="metric-chart">
            <svg viewBox="0 0 100 40" className="sparkline">
              <path d="M0,35 Q15,30 30,10 T60,25 T90,5 L100,10" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Application */}
        <div className="metric-card">
          <div className="metric-info">
            <p className="metric-label">Total Application</p>
            <h2 className="metric-value">{stats.totalApplications || 0}</h2>
            <span className="metric-trend trend-down">-4.4%</span>
          </div>
          <div className="metric-chart">
            <svg viewBox="0 0 100 40" className="sparkline">
              <path d="M0,10 Q15,8 30,25 T60,15 T90,35 L100,38" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: No of Meetings */}
        <div className="metric-card">
          <div className="metric-info">
            <p className="metric-label">No of Meetings</p>
            <h2 className="metric-value">{stats.totalInvites || 0}</h2>
            <span className="metric-trend trend-up">+1.6%</span>
          </div>
          <div className="metric-chart">
            <svg viewBox="0 0 100 40" className="sparkline">
              <path d="M0,28 Q15,22 30,30 T60,18 T90,12 L100,15" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: No of Hirings */}
        <div className="metric-card">
          <div className="metric-info">
            <p className="metric-label">No of Hirings</p>
            <h2 className="metric-value">{stats.totalHirings || 0}</h2>
            <span className="metric-trend trend-up">+4.5%</span>
          </div>
          <div className="metric-chart">
            <svg viewBox="0 0 100 40" className="sparkline">
              <path d="M0,32 Q15,35 30,20 T60,25 T90,8 L100,5" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Content Splits (Tables & Details) */}
      <div className="dashboard-content-split">
        {/* Left Side: Recent Applications */}
        <div className="dashboard-section-card">
          <div className="section-header">
            <h3>Recent Job Seekers</h3>
            <Link to="/company/applicants" className="view-all-link">View All Applications</Link>
          </div>
          <div className="table-responsive">
            {stats.recentApplicants.length === 0 ? (
              <div className="empty-table-state">
                <p>No job applications received yet.</p>
              </div>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Role Applied</th>
                    <th>Branch</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentApplicants.map((app) => (
                    <tr key={app.application_id}>
                      <td className="candidate-cell">
                        <strong>{app.student_name}</strong>
                        <span>{app.student_email}</span>
                      </td>
                      <td>{app.job_title}</td>
                      <td><span className="branch-badge">{app.branch}</span></td>
                      <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-pill ${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side: Active Jobs */}
        <div className="dashboard-section-card">
          <div className="section-header">
            <h3>Published Opportunities</h3>
            <Link to="/company/post-job" className="btn-post-job-cta">+ Create Opportunity</Link>
          </div>
          <div className="table-responsive">
            {stats.recentJobs.length === 0 ? (
              <div className="empty-table-state">
                <p>You have not posted any opportunities yet.</p>
              </div>
            ) : (
               <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Opportunity</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Applicants</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentJobs.map((job) => (
                    <tr key={job.job_id}>
                      <td className="opportunity-cell">
                        <strong>{job.title}</strong>
                        <span>Posted on {new Date(job.created_at).toLocaleDateString()}</span>
                      </td>
                      <td>{job.job_type}</td>
                      <td>{job.location}</td>
                      <td>
                        <span className="branch-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: '700' }}>
                          {job.applications_count || 0} Applied
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${job.status === 'active' ? 'active' : 'inactive'}`}>
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
