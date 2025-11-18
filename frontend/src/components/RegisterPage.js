import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import './LoginPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        // Store login state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('loginTime', new Date().toISOString());
        
        // Initialize empty user data for new user
        localStorage.setItem('userChildren', JSON.stringify([]));
        localStorage.setItem('userPlans', JSON.stringify([]));
        localStorage.setItem('userTestResults', JSON.stringify({}));
        
        // Navigate to home
        navigate('/', { replace: true });
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <i className="fas fa-heart"></i>
              <span>MayCare</span>
            </div>
            <h1>Create Account · 注册成为学习伙伴</h1>
            <p>Receive cheerful, bilingual support for every learning goal · 用中英双语记录孩子的每一次小进步</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name · 姓名</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address · 邮箱</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

              <div className="form-group">
              <label className="form-label">Password · 密码</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password (min 6 characters)"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password · 再次输入密码</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-login"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Sign Up · 正式加入
                </>
              )}
            </button>

          </form>

          <div className="login-footer">
            <p className="footer-spaced">
              Already have an account? 已经有账号吗？
              <a href="#login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                Sign In · 立即登录
              </a>
            </p>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/')}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Home · 返回首页
            </button>
          </div>
        </div>

        <div className="login-visual">
          <div className="visual-content">
            <div className="visual-icon">
              <i className="fas fa-users"></i>
            </div>
            <h2>Welcome 欢迎加入</h2>
            <p>Thousands of families celebrate progress here · 每天收到 AI 的正向反馈</p>
            <div className="security-features">
              <div className="security-feature">
                <i className="fas fa-check-circle"></i>
                <span>Personalized assessments · 个性化评估</span>
              </div>
              <div className="security-feature">
                <i className="fas fa-check-circle"></i>
                <span>Professional support · 专业引导</span>
              </div>
              <div className="security-feature">
                <i className="fas fa-check-circle"></i>
                <span>Track progress · 进步随时看</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;






