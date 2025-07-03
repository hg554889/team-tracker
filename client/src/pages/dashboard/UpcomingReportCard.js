// client/src/pages/dashboard/UpcomingReportCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const UpcomingReportCard = ({ report }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'success', text: '완료', icon: 'fas fa-check-circle' };
      case 'in_progress':
        return { color: 'warning', text: '진행 중', icon: 'fas fa-clock' };
      case 'not_started':
        return { color: 'secondary', text: '시작 전', icon: 'fas fa-pause-circle' };
      default:
        return { color: 'secondary', text: '알 수 없음', icon: 'fas fa-question-circle' };
    }
  };

  const getDaysUntilDeadline = (endDate) => {
    const now = new Date();
    const deadline = new Date(endDate);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { days: Math.abs(diffDays), isOverdue: true };
    return { days: diffDays, isOverdue: false };
  };

  const getUrgencyLevel = (days, isOverdue) => {
    if (isOverdue) return { level: 'danger', text: '지연' };
    if (days <= 1) return { level: 'danger', text: '긴급' };
    if (days <= 3) return { level: 'warning', text: '주의' };
    if (days <= 7) return { level: 'info', text: '여유' };
    return { level: 'secondary', text: '충분' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const status = getStatusInfo(report.status);
  const deadlineInfo = getDaysUntilDeadline(report.endDate);
  const urgency = getUrgencyLevel(deadlineInfo.days, deadlineInfo.isOverdue);

  return (
    <div className="list-group-item list-group-item-action">
      <div className="d-flex w-100 justify-content-between align-items-start">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center mb-2">
            <h6 className="mb-0">
              <Link 
                to={`/reports/${report._id}`} 
                className="text-decoration-none"
                style={{ color: 'inherit' }}
              >
                {report.team?.name || 'Unknown Team'} - {report.weekNumber}주차
              </Link>
            </h6>
            <span className={`badge badge-${status.color} ml-2`} style={{ fontSize: '0.7rem' }}>
              <i className={`${status.icon} mr-1`}></i>
              {status.text}
            </span>
          </div>
          
          <div className="mb-2">
            <small className="text-muted">
              <i className="fas fa-calendar-alt mr-1"></i>
              {formatDate(report.startDate)} - {formatDate(report.endDate)}
            </small>
          </div>
          
          {report.goals && (
            <p className="mb-2 text-muted" style={{ fontSize: '0.875rem' }}>
              <strong>목표:</strong> {report.goals.substring(0, 100)}
              {report.goals.length > 100 && '...'}
            </p>
          )}
          
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              {report.completionRate !== undefined && (
                <div className="d-flex align-items-center mr-3">
                  <div className="progress mr-2" style={{ width: '60px', height: '8px' }}>
                    <div 
                      className={`progress-bar ${
                        report.completionRate >= 80 ? 'progress-bar-success' :
                        report.completionRate >= 60 ? 'progress-bar-warning' : 'progress-bar-danger'
                      }`}
                      style={{ width: `${report.completionRate}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">{report.completionRate}%</small>
                </div>
              )}
              
              {report.submittedBy && (
                <small className="text-muted">
                  <i className="fas fa-user mr-1"></i>
                  {report.submittedBy.name || report.submittedBy.username}
                </small>
              )}
            </div>
            
            <div className="d-flex align-items-center">
              <span 
                className={`badge badge-${urgency.level} mr-2`} 
                style={{ fontSize: '0.7rem' }}
                title={formatDateTime(report.endDate)}
              >
                {deadlineInfo.isOverdue ? 
                  `${deadlineInfo.days}일 지연` : 
                  deadlineInfo.days === 0 ? '오늘 마감' :
                  deadlineInfo.days === 1 ? '내일 마감' :
                  `${deadlineInfo.days}일 남음`
                }
              </span>
            </div>
          </div>
        </div>
        
        <div className="ml-3 d-flex flex-column align-items-end">
          <Link 
            to={`/reports/${report._id}`}
            className="btn btn-sm btn-outline-primary mb-1"
          >
            보기
          </Link>
          {report.status !== 'completed' && (
            <Link 
              to={`/reports/${report._id}/edit`}
              className="btn btn-sm btn-outline-secondary"
            >
              수정
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingReportCard;