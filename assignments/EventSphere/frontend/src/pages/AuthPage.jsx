import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, signup } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasNumber: false,
    hasSpecial: false,
    hasUpper: false
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  // Get redirect path and eventId from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/';
  const eventId = queryParams.get('eventId');
  
  // Set initial mode based on URL path
  useEffect(() => {
    if (location.pathname === '/signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Password strength check
    if (name === 'password') {
      const strength = {
        length: value.length >= 8,
        hasUpper: /[A-Z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      };
      setPasswordStrength(strength);
      
      // Clear error message if password meets requirements
      if (!isLogin && strength.length && strength.hasUpper && strength.hasNumber && strength.hasSpecial) {
        setError('');
      }
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    // Only redirect if authenticated and not already loading
    if (isAuthenticated && !loading) {
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, redirectPath, loading]);
  
  // Load remembered email if available
  useEffect(() => {
    if (isLogin && localStorage.getItem('rememberMe') === 'true') {
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) {
        setForm(prev => ({ ...prev, email: savedEmail }));
        setRememberMe(true);
      }
    }
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormErrors({});
    
    // Form validation
    const errors = {};
    if (!form.email) errors.email = 'Email is required';
    if (!form.email.includes('@')) errors.email = 'Please enter a valid email address';
    if (!form.password) errors.password = 'Password is required';
    if (!isLogin && !form.name) errors.name = 'Name is required';
    
    // Additional validation for registration
    if (!isLogin) {
      // Password validation
      if (form.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(form.password)) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[0-9]/.test(form.password)) {
        errors.password = 'Password must contain at least one number';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
        errors.password = 'Password must contain at least one special character';
      }
      
      if (!form.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login
        // Check for demo credentials for easier testing
        if (form.email === 'demo@example.com' && form.password === 'demo123') {
          // Use mock data directly for demo login
          const userData = {
            id: 'demo-user-id',
            name: 'Demo User',
            email: 'demo@example.com'
          };
          const authToken = 'mock-token-for-development';
          
          // Store remember me preference and proceed with login
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('userEmail', form.email);
          }
          
          // Update auth context with user data and token
          login(userData, authToken);
          
          // Redirect based on URL parameters
          if (eventId) {
            navigate(`/get-ticket?event=${eventId}`);
          } else {
            navigate(redirectPath);
          }
          return;
        }
        
        // Regular login flow
        const response = await loginUser({
          email: form.email,
          password: form.password
        });
        
        // Extract user data and token from response
        const userData = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role // Include role information
        };
        
        const authToken = response.token;
        
        // Log successful login data for debugging
        console.log('Login successful:', { userData, authToken });
        
        // Store remember me preference in localStorage if checked
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userEmail', form.email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('userEmail');
        }
        
        // Update auth context with user data and token
        login(userData, authToken);
        
        // If there's an eventId in the URL, redirect to get ticket page
        if (eventId) {
          navigate(`/get-ticket?event=${eventId}`);
        } else {
          // Otherwise redirect to the specified path or home
          navigate(redirectPath);
        }
      } else {
        // Register
        const response = await signup({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword
        });
        
        // If the backend returns a token, log the user in immediately
        if (response.token && response.user) {
          // Extract user data and token from response
          const userData = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email
          };
          
          const authToken = response.token;
          
          // Update auth context with user data and token
          login(userData, authToken);
          
          // If there's an eventId in the URL, redirect to register page
          if (eventId) {
            navigate(`/register?event=${eventId}`);
          } else {
            // Otherwise redirect to the specified path or home
            navigate(redirectPath);
          }
        } else {
          // Show success message and switch to login form if no token
          setSuccess('Account created successfully! Please log in.');
          setIsLogin(true);
          setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      let errorMessage = err.msg || err.message || 
                        err.response?.data?.message || 
                        err.response?.data?.msg || 
                        'Authentication failed. Please try again.';
      
      // Provide more helpful error messages
      if (isLogin) {
        // For login errors
        if (errorMessage.includes('Invalid credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (errorMessage.includes('Authentication failed')) {
          errorMessage = 'Login failed. Please check your credentials and try again.';
          
          // Suggest demo account
          errorMessage += '\n\nTip: You can use demo@example.com / demo123 to login.';
        }
      } else {
        // For registration errors
        if (errorMessage.includes('User already exists')) {
          errorMessage = 'An account with this email already exists. Please login instead.';
        } else if (errorMessage.includes('Password must be')) {
          // Password validation errors
// Use backend validation message directly
        } else if (errorMessage.includes('Server error')) {
          errorMessage = 'Registration failed due to a server error. Please try again later.';
        } else {
          // Generic registration error
          errorMessage = 'Registration failed. Please check your information and try again.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Welcome Back 👋' : 'Join EventSphere 🚀'}</h2>
        
        {success && <div className="auth-success">{success}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                required={!isLogin}
                disabled={loading}
              />
              {formErrors.name && <div className="field-error">{formErrors.name}</div>}
            </div>
          )}
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {formErrors.email && <div className="field-error">{formErrors.email}</div>}
          </div>
          <div className="form-group">
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formErrors.password && <div className="field-error">{formErrors.password}</div>}
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formErrors.confirmPassword && <div className="field-error">{formErrors.confirmPassword}</div>}
            </div>
          )}
          
          {isLogin && (
            <div className="auth-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>
          )}
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        {!isLogin && (
          <div className="password-strength-container">
            <h4>Password Requirements:</h4>
            <ul className="password-requirements">
              <li className={passwordStrength.length ? 'met' : 'not-met'}>
                {passwordStrength.length ? <FaCheck /> : <FaTimes />} At least 8 characters
              </li>
              <li className={passwordStrength.hasUpper ? 'met' : 'not-met'}>
                {passwordStrength.hasUpper ? <FaCheck /> : <FaTimes />} At least one uppercase letter
              </li>
              <li className={passwordStrength.hasNumber ? 'met' : 'not-met'}>
                {passwordStrength.hasNumber ? <FaCheck /> : <FaTimes />} At least one number
              </li>
              <li className={passwordStrength.hasSpecial ? 'met' : 'not-met'}>
                {passwordStrength.hasSpecial ? <FaCheck /> : <FaTimes />} At least one special character
              </li>
            </ul>
          </div>
        )}
        
        <p className="auth-toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            type="button" 
            className="toggle-button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setForm({ name: '', email: '', password: '', confirmPassword: '' });
              setFormErrors({});
              setError('');
            }}
          >
            {isLogin ? 'Create Account' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
