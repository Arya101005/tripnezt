import { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'warning':
        return (
          <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
          </svg>
        );
      case 'error':
      default:
        return (
          <svg className="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
            <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round"/>
            <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#ef4444';
    }
  };

  return (
    <div className={`toast-container toast-${type} ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="toast-content">
        <div className="toast-icon-wrapper">
          {getIcon()}
        </div>
        <div className="toast-message">
          <span className="toast-title">
            {type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Warning'}
          </span>
          <p className="toast-text">{message}</p>
        </div>
        <button className="toast-close" onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div 
        className="toast-progress" 
        style={{ 
          backgroundColor: getProgressColor(),
          animation: `shrink ${duration}ms linear forwards`
        }}
      />
    </div>
  );
};

export default Toast;
