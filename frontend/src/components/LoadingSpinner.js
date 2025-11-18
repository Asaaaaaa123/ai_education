import React from 'react';
import { useLanguage } from '../utils/i18n';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = null,
  fullScreen = false 
}) => {
  const { t } = useLanguage();
  const displayText = text !== null ? text : t('loading');
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  const colorClasses = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    white: 'spinner-white'
  };

  const spinnerClass = `loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`;
  const containerClass = fullScreen ? 'loading-container-fullscreen' : 'loading-container';

  return (
    <div className={containerClass}>
      <div className={spinnerClass}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {displayText && <p className="loading-text">{displayText}</p>}
    </div>
  );
};

export default LoadingSpinner;
