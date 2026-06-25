import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyApplications } from '../services/api';
import { toast } from 'react-toastify';
import './MyApplications.css';

export default function MyApplications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    selected: 0,
    rejected: 0,
    updates: 0
  });

  const [proFeatures] = useState({
    hasPro: false,
    feedbackCount: 2,
    boostCount: 2,
    resetDays: 30
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getMyApplications();
      console.log('Applications response:', response);
      
      let apps = [];
      if (response && response.data) {
        apps = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        apps = response;
      }
      
      setApplications(apps);
      
      const statsData = {
        total: apps.length,
        active: apps.filter(a => {
          const status = a.status?.toLowerCase() || '';
          return ['applied', 'shortlisted', 'pending', 'in review', 'interview', 'application sent'].includes(status);
        }).length,
        selected: apps.filter(a => {
          const status = a.status?.toLowerCase() || '';
          return ['selected', 'hired', 'offered', 'accepted'].includes(status);
        }).length,
        rejected: apps.filter(a => {
          const status = a.status?.toLowerCase() || '';
          return ['rejected', 'declined', 'not selected'].includes(status);
        }).length,
        updates: apps.filter(a => a.has_update || a.status === 'shortlisted').length
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredApplications = () => {
    if (filter === 'all') return applications;
    if (filter === 'active') {
      return applications.filter(a => {
        const status = a.status?.toLowerCase() || '';
        return ['applied', 'shortlisted', 'pending', 'in review', 'interview', 'application sent'].includes(status);
      });
    }
    if (filter === 'selected') {
      return applications.filter(a => {
        const status = a.status?.toLowerCase() || '';
        return ['selected', 'hired', 'offered', 'accepted'].includes(status);
      });
    }
    if (filter === 'rejected') {
      return applications.filter(a => {
        const status = a.status?.toLowerCase() || '';
        return ['rejected', 'declined', 'not selected'].includes(status);
      });
    }
    return applications;
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (['applied', 'pending', 'application sent'].includes(s)) return 'status-applied';
    if (['shortlisted', 'in review', 'interview'].includes(s)) return 'status-shortlisted';
    if (['selected', 'hired', 'offered', 'accepted'].includes(s)) return 'status-selected';
    if (['rejected', 'declined', 'not selected'].includes(s)) return 'status-rejected';
    return 'status-pending';
  };

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase() || '';
    if (['applied', 'pending', 'application sent'].includes(s)) return '📤';
    if (['shortlisted', 'in review', 'interview'].includes(s)) return '⏳';
    if (['selected', 'hired', 'offered', 'accepted'].includes(s)) return '✅';
    if (['rejected', 'declined', 'not selected'].includes(s)) return '❌';
    return '📌';
  };

  const getStatusLabel = (status) => {
    const s = status?.toLowerCase() || '';
    if (['applied', 'pending', 'application sent'].includes(s)) return 'APPLIED';
    if (['shortlisted', 'in review'].includes(s)) return 'SHORTLISTED';
    if (['interview'].includes(s)) return 'INTERVIEW';
    if (['selected', 'hired', 'offered', 'accepted'].includes(s)) return 'SELECTED';
    if (['rejected', 'declined', 'not selected'].includes(s)) return 'REJECTED';
    return status?.toUpperCase() || 'PENDING';
  };

  const getMatchPercentage = (app) => {
    if (app.match_score) return app.match_score;
    if (app.match_percentage) return app.match_percentage;
    // Demo match scores
    const matches = {
      'AI ml developer': 90,
      'Junior Web Developer': 86,
      'Content Marketing': 79,
      'Graphic Designer': 85,
      'Creative Designer': 82
    };
    return matches[app.title] || Math.floor(Math.random() * 30) + 60;
  };

  const handleViewDetails = (app) => {
    setSelectedApp(app);
    setShowDetailView(true);
  };

  const handleCloseDetail = () => {
    setShowDetailView(false);
    setSelectedApp(null);
  };

  const handleStartChat = (app) => {
    if (!proFeatures.hasPro) {
      toast.info('Upgrade to PRO to unlock recruiter chat');
      return;
    }
    toast.info('Chat feature coming soon!');
  };

  if (loading) {
    return (
      <div className="ma-loading">
        <div className="ma-spinner"></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  const filteredApps = getFilteredApplications();

  return (
    <div className="ma-container">
      {/* Header with Stats */}
      <div className="ma-header">
        <h1 className="ma-title">My Applications</h1>
      </div>

      {/* Stats Grid */}
      <div className="ma-stats-grid">
        <div className="ma-stat-card">
          <div className="ma-stat-number">{stats.total}</div>
          <div className="ma-stat-label">TOTAL</div>
        </div>
        <div className="ma-stat-card active">
          <div className="ma-stat-number">{stats.active}</div>
          <div className="ma-stat-label">ACTIVE</div>
        </div>
        <div className="ma-stat-card selected">
          <div className="ma-stat-number">{stats.selected}</div>
          <div className="ma-stat-label">SELECTED</div>
        </div>
        <div className="ma-stat-card rejected">
          <div className="ma-stat-number">{stats.rejected}</div>
          <div className="ma-stat-label">REJECTED</div>
        </div>
      </div>

      {/* PRO Banner */}
      <div className="ma-pro-banner">
        <div className="ma-pro-content">
          <div className="ma-pro-left">
            <span className="ma-pro-icon">⭐</span>
            <span className="ma-pro-text">
              <span className="ma-pro-title">Unlock recruiter chat:</span>
              <span className="ma-pro-status">+ PRO only</span>
            </span>
          </div>
          <div className="ma-pro-features">
            <span className="ma-pro-feature">
              <span className="ma-pro-feature-icon">📝</span>
              Application feedback: <strong>{proFeatures.feedbackCount}/2</strong>
            </span>
            <span className="ma-pro-feature">
              <span className="ma-pro-feature-icon">🚀</span>
              Application boost: <strong>{proFeatures.boostCount}/2</strong>
            </span>
            <span className="ma-pro-feature">
              <span className="ma-pro-feature-icon">🔄</span>
              Resets in <strong>{proFeatures.resetDays} days</strong>
            </span>
          </div>
          <button className="ma-pro-btn">Upgrade to PRO</button>
        </div>
      </div>

      {/* Filters */}
      <div className="ma-filters">
        <button 
          className={`ma-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </button>
        <button 
          className={`ma-filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({stats.active})
        </button>
        <button 
          className={`ma-filter-btn ${filter === 'selected' ? 'active' : ''}`}
          onClick={() => setFilter('selected')}
        >
          Selected ({stats.selected})
        </button>
        <button 
          className={`ma-filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {/* Applications List */}
      <div className="ma-list">
        {filteredApps.length === 0 ? (
          <div className="ma-empty">
            <div className="ma-empty-icon">📭</div>
            <p className="ma-empty-title">No applications found</p>
            <p className="ma-empty-subtitle">Start applying to jobs and track them here</p>
            <Link to="/jobs" className="ma-empty-btn">Browse Jobs →</Link>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div 
              key={app.application_id || app.id} 
              className="ma-item"
              onClick={() => handleViewDetails(app)}
            >
              <div className="ma-item-left">
                <h3 className="ma-item-title">{app.title || 'Job Title'}</h3>
                <span className="ma-item-company">{app.company_name || 'Company'}</span>
                <div className="ma-item-meta">
                  <span className="ma-date">
                    Applied on {app.applied_at || app.created_at 
                      ? new Date(app.applied_at || app.created_at).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: '2-digit' 
                        })
                      : 'N/A'}
                  </span>
                  <span className="ma-match">{getMatchPercentage(app)}% Match</span>
                </div>
              </div>
              <div className="ma-item-right">
                <span className={`ma-status-badge ${getStatusColor(app.status)}`}>
                  {getStatusIcon(app.status)} {getStatusLabel(app.status)}
                </span>
                <button 
                  className="ma-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartChat(app);
                  }}
                >
                  Start chat
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail View Modal - Matches the second image */}
      {showDetailView && selectedApp && (
        <div className="ma-modal-overlay" onClick={handleCloseDetail}>
          <div className="ma-modal-detail" onClick={(e) => e.stopPropagation()}>
            <button className="ma-modal-close" onClick={handleCloseDetail}>✕</button>
            
            <div className="ma-modal-body">
              {/* Company Header */}
              <div className="ma-detail-header">
                <h2 className="ma-detail-title">{selectedApp.title}</h2>
                <div className="ma-detail-company">
                  <span className="ma-company-name">{selectedApp.company_name}</span>
                  <div className="ma-company-rating">
                    <span className="ma-rating-stars">★★★★☆</span>
                    <span className="ma-rating-text">4.2</span>
                    <span className="ma-rating-reviews">3 Reviews</span>
                  </div>
                </div>
                <Link to="#" className="ma-similar-link">View similar jobs →</Link>
              </div>

              {/* Application Status Timeline */}
              <div className="ma-detail-section">
                <h4 className="ma-section-title">Application status</h4>
                <div className="ma-status-timeline">
                  <div className="ma-timeline-item">
                    <div className="ma-timeline-dot completed"></div>
                    <div>
                      <div className="ma-timeline-label">Applied</div>
                      <div className="ma-timeline-date">
                        {selectedApp.applied_at 
                          ? new Date(selectedApp.applied_at).toLocaleDateString('en-IN', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: '2-digit' 
                            })
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="ma-timeline-item">
                    <div className="ma-timeline-dot completed"></div>
                    <div>
                      <div className="ma-timeline-label">Application Sent</div>
                      <div className="ma-timeline-date">
                        {selectedApp.applied_at 
                          ? new Date(selectedApp.applied_at).toLocaleDateString('en-IN', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: '2-digit' 
                            })
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="ma-timeline-item">
                    <div className={`ma-timeline-dot ${selectedApp.status === 'rejected' ? 'rejected' : 'pending'}`}></div>
                    <div>
                      <div className="ma-timeline-label">
                        {selectedApp.status === 'rejected' ? 'Application Rejected' : 'Awaiting Recruiter Action'}
                      </div>
                      <div className="ma-timeline-date">
                        {selectedApp.status === 'rejected' ? 'Not selected' : 'In progress'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="ma-detail-stats">
                <div className="ma-detail-stat-box">
                  <span className="ma-stat-box-number">177</span>
                  <span className="ma-stat-box-label">TOTAL APPLICATIONS</span>
                </div>
                <div className="ma-detail-stat-box">
                  <span className="ma-stat-box-number">00</span>
                  <span className="ma-stat-box-label">APPLICATIONS VIEWED BY RECRUITER</span>
                </div>
              </div>

              {/* Match Criteria */}
              <div className="ma-detail-section">
                <h4 className="ma-section-title">What may work for you?</h4>
                <p className="ma-match-subtitle">Following criteria suggests how well you match with the job.</p>
                <div className="ma-match-grid">
                  <div className="ma-match-item">
                    <span className="ma-match-check">✅</span>
                    <span>Early Applicant</span>
                  </div>
                  <div className="ma-match-item">
                    <span className="ma-match-check">✅</span>
                    <span>Keyskills</span>
                  </div>
                  <div className="ma-match-item">
                    <span className="ma-match-check">✅</span>
                    <span>Location</span>
                  </div>
                  <div className="ma-match-item">
                    <span className="ma-match-check">❌</span>
                    <span>Work Experience</span>
                  </div>
                  <div className="ma-match-item">
                    <span className="ma-match-check">❌</span>
                    <span>Industry</span>
                  </div>
                  <div className="ma-match-item">
                    <span className="ma-match-check">❌</span>
                    <span>Department</span>
                  </div>
                </div>
              </div>

              {/* Bottom Stats */}
              <div className="ma-detail-footer-stats">
                <div className="ma-footer-stat">
                  <span className="ma-footer-number">{stats.total}</span>
                  <span className="ma-footer-label">Total applies</span>
                </div>
                <div className="ma-footer-stat">
                  <span className="ma-footer-number">{stats.updates}</span>
                  <span className="ma-footer-label">Application updates</span>
                </div>
              </div>

              <button className="ma-modal-action">Detail View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}