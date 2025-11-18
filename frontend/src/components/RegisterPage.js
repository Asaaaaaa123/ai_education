import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import { useLanguage } from '../utils/i18n';
import './LoginPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
      setError(t('nameRequired'));
      return false;
    }
    if (!formData.email.trim()) {
      setError(t('emailRequired'));
      return false;
    }
    if (!formData.password) {
      setError(t('passwordRequired'));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t('passwordTooShort'));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDontMatch'));
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
        setError(t('registrationFailed'));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || t('registrationFailed');
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
            <h1>{t('createAccount')}</h1>
            <p>{t('registerDescription')}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t('fullName')}</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('enterFullName')}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('emailAddress')}</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t('enterEmail')}
                  required
                />
              </div>
            </div>

              <div className="form-group">
              <label className="form-label">{t('password')}</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={t('passwordMinLength')}
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
              <label className="form-label">{t('confirmPassword')}</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder={t('enterPasswordAgain')}
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
                  {t('creatingAccount')}
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  {t('signUpButton')}
                </>
              )}
            </button>

          </form>

          <div className="login-footer">
            <p className="footer-spaced">
              {t('alreadyHaveAccount')}
              <a href="#login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                {t('signIn')}
              </a>
            </p>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/')}
            >
              <i className="fas fa-arrow-left"></i>
              {t('backToHome')}
            </button>
          </div>
        </div>

        <div className="login-visual">
          <div className="visual-content">
            <div className="visual-icon">
              <i className="fas fa-users"></i>
            </div>
            <h2>{t('welcomeJoin')}</h2>
            <p>{t('welcomeDescription')}</p>
            <div className="security-features">
              <div className="security-feature">
                <i className="fas fa-check-circle"></i>
                <span>{t('personalizedAssessments')}</span>
              </div>
              <div className="security-feature">
                <i className="fas fa-check-circle"></i>
                <span>{t('professionalSupport')}</span>
              </div>
              <div className="security-feature">
                <i className="fas fa-check-circle"></i>
                <span>{t('trackProgress')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;






