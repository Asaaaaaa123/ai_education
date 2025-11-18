import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import { useLanguage } from '../utils/i18n';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call real API
      const response = await apiClient.post('/api/auth/login', {
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
        
        // Load user's data (children, plans, test results) after login
        try {
          const userDataResponse = await apiClient.get('/api/plans/user-data');
          if (userDataResponse.data.success) {
            const userAllData = userDataResponse.data.data;
            localStorage.setItem('userChildren', JSON.stringify(userAllData.children || []));
            localStorage.setItem('userPlans', JSON.stringify(userAllData.plans || []));
            localStorage.setItem('userTestResults', JSON.stringify(userAllData.test_results || {}));
            console.log('用户数据已加载:', userAllData);
          }
        } catch (dataError) {
          console.error('加载用户数据失败:', dataError);
          // 即使加载失败，也继续登录流程
        }
        
        // Navigate to intended destination or progress page
        const destination = from === '/' ? '/progress' : from;
        navigate(destination, { replace: true });
      } else {
        setError(t('loginFailed'));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || t('loginFailed');
      setError(errorMessage);
      console.error('Login error:', err);
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
            <h1>{t('welcomeBack')}</h1>
            <p>{t('signInDescription')}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

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
                  placeholder={t('enterPassword')}
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


            <button
              type="submit"
              className="btn btn-primary btn-login"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {t('signingIn')}
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  {t('signIn')}
                </>
              )}
            </button>

          </form>

          <div className="login-footer">
            <p>{t('dontHaveAccount')} 
              <a href="#register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
                {t('signUp')}
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
              <i className="fas fa-shield-alt"></i>
            </div>
            <h2>{t('securePrivate')}</h2>
            <p>{t('secureDescription')}</p>
            <div className="security-features">
              <div className="security-feature">
                <i className="fas fa-lock"></i>
                <span>{t('endToEndEncryption')}</span>
              </div>
              <div className="security-feature">
                <i className="fas fa-user-shield"></i>
                <span>{t('hipaaCompliant')}</span>
              </div>
              <div className="security-feature">
                <i className="fas fa-database"></i>
                <span>{t('secureStorage')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 