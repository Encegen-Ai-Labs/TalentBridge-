import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    setIsLoggedIn(!!token);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  // Close dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close notification dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Load notifications when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  const handleNotifClick = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setIsLoggedIn(false);
    setUser(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);

    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
const handleSearch = (e) => {
  if (e.key === 'Enter' && searchQuery.trim()) {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  }
};
  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">

          {/* LOGO */}
          <Link to="/" className="navbar-logo">
            <span className="logo-text">Talent Bridge</span>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="navbar-links">

            {isLoggedIn && user?.role === 'company' ? (
              <>
                <Link to="/company/dashboard" className="nav-link">
                  Dashboard
                </Link>

                <Link to="/company/post-job" className="nav-link">
                  Post a Job
                </Link>

                <Link to="/company/applicants" className="nav-link">
                  Applicants
                </Link>

                
              </>
            ) : (
              <>
                <Link to="/internships" className="nav-link">
                  Internships
                </Link>

                <Link to="/jobs" className="nav-link">
                  Jobs
                </Link>

                <Link to="/contact-us" className="nav-link">
                  Contact Us
                </Link>
              </>
            )}

          </div>

          {/* DESKTOP ACTIONS */}
          <div className="navbar-actions desktop-actions">

            {isLoggedIn ? (
              <>
                {user?.role !== 'company' && (
                  <div className="navbar-search">
                   <input
                      type="text"
                      placeholder="Search internships, jobs..."
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearch}
                     />
                  </div>
                )}

                <div className="notif-menu" ref={notifRef}>

                  <div
                    className="notif-icon"
                    onClick={() => setNotifOpen(!notifOpen)}
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span className="notif-badge">{unreadCount}</span>
                    )}
                  </div>

                  {notifOpen && (
                    <div className="notif-dropdown">

                      <div className="dropdown-header">
                        <strong>Notifications</strong>
                        {unreadCount > 0 && (
                          <button
                            className="mark-all-read-btn"
                            onClick={handleMarkAllRead}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="dropdown-divider"></div>

                      {notifications.length === 0 ? (
                        <div className="notif-empty">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.notification_id}
                            className={`notif-item ${n.is_read ? '' : 'notif-unread'}`}
                            onClick={() => handleNotifClick(n.notification_id)}
                          >
                            {n.message}
                          </div>
                        ))
                      )}

                    </div>
                  )}
                </div>

                <div className="profile-menu" ref={dropdownRef}>

                  <div
                    className="profile-icon"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    👤
                  </div>

                  {dropdownOpen && (
                    <div className="profile-dropdown">

                      <div className="dropdown-header">
                        <strong>{user?.name || 'My Account'}</strong>
                      </div>

                      <div className="dropdown-divider"></div>

                      {user?.role === 'company' ? (
                        <>
                          <Link
                            to="/company/profile"
                            className="dropdown-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Company Profile
                          </Link>

                          <Link
                            to="/company/dashboard"
                            className="dropdown-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Workspace
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/profile"
                            className="dropdown-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            My Profile
                          </Link>

                          <Link
                            to="/edit-resume"
                            className="dropdown-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Edit Resume
                          </Link>

                          <Link
                            to="/edit-preferences"
                            className="dropdown-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Edit Preferences
                          </Link>

                          <Link
                            to="/applications"
                            className="dropdown-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            My Applications
                          </Link>
                        </>
                      )}

                      <div className="dropdown-divider"></div>

                      <button
                        onClick={handleLogout}
                        className="dropdown-item logout-btn"
                      >
                        Logout
                      </button>

                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-buttons">

                <Link to="/login" className="btn-login">
                  Login
                </Link>

                <Link to="/register" className="btn-register">
                  Register
                </Link>

                <Link
                  to="/employer/login"
                  className="btn-employer"
                >
                 For Employers
                </Link>

              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            className="hamburger"
            onClick={() => setMobileMenuOpen(true)}
          >
            ☰
          </button>

        </div>
      </nav>

      {/* OVERLAY */}
      <div
        className={`mobile-overlay ${
          mobileMenuOpen ? 'show-overlay' : ''
        }`}
        onClick={closeMobileMenu}
      ></div>

      {/* MOBILE MENU */}
      <div
        className={`mobile-menu ${
          mobileMenuOpen ? 'mobile-menu-open' : ''
        }`}
      >

        <div className="mobile-menu-header">
          <h2>Menu</h2>

          <button
            className="close-btn"
            onClick={closeMobileMenu}
          >
            ✕
          </button>
        </div>

        <div className="mobile-links">

          {isLoggedIn && user?.role === 'company' ? (
            <>
              <Link to="/company/dashboard" onClick={closeMobileMenu}>
                Dashboard
              </Link>

              <Link to="/company/post-job" onClick={closeMobileMenu}>
                Post a Job
              </Link>

              <Link to="/company/applicants" onClick={closeMobileMenu}>
                Applicants
              </Link>

              <Link to="/company/profile" onClick={closeMobileMenu}>
                Company Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/internships" onClick={closeMobileMenu}>
                Internships
              </Link>

              <Link to="/jobs" onClick={closeMobileMenu}>
                Jobs
              </Link>

              <Link to="/contact-us" onClick={closeMobileMenu}>
                Contact Us
              </Link>
            </>
          )}

          <hr />

          {isLoggedIn ? (
            <>
              <div className="mobile-notif-header">
                <span>Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}</span>
                {unreadCount > 0 && (
                  <button
                    className="mark-all-read-btn"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="notif-empty">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.notification_id}
                    className={`notif-item ${n.is_read ? '' : 'notif-unread'}`}
                    onClick={() => handleNotifClick(n.notification_id)}
                  >
                    {n.message}
                  </div>
                ))
              )}

              <hr />

              {user?.role !== 'company' && (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/edit-resume"
                    onClick={closeMobileMenu}
                  >
                    Edit Resume
                  </Link>

                  <Link
                    to="/edit-preferences"
                    onClick={closeMobileMenu}
                  >
                    Edit Preferences
                  </Link>

                  <Link
                    to="/applications"
                    onClick={closeMobileMenu}
                  >
                    My Applications
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="mobile-logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMobileMenu}>
                Login
              </Link>

              <Link to="/register" onClick={closeMobileMenu}>
                Register
              </Link>

              <Link
                to="/employer/login"
                onClick={closeMobileMenu}
              >
                For Employers
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;