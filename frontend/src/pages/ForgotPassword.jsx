import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/api'; // you may need to implement this API call
import forgotImg from '../assets/forgot_password_illustration.png'; // you can reuse login illustration or add new image
import './ForgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required';
    if (value.startsWith(' ')) return 'Starting spaces are not allowed';
    if (/\s/.test(value)) return 'Spaces are not allowed';
    if (value.length < 3) return 'Minimum 3 characters required';
    if (value.length > 50) return 'Maximum 50 characters allowed';
    const emailRegex = /^[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(value.trim())) return 'Invalid email format';
    return '';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    if (value.startsWith(' ')) return;
    if (value.length > 50) {
      setErrors((prev) => ({ ...prev, email: 'Maximum 50 characters allowed' }));
      return;
    }
    setEmail(value);
    const err = validateEmail(value);
    setErrors((prev) => ({ ...prev, email: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    setErrors({ email: emailError });
    if (emailError) return;
    setLoading(true);
    try {
      await forgotPassword(email); // assume it returns success
      setSent(true);
    } catch (err) {
      setErrors({ email: err.message || 'Failed to send reset link' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* LEFT IMAGE */}
        <div className="auth-illustration">
          <img src={forgotImg} alt="Forgot Password Illustration" />
        </div>
        {/* RIGHT FORM */}
        <div className="auth-form-container">
          <h2 className="auth-title">Forgot Password</h2>
          {sent ? (
            <p className="success-text">A reset link has been sent to your email.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email ID</label>
                <div className="form-input-wrapper">
                  <input
                    type="text"
                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    maxLength={50}
                  />
                </div>
                {errors.email && (
                  <p className="error-text">{errors.email}</p>
                )}
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
          <div className="footer-links">
            <Link to="/login" className="back-to-login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
