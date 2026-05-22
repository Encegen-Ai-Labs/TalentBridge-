import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { toast } from 'react-toastify';
import loginImg from '../assets/login_illustration.png';
import './EmployerLogin.css';

export default function EmployerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    let newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Corporate Email ID is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid corporate email address';
      }
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = await login(email, password);

      // Verify if the role is company/employer
      if (data.user.role !== 'company') {
        toast.error('Access denied. This portal is for employers only.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Employer Login Successful! Welcome back.');
      
      setTimeout(() => {
        navigate('/'); // Redirect to home, navbar will adapt
      }, 1500);
    } catch (err) {
      const message = err.message?.toLowerCase() || '';

      if (message.includes('password') || message.includes('credentials')) {
        setErrors({ password: 'Invalid Password' });
      } else if (message.includes('email') || message.includes('not found')) {
        setErrors({ email: 'Employer account not found' });
      } else {
        setErrors({ general: 'Login failed. Please check credentials.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employer-auth-page">
      <div className="employer-auth-card">
        <div className="employer-auth-illustration">
          <div className="illustration-overlay">
            <h3>Hire the Best Tech Talent</h3>
            <p>Connect with top-tier candidates, manage applications, and coordinate campus drives seamlessly.</p>
          </div>
          <img src={loginImg} alt="Employer Login" />
        </div>

        <div className="employer-auth-form-container">
          <div className="form-header">
            <span className="badge">Employer Portal</span>
            <h2 className="employer-auth-title">Log In to Your Workspace</h2>
            <p className="employer-auth-subtitle">Enter your corporate credentials below</p>
          </div>

          {errors.general && (
            <div className="general-error">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Corporate Email ID</label>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors(prev => ({ ...prev, email: '' }));
                  }}
                />
              </div>
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors(prev => ({ ...prev, password: '' }));
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password}</p>}
              
              <Link to="#" className="employer-forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-employer-primary"
              disabled={loading}
            >
              {loading ? 'Entering Workspace...' : 'Log In as Employer'}
            </button>

            <div className="divider">Or</div>

            <div className="candidate-portal-link">
              <span>Are you a Job Seeker? </span>
              <Link to="/login">Candidate Login</Link>
            </div>

            <div className="register-link-container">
              <span>New to Intenshalaaa? </span>
              <Link to="/employer/register" className="register-link">
                Register Company
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
