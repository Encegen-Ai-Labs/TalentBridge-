import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import loginImg from '../assets/login_illustration.png';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // field errors
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Validate Form
  const validateForm = () => {
    let newErrors = {};

    // Email Validation
    if (!email.trim()) {
      newErrors.email = 'Email or Username is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // if user enters email then validate format
      if (email.includes('@') && !emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password Validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // validate first
    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = await login(email, password);

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert('Login Successful!');

      if (data.user.role === 'company') {
        navigate('/company/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const message = err.message?.toLowerCase() || '';

      // invalid password
      if (
        message.includes('password') ||
        message.includes('invalid credentials') ||
        message.includes('incorrect password')
      ) {
        setErrors({
          password: 'Invalid Password',
        });
      }

      // invalid email / user not found
      else if (
        message.includes('email') ||
        message.includes('user not found')
      ) {
        setErrors({
          email: 'Invalid Email or Username',
        });
      }

      // fallback
      else {
        setErrors({
          general: 'Login Failed. Please try again.',
        });
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-illustration">
          <img src={loginImg} alt="Login Illustration" />
        </div>

        <div className="auth-form-container">
          <h2 className="auth-title">Login</h2>

          {/* General Error */}
          {errors.general && (
            <div
              style={{
                color: 'red',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email ID / Username</label>

              <div className="form-input-wrapper">
                <input
                  type="text"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="Email ID / Username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    // remove error while typing
                    setErrors((prev) => ({
                      ...prev,
                      email: '',
                    }));
                  }}
                />
              </div>

              {errors.email && (
                <p className="error-text">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>

              <div className="form-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'input-error' : ''
                    }`}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    setErrors((prev) => ({
                      ...prev,
                      password: '',
                    }));
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

              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}

              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <Link to="#" className="use-otp">
              Use OTP to Login
            </Link>

            <div className="divider">Or</div>

            {/* Google Login */}
            <button type="button" className="btn-google">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path
                    fill="#4285F4"
                    d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                  />
                  <path
                    fill="#34A853"
                    d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.504 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M -21.504 53.529 C -21.764 52.729 -21.914 51.879 -21.914 51.009 C -21.914 50.139 -21.764 49.289 -21.504 48.489 L -21.504 45.399 L -25.464 45.399 C -26.284 47.049 -26.754 48.969 -26.754 51.009 C -26.754 53.049 -26.284 54.969 -25.464 56.619 L -21.504 53.529 Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M -14.754 43.529 C -12.984 43.529 -11.404 44.139 -10.154 45.329 L -6.734 41.909 C -8.804 39.979 -11.514 38.769 -14.754 38.769 C -19.444 38.769 -23.494 41.469 -25.464 45.399 L -21.504 48.489 C -20.534 45.639 -17.884 43.529 -14.754 43.529 Z"
                  />
                </g>
              </svg>

              Continue with Google
            </button>

            {/* Register Link */}
            <div className="register-link-container">
              <span>New User? </span>

              <Link to="/register" className="register-link">
                Create an Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}