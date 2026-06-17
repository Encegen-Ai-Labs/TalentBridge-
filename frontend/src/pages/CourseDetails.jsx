import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesData } from '../data/coursesData';
import './CourseDetails.css';

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    // Find the course by ID
    const foundCourse = coursesData.find(c => c.id === parseInt(courseId));
    if (foundCourse) {
      setCourse(foundCourse);
      window.scrollTo(0, 0);
    } else {
      navigate('/');
    }
  }, [courseId, navigate]);

  const handleEnroll = () => {
    setIsEnrolled(true);
    // Show success message
    const enrollmentModal = document.querySelector('.enrollment-success');
    if (enrollmentModal) {
      enrollmentModal.style.display = 'flex';
      setTimeout(() => {
        enrollmentModal.style.display = 'none';
      }, 3000);
    }
  };

  if (!course) {
    return <div className="loading-container">Loading course details...</div>;
  }

  return (
    <div className="course-details-page">
      {/* Header Banner */}
      <div className={`course-header-banner ${course.gradient}`}>
        <div className="course-header-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="course-header-content">
            <div className="course-header-top">
              <span className="course-badge">{course.badge}</span>
              <span className="course-duration">⏱ {course.duration}</span>
            </div>
            <h1 className="course-title-main">{course.title}</h1>
            <div className="course-header-meta">
              <span className="course-rating-large">⭐ {course.rating} ({course.reviews.toLocaleString()} reviews)</span>
              <span className="course-category">Category: {course.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="course-content-wrapper">
        <div className="course-content-grid">
          {/* Left: Course Content */}
          <div className="course-main-content">
            <div className="course-markdown-content">
              {course.fullContent.split('\n\n').map((section, index) => {
                // Handle different section types
                if (section.startsWith('# ')) {
                  const title = section.replace('# ', '').trim();
                  return <h1 key={index} className="section-h1">{title}</h1>;
                }
                if (section.startsWith('## ')) {
                  const title = section.replace('## ', '').trim();
                  return <h2 key={index} className="section-h2">{title}</h2>;
                }
                if (section.startsWith('### ')) {
                  const title = section.replace('### ', '').trim();
                  return <h3 key={index} className="section-h3">{title}</h3>;
                }
                if (section.startsWith('- ')) {
                  const items = section.split('\n').filter(item => item.startsWith('- '));
                  return (
                    <ul key={index} className="content-list">
                      {items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item.replace('- ', '').trim()}</li>
                      ))}
                    </ul>
                  );
                }
                if (section.startsWith('✔')) {
                  const items = section.split('\n').filter(item => item.startsWith('✔'));
                  return (
                    <ul key={index} className="checkmark-list">
                      {items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item.replace('✔ ', '').trim()}</li>
                      ))}
                    </ul>
                  );
                }
                if (section.trim().startsWith('---')) {
                  return <hr key={index} className="section-divider" />;
                }
                
                return (
                  <p key={index} className="content-paragraph">
                    {section.trim()}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="course-sidebar">
            <div className="sidebar-card enrollment-card">
              <div className="card-header">
                <span className="card-title">Enroll Now</span>
              </div>
              <div className="enrollment-content">
                <div className="price-section">
                  <span className="price-label">Course Fee</span>
                  <span className="discount-badge">50% OFF - Limited Time</span>
                  <span className="price-amount">₹ 4,999</span>
                  <span className="price-original">₹ 9,999</span>
                </div>
                <button 
                  className={`enroll-button ${isEnrolled ? 'enrolled' : ''}`}
                  onClick={handleEnroll}
                  disabled={isEnrolled}
                >
                  {isEnrolled ? '✓ Enrolled' : 'Enroll Now'}
                </button>
                <p className="enroll-info">💳 Easy EMI from ₹ 833/month</p>
                <div className="money-back">
                  ✓ 30-Day Money Back Guarantee
                </div>
              </div>
            </div>

            <div className="sidebar-card course-highlights">
              <h3 className="sidebar-title">🎯 What You Get</h3>
              <ul className="highlights-list">
                <li>
                  <span className="highlight-icon">📚</span>
                  <span>80+ Hours of Content</span>
                </li>
                <li>
                  <span className="highlight-icon">🎓</span>
                  <span>Expert Instructor</span>
                </li>
                <li>
                  <span className="highlight-icon">💻</span>
                  <span>12+ Real-World Projects</span>
                </li>
                <li>
                  <span className="highlight-icon">📜</span>
                  <span>Industry Certificate</span>
                </li>
                <li>
                  <span className="highlight-icon">🔒</span>
                  <span>Lifetime Access</span>
                </li>
                <li>
                  <span className="highlight-icon">💼</span>
                  <span>Job Placement Support</span>
                </li>
                <li>
                  <span className="highlight-icon">📱</span>
                  <span>Mobile & Desktop Access</span>
                </li>
                <li>
                  <span className="highlight-icon">👥</span>
                  <span>Community Support</span>
                </li>
              </ul>
            </div>

            <div className="sidebar-card course-stats">
              <h3 className="sidebar-title">📈 Course Impact</h3>
              <div className="stats-item">
                <span className="stat-label">Students Enrolled:</span>
                <span className="stat-value">{(course.reviews * 2).toLocaleString()}+</span>
              </div>
              <div className="stats-item">
                <span className="stat-label">Success Rate:</span>
                <span className="stat-value">94%</span>
              </div>
              <div className="stats-item">
                <span className="stat-label">Avg. Rating:</span>
                <span className="stat-value">⭐ {course.rating}</span>
              </div>
              <div className="stats-item">
                <span className="stat-label">Avg. Salary Hike:</span>
                <span className="stat-value">42%</span>
              </div>
            </div>

            <div className="sidebar-card course-contact">
              <h3 className="sidebar-title">❓ Need Help?</h3>
              <p className="contact-text">Our support team is here to help</p>
              <button className="contact-button">📧 Contact Support</button>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Success Modal */}
      <div className="enrollment-success">
        <div className="success-message">
          <span className="success-icon">✓</span>
          <p>Successfully enrolled in {course.title}!</p>
        </div>
      </div>
    </div>
  );
}
