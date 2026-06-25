import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyInvites, acceptCompanyInvite, rejectCompanyInvite } from '../services/api';
import { toast } from 'react-toastify';
import './CompanyInvites.css';

const STATUS_COLORS = {
  pending:  { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  accepted: { bg: '#dcfce7', color: '#166534', label: 'Accepted' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
};

export default function CompanyInvites() {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // request_id of in-progress action

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/employer/login'); return; }
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const data = await getCompanyInvites();
      setInvites(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load invites');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (request_id) => {
    setActionLoading(request_id + '_accept');
    try {
      await acceptCompanyInvite(request_id);
      toast.success('Campus drive invitation accepted!');
      setInvites(prev => prev.map(inv =>
        inv.request_id === request_id ? { ...inv, status: 'accepted' } : inv
      ));
    } catch (err) {
      toast.error(err.message || 'Failed to accept invite');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request_id) => {
    setActionLoading(request_id + '_reject');
    try {
      await rejectCompanyInvite(request_id);
      toast.info('Campus drive invitation rejected.');
      setInvites(prev => prev.map(inv =>
        inv.request_id === request_id ? { ...inv, status: 'rejected' } : inv
      ));
    } catch (err) {
      toast.error(err.message || 'Failed to reject invite');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const pending = invites.filter(i => i.status === 'pending');
  const others  = invites.filter(i => i.status !== 'pending');

  if (loading) return (
    <div className="ci-loading">
      <div className="ci-spinner"></div>
      <p>Loading campus invitations...</p>
    </div>
  );

  return (
    <div className="ci-page">
      {/* ─── Page Header ─── */}
      <div className="ci-header">
        <div className="ci-header-inner">
          <div className="ci-breadcrumb">
            <span className="ci-bc-link" onClick={() => navigate('/company/dashboard')}>Dashboard</span>
            <span className="ci-bc-sep">›</span>
            <span className="ci-bc-current">Campus Invitations</span>
          </div>
          <div className="ci-title-row">
            <div>
              <h1 className="ci-title">Campus Drive Invitations</h1>
              <p className="ci-subtitle">
                Colleges are inviting you to participate in campus recruitment drives.
              </p>
            </div>
            <div className="ci-stats-row">
              <div className="ci-stat">
                <span className="ci-stat-num">{invites.length}</span>
                <span className="ci-stat-label">Total</span>
              </div>
              <div className="ci-stat ci-stat--pending">
                <span className="ci-stat-num">{pending.length}</span>
                <span className="ci-stat-label">Pending</span>
              </div>
              <div className="ci-stat ci-stat--accepted">
                <span className="ci-stat-num">{invites.filter(i => i.status === 'accepted').length}</span>
                <span className="ci-stat-label">Accepted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ci-body">
        <div className="ci-body-inner">

          {invites.length === 0 && (
            <div className="ci-empty">
              <div className="ci-empty-icon">🏛️</div>
              <h3>No Invitations Yet</h3>
              <p>When colleges invite you to their campus placement drives, they will appear here.</p>
              <button className="ci-back-btn" onClick={() => navigate('/company/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          )}

          {/* ─── Pending Invites ─── */}
          {pending.length > 0 && (
            <section className="ci-section">
              <div className="ci-section-header">
                <h2 className="ci-section-title">
                  <span className="ci-dot ci-dot--pending"></span>
                  Pending Action
                  <span className="ci-count-badge">{pending.length}</span>
                </h2>
              </div>
              <div className="ci-cards">
                {pending.map(inv => (
                  <InviteCard
                    key={inv.request_id}
                    invite={inv}
                    actionLoading={actionLoading}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ─── Past Invites ─── */}
          {others.length > 0 && (
            <section className="ci-section">
              <div className="ci-section-header">
                <h2 className="ci-section-title">
                  <span className="ci-dot ci-dot--past"></span>
                  Past Invitations
                </h2>
              </div>
              <div className="ci-cards">
                {others.map(inv => (
                  <InviteCard
                    key={inv.request_id}
                    invite={inv}
                    actionLoading={actionLoading}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    formatDate={formatDate}
                    readOnly
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function InviteCard({ invite, actionLoading, onAccept, onReject, formatDate, readOnly }) {
  const statusInfo = STATUS_COLORS[invite.status] || STATUS_COLORS.pending;
  const isAccepting = actionLoading === invite.request_id + '_accept';
  const isRejecting = actionLoading === invite.request_id + '_reject';
  const isAnyLoading = isAccepting || isRejecting;

  return (
    <div className={`ci-card ${readOnly ? 'ci-card--muted' : ''}`} id={`invite-card-${invite.request_id}`}>
      <div className="ci-card-left">
        <div className="ci-college-avatar">
          {(invite.college_name || 'C').charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="ci-card-body">
        <div className="ci-card-top">
          <div>
            <h3 className="ci-college-name">{invite.college_name || 'College Name'}</h3>
            <p className="ci-invite-date">Received: {formatDate(invite.created_at || invite.request_date)}</p>
          </div>
          <span
            className="ci-status-badge"
            style={{ background: statusInfo.bg, color: statusInfo.color }}
          >
            {statusInfo.label}
          </span>
        </div>

        {invite.message && (
          <div className="ci-message-box">
            <p className="ci-message-label">Message from College:</p>
            <p className="ci-message-text">"{invite.message}"</p>
          </div>
        )}

        {!readOnly && invite.status === 'pending' && (
          <div className="ci-actions">
            <button
              className="ci-btn ci-btn--accept"
              onClick={() => onAccept(invite.request_id)}
              disabled={isAnyLoading}
              id={`accept-btn-${invite.request_id}`}
            >
              {isAccepting ? (
                <><span className="ci-btn-spinner"></span> Accepting...</>
              ) : '✓ Accept Invitation'}
            </button>
            <button
              className="ci-btn ci-btn--reject"
              onClick={() => onReject(invite.request_id)}
              disabled={isAnyLoading}
              id={`reject-btn-${invite.request_id}`}
            >
              {isRejecting ? (
                <><span className="ci-btn-spinner"></span> Rejecting...</>
              ) : '✕ Decline'}
            </button>
          </div>
        )}

        {readOnly && invite.status === 'accepted' && (
          <p className="ci-accepted-note">
            ✓ You accepted this invitation. The college will follow up with campus drive details.
          </p>
        )}
      </div>
    </div>
  );
}
