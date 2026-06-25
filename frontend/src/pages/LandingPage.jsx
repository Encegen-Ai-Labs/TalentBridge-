import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

const STATS = [
  { value: '50K+', label: 'Active Jobs' },
  { value: '12K+', label: 'Companies' },
  { value: '200K+', label: 'Students Placed' },
  { value: '95%', label: 'Success Rate' },
];

const FEATURES = [
  {
    icon: '🎯',
    title: 'Smart Job Matching',
    desc: 'AI-powered recommendations based on your skills, preferences, and profile.',
  },
  {
    icon: '🏢',
    title: 'Top Companies',
    desc: 'Get discovered by MNCs, startups, and high-growth companies hiring right now.',
  },
  {
    icon: '📄',
    title: 'Resume Builder',
    desc: 'Build a professional resume in minutes and stand out from the crowd.',
  },
  {
    icon: '🎓',
    title: 'For Freshers',
    desc: 'Special internship and entry-level opportunities curated for students.',
  },
  {
    icon: '🏛️',
    title: 'Campus Drives',
    desc: 'Companies visit your college. Stay updated on all campus recruitment drives.',
  },
  {
    icon: '📊',
    title: 'Track Applications',
    desc: 'Monitor application status, get interview updates and feedback in real-time.',
  },
];

const POPULAR_ROLES = [
  'Software Engineer', 'Data Analyst', 'Product Manager',
  'Marketing Intern', 'UI/UX Designer', 'Business Development',
  'Finance Analyst', 'Content Writer', 'Full Stack Developer',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % STATS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="lp-page">

      {/* ─── Hero Section ─── */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-hero-circle lp-hero-circle--1"></div>
          <div className="lp-hero-circle lp-hero-circle--2"></div>
          <div className="lp-hero-circle lp-hero-circle--3"></div>
        </div>
        <div className="lp-hero-inner">
          <div className="lp-hero-badge">🚀 India's #1 Job Portal for Freshers</div>
          <h1 className="lp-hero-title">
            Find Your Dream
            <span className="lp-hero-title--green"> Internship</span> or
            <span className="lp-hero-title--green"> Job</span>
          </h1>
          <p className="lp-hero-desc">
            Connect with 12,000+ companies. Apply to internships and jobs tailored to your skills. Start your career journey today.
          </p>

          {/* Search Bar */}
          <form className="lp-search" onSubmit={handleSearch}>
            <div className="lp-search-input-wrap">
              <svg className="lp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                id="lp-search-input"
                type="text"
                className="lp-search-input"
                placeholder="Search by role, skill, or company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="lp-search-btn" id="lp-search-submit">Search Jobs</button>
          </form>

          {/* Quick Links */}
          <div className="lp-hero-links">
            <span className="lp-hero-links-label">Popular:</span>
            {['React Developer', 'Data Science', 'Marketing Intern', 'Product Manager'].map(role => (
              <button key={role} className="lp-hero-tag" onClick={() => navigate(`/search?q=${encodeURIComponent(role)}`)}>
                {role}
              </button>
            ))}
          </div>

          {/* Hero CTAs */}
          <div className="lp-hero-ctas">
            <Link to="/register" className="lp-cta-primary" id="lp-register-btn">
              Get Started Free →
            </Link>
            <Link to="/internships" className="lp-cta-secondary" id="lp-browse-btn">
              Browse Internships
            </Link>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="lp-hero-stats">
          {STATS.map((stat, i) => (
            <div key={i} className={`lp-stat-card ${currentStat === i ? 'lp-stat-card--active' : ''}`}>
              <span className="lp-stat-value">{stat.value}</span>
              <span className="lp-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="lp-how">
        <div className="lp-section-inner">
          <div className="lp-section-badge">How It Works</div>
          <h2 className="lp-section-title">Land your dream job in 3 simple steps</h2>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">1</div>
              <div className="lp-step-icon">👤</div>
              <h3>Create Your Profile</h3>
              <p>Sign up and build a compelling profile with your skills, experience, and resume.</p>
            </div>
            <div className="lp-step-arrow">→</div>
            <div className="lp-step">
              <div className="lp-step-num">2</div>
              <div className="lp-step-icon">🔍</div>
              <h3>Discover Opportunities</h3>
              <p>Browse thousands of jobs and internships. Filter by location, role, and salary.</p>
            </div>
            <div className="lp-step-arrow">→</div>
            <div className="lp-step">
              <div className="lp-step-num">3</div>
              <div className="lp-step-icon">✉️</div>
              <h3>Apply & Get Hired</h3>
              <p>One-click apply with your profile. Track status and get interview calls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="lp-features">
        <div className="lp-section-inner">
          <div className="lp-section-badge">Features</div>
          <h2 className="lp-section-title">Everything you need to kickstart your career</h2>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Popular Roles ─── */}
      <section className="lp-roles">
        <div className="lp-section-inner">
          <div className="lp-section-badge">Explore</div>
          <h2 className="lp-section-title">Browse by Popular Roles</h2>
          <div className="lp-roles-grid">
            {POPULAR_ROLES.map((role, i) => (
              <button
                key={i}
                className="lp-role-card"
                onClick={() => navigate(`/search?q=${encodeURIComponent(role)}`)}
                id={`role-card-${i}`}
              >
                <span className="lp-role-name">{role}</span>
                <span className="lp-role-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Dual CTA ─── */}
      <section className="lp-dual-cta">
        <div className="lp-section-inner">
          <div className="lp-dual-cta-grid">
            {/* Student */}
            <div className="lp-cta-card lp-cta-card--student">
              <div className="lp-cta-card-icon">🎓</div>
              <h3>For Students & Job Seekers</h3>
              <p>Access thousands of internships and jobs. Build your profile, apply in one click.</p>
              <Link to="/register" className="lp-cta-card-btn lp-cta-card-btn--green" id="student-cta-btn">
                Register as Student →
              </Link>
            </div>
            {/* Company */}
            <div className="lp-cta-card lp-cta-card--company">
              <div className="lp-cta-card-icon">🏢</div>
              <h3>For Companies & Recruiters</h3>
              <p>Post jobs, find top talent, manage applicants and conduct campus drives.</p>
              <Link to="/employer/register" className="lp-cta-card-btn lp-cta-card-btn--dark" id="employer-cta-btn">
                Post a Job →
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
