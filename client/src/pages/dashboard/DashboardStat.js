// client/src/pages/dashboard/DashboardStat.js
import React from 'react';
import { Link } from 'react-router-dom';

const DashboardStat = ({ title, value, icon, color = 'primary', link, subtitle }) => {
  const getColorClass = (color) => {
    switch (color) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      case 'info': return 'info';
      case 'secondary': return 'secondary';
      default: return 'primary';
    }
  };

  const StatContent = () => (
    <div className={`stat-card ${getColorClass(color)}`}>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="stat-value">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="stat-label">
            {title}
          </div>
          {subtitle && (
            <div className="stat-subtitle text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {subtitle}
            </div>
          )}
        </div>
        <div className="stat-icon">
          <i 
            className={icon} 
            style={{ 
              fontSize: '2rem', 
              opacity: 0.6,
              color: color === 'warning' ? '#856404' : 'inherit'
            }}
          ></i>
        </div>
      </div>
      
      {link && (
        <div className="stat-footer mt-3">
          <small className="text-muted">
            <i className="fas fa-arrow-right mr-1"></i>
            자세히 보기
          </small>
        </div>
      )}
    </div>
  );

  return link ? (
    <Link 
      to={link} 
      className="text-decoration-none"
      style={{ color: 'inherit' }}
    >
      <StatContent />
    </Link>
  ) : (
    <StatContent />
  );
};

export default DashboardStat;