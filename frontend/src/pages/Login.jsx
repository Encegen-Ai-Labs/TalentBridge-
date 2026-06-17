import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import "./Login.css";
import loginImg from "../assets/login_illustration.png";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();

  // -------------------------- state --------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // -------------------------- validation ------------------------
  const validateField = (name, value) => {
    let error = "";

    // ---- email / username ----
    if (name === "email") {
      const trimmed = value.trim();
      if (!trimmed) error = "Email or Username is required";
      else if (value.startsWith(" ")) error = "Starting spaces are not allowed";
      else if (/\s/.test(value)) error = "Spaces are not allowed";
      else if (trimmed.length < 3) error = "Minimum 3 characters required";
      else if (trimmed.length > 50) error = "Maximum 50 characters allowed";
      else if (value.includes("@")) {
        const emailRegex = /^[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/;
        if (!emailRegex.test(trimmed)) error = "Invalid email format";
      }
    }

    // ---- password ----
    if (name === "password") {
      if (!value) error = "Password is required";
      else if (value.startsWith(" ")) error = "Starting spaces are not allowed";
      else if (/\s/.test(value)) error = "Spaces are not allowed";
      else if (value.length < 6) error = "Minimum 6 characters required";
      else if (value.length > 16) error = "Maximum 16 characters allowed";
      else if (!/(?=.*[A-Z])/.test(value))
        error = "At least one uppercase letter required";
      else if (!/(?=.*[a-z])/.test(value))
        error = "At least one lowercase letter required";
      else if (!/(?=.*\d)/.test(value))
        error = "At least one number required";
      else if (!/(?=.*[!@#$%^&*])/.test(value))
        error = "At least one special character required";
    }

    return error;
  };

  // -------------------------- handlers -------------------------
  const handleEmailChange = (e) => {
    const value = e.target.value;
    if (value.startsWith(" ")) return; 
    if (value.length > 50) {
      setErrors((prev) => ({ ...prev, email: "Maximum 50 characters allowed" }));
      return;
    }
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: validateField("email", value) }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    if (/\s/.test(value)) {
      setErrors((prev) => ({
        ...prev,
        password: "Spaces are not allowed",
      }));
      return;
    }
    if (value.length > 16) {
      setErrors((prev) => ({
        ...prev,
        password: "Maximum 16 characters allowed",
      }));
      return;
    }
    setPassword(value);
    setErrors((prev) => ({
      ...prev,
      password: validateField("password", value),
    }));
  };

  const validateForm = () => {
    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);
    const newErrors = { email: emailError, password: passwordError };
    setErrors(newErrors);
    return !emailError && !passwordError;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login Successful!");
      setTimeout(() => {
        navigate(data.user.role === "company" ? "/company/dashboard" : "/");
      }, 1500);
    } catch (err) {
      const msg = err.message?.toLowerCase() ?? "";
      if (
        msg.includes("password") ||
        msg.includes("invalid credentials") ||
        msg.includes("incorrect password")
      ) {
        setErrors({ password: "Invalid Password" });
      } else if (msg.includes("email") || msg.includes("user not found")) {
        setErrors({ email: "Invalid Email or Username" });
      } else {
        setErrors({
          general: "Login Failed. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* LEFT illustration */}
        <div className="login-illustration">
          <img src={loginImg} alt="Login illustration" />
        </div>

        {/* RIGHT form card */}
        <div className="login-card">
          <h2 className="login-title">Login</h2>

          {errors.general && (
            <div className="error-banner">{errors.general}</div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email ID / Username</label>
              <input
                type="text"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="Email ID / Username"
                value={email}
                onChange={handleEmailChange}
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-input ${errors.password ? "input-error" : ""}`}
                  placeholder="Enter Password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password}</p>}
              
              {/* Forgot Password Right Aligned */}
              <div className="forgot-password-align">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Login Primary Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Logging in…" : "Login"}
            </button>

            {/* OTP Section */}
            <div className="otp-container">
              <Link to="#" className="otp-link">
                Use OTP to Login
              </Link>
            </div>

            {/* Figma Divider Layout */}
            <div className="divider-wrapper">
              <span className="divider-line"></span>
              <span className="divider-text">Or</span>
              <span className="divider-line"></span>
            </div>

            {/* Google Authentication Button */}
            <button type="button" className="btn-google">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign in with Google
            </button>
            <div className="register-prompt">
                <div>
                  New user?{" "}
                  <Link to="/register" className="register-link">
                    Create an account
                  </Link>
                </div>
                </div>
          </form>
        </div>
      </div>
    </div>
  );
}