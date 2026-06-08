import React from 'react';
import { LanguageProvider, useLanguage } from '../utils/i18n';

// Wrapper component to use hooks in class component
const ErrorDisplay = ({ error, errorInfo, onReload, onGoHome }) => {
  const { t } = useLanguage();
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{
          fontSize: '64px',
          color: '#e53e3e',
          marginBottom: '20px'
        }}>
          ⚠️
        </div>
        
        <h1 style={{
          fontSize: '24px',
          color: '#2d3748',
          marginBottom: '16px',
          fontWeight: '600'
        }}>
          {t('errorBoundaryTitle')}
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#718096',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          {t('errorBoundaryMessage')}
        </p>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onReload}
            style={{
              backgroundColor: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c53030'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e53e3e'}
          >
            {t('refreshPage')}
          </button>
          
          <button
            onClick={onGoHome}
            style={{
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#3182ce'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4299e1'}
          >
            {t('goHome')}
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details style={{
            marginTop: '24px',
            textAlign: 'left',
            backgroundColor: '#f7fafc',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <summary style={{
              cursor: 'pointer',
              fontWeight: '500',
              color: '#2d3748',
              marginBottom: '8px'
            }}>
              {t('errorDetails')}
            </summary>
            <pre style={{
              fontSize: '12px',
              color: '#e53e3e',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {error && error.toString()}
              {errorInfo.componentStack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新state，使下一次渲染显示错误UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <LanguageProvider>
          <ErrorDisplay
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onReload={this.handleReload}
            onGoHome={this.handleGoHome}
          />
        </LanguageProvider>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
