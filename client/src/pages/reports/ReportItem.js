// client/src/pages/reports/ReportItem.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ReportItem = ({ report, canManage, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { 
          color: 'success', 
          text: '완료', 
          icon: 'fas fa-check-circle',
          bgColor: '#d4edda'
        };
      case 'in_progress':
        return { 
          color: 'warning', 
          text: '진행 중', 
          icon: 'fas fa-clock',
          bgColor: '#fff3cd'
        };
      case 'not_started':
        return { 
          color: 'secondary', 
          text: '시작 전', 
          icon: 'fas fa-pause-circle',
          bgColor: '#e2e3e5'
        };
      default:
        return { 
          color: 'secondary', 
          text: '알 수 없음', 
          icon: 'fas fa-question-circle',
          bgColor: '#e2e3e5'
        };
    }
  };

  const getDaysInfo = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffFromEnd = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    
    if (diffFromEnd < 0) {
      return { 
        type: 'overdue', 
        text: `${Math.abs(diffFromEnd)}일 지연`,
        color: 'danger'
      };
    } else if (diffFromEnd === 0) {
      return { 
        type: 'today', 
        text: '오늘 마감',
        color: 'danger'
      };
    } else if (diffFromEnd === 1) {
      return { 
        type: 'tomorrow', 
        text: '내일 마감',
        color: 'warning'
      };
    } else if (diffFromEnd <= 3) {
      return { 
        type: 'soon', 
        text: `${diffFromEnd}일 남음`,
        color: 'warning'
      };
    } else {
      return { 
        type: 'normal', 
        text: `${diffFromEnd}일 남음`,
        color: 'info'
      };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
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

  const getCompletionColor = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'danger';
  };

  const status = getStatusInfo(report.status);
  const daysInfo = getDaysInfo(report.startDate, report.endDate);

  return (
    <div className="list-group-item">
      <div className="d-flex w-100 justify-content-between align-items-start">
        <div className="flex-grow-1">
          {/* Header */}
          <div className="d-flex align-items-center mb-2">
            <h6 className="mb-0 mr-2">
              <Link 
                to={`/reports/${report._id}`}
                className="text-decoration-none"
                style={{ color: 'inherit' }}
              >
                <i className="fas fa-file-alt mr-2 text-primary"></i>
                {report.team?.name || 'Unknown Team'} - {report.weekNumber}주차 보고서
              </Link>
            </h6>
            
            <span className={`badge badge-${status.color} mr-2`} style={{ fontSize: '0.7rem' }}>
              <i className={`${status.icon} mr-1`}></i>
              {status.text}
            </span>
            
            <span className={`badge badge-${daysInfo.color}`} style={{ fontSize: '0.7rem' }}>
              {daysInfo.text}
            </span>
          </div>

          {/* Period and Progress */}
          <div className="mb-2">
            <div className="row">
              <div className="col-md-6">
                <small className="text-muted">
                  <i className="fas fa-calendar-alt mr-1"></i>
                  <strong>기간:</strong> {formatDate(report.startDate)} - {formatDate(report.endDate)}
                </small>
              </div>
              {report.completionRate !== undefined && (
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <small className="text-muted mr-2">
                      <strong>완료율:</strong>
                    </small>
                    <div className="progress mr-2" style={{ width: '80px', height: '8px' }}>
                      <div 
                        className={`progress-bar progress-bar-${getCompletionColor(report.completionRate)}`}
                        style={{ width: `${report.completionRate}%` }}
                      ></div>
                    </div>
                    <small className="text-muted">{report.completionRate}%</small>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Goals Preview */}
          {report.goals && (
            <div className="mb-2">
              <small className="text-muted">
                <i className="fas fa-bullseye mr-1"></i>
                <strong>목표:</strong> 
                <span className="ml-1">
                  {report.goals.length > 100 ? 
                    `${report.goals.substring(0, 100)}...` : 
                    report.goals
                  }
                </span>
                {report.goals.length > 100 && (
                  <button 
                    className="btn btn-link btn-sm p-0 ml-1"
                    onClick={() => setShowDetails(!showDetails)}
                    style={{ fontSize: '0.8rem', textDecoration: 'none' }}
                  >
                    {showDetails ? '접기' : '더보기'}
                  </button>
                )}
              </small>
            </div>
          )}

          {/* Expanded Details */}
          {showDetails && (
            <div className="mt-3 p-3 bg-light rounded">
              {report.goals && (
                <div className="mb-2">
                  <strong className="text-muted">목표:</strong>
                  <p className="mb-2 mt-1">{report.goals}</p>
                </div>
              )}
              {report.progress && (
                <div className="mb-2">
                  <strong className="text-muted">진행상황:</strong>
                  <p className="mb-2 mt-1">{report.progress}</p>
                </div>
              )}
              {report.challenges && (
                <div className="mb-2">
                  <strong className="text-muted">어려움/이슈:</strong>
                  <p className="mb-2 mt-1">{report.challenges}</p>
                </div>
              )}
              {report.nextWeekPlan && (
                <div className="mb-0">
                  <strong className="text-muted">다음 주 계획:</strong>
                  <p className="mb-0 mt-1">{report.nextWeekPlan}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer Info */}
          <div className="d-flex align-items-center justify-content-between mt-2">
            <div className="d-flex align-items-center">
              {report.submittedBy && (
                <small className="text-muted mr-3">
                  <i className="fas fa-user mr-1"></i>
                  <strong>작성자:</strong> {report.submittedBy.name || report.submittedBy.username}
                </small>
              )}
              
              <small className="text-muted" title={formatDateTime(report.createdAt)}>
                <i className="fas fa-clock mr-1"></i>
                <strong>작성일:</strong> {formatDate(report.createdAt)}
              </small>
            </div>
            
            {report.updatedAt && report.updatedAt !== report.createdAt && (
              <small className="text-muted" title={formatDateTime(report.updatedAt)}>
                <i className="fas fa-edit mr-1"></i>
                수정됨: {formatDate(report.updatedAt)}
              </small>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ml-3 d-flex flex-column align-items-end">
          <div className="d-flex gap-1 mb-2">
            <Link 
              to={`/reports/${report._id}`}
              className="btn btn-sm btn-outline-primary"
            >
              <i className="fas fa-eye"></i>
            </Link>
            
            {canManage && report.status !== 'completed' && (
              <Link 
                to={`/reports/${report._id}/edit`}
                className="btn btn-sm btn-outline-secondary"
              >
                <i className="fas fa-edit"></i>
              </Link>
            )}
            
            {canManage && (
              <div className="dropdown">
                <button 
                  className="btn btn-sm btn-outline-secondary dropdown-toggle"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const dropdown = e.target.closest('.dropdown');
                    const menu = dropdown.querySelector('.dropdown-menu');
                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                  }}
                >
                  <i className="fas fa-ellipsis-v"></i>
                </button>
                <div className="dropdown-menu dropdown-menu-right">
                  <Link 
                    className="dropdown-item" 
                    to={`/reports/${report._id}/edit`}
                  >
                    <i className="fas fa-edit mr-2"></i>
                    수정
                  </Link>
                  <button 
                    className="dropdown-item text-danger"
                    onClick={() => onDelete(report._id)}
                  >
                    <i className="fas fa-trash mr-2"></i>
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Status Toggle */}
          {canManage && (
            <div className="btn-group-vertical btn-group-sm" role="group">
              {report.status !== 'completed' && (
                <button 
                  className="btn btn-outline-success btn-sm"
                  title="완료로 표시"
                  style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                >
                  완료
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          right: 0;
          z-index: 1000;
          min-width: 160px;
          padding: 0.5rem 0;
          margin: 0.125rem 0 0;
          background-color: #fff;
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 0.375rem;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
        }
        
        .dropdown-item {
          display: block;
          width: 100%;
          padding: 0.25rem 1rem;
          clear: both;
          font-weight: 400;
          color: #212529;
          text-align: inherit;
          text-decoration: none;
          white-space: nowrap;
          background-color: transparent;
          border: 0;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .dropdown-item:hover {
          color: #16181b;
          background-color: #f8f9fa;
        }
        
        .btn-group-vertical > .btn {
          width: 100%;
        }
        
        .gap-1 {
          gap: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default ReportItem;