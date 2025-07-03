// client/src/pages/reports/ReportDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';
import Spinner from '../../components/layout/Spinner';

const ReportDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportDetails();
    fetchContributions();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      const response = await api.get(`/reports/${id}`);
      setReport(response.data);
    } catch (error) {
      console.error('Report fetch error:', error);
      setAlert('보고서를 불러오는데 실패했습니다.', 'danger');
      navigate('/reports');
    }
  };

  const fetchContributions = async () => {
    try {
      const response = await api.get(`/reports/${id}/contributions`);
      setContributions(response.data || []);
    } catch (error) {
      console.error('Contributions fetch error:', error);
      // Don't show error for contributions as it's not critical
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!window.confirm('정말로 이 보고서를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/reports/${id}`);
      setAlert('보고서가 성공적으로 삭제되었습니다.', 'success');
      navigate('/reports');
    } catch (error) {
      const message = error.response?.data?.message || '보고서 삭제에 실패했습니다.';
      setAlert(message, 'danger');
    }
  };

  const canManageReport = () => {
    if (!report || !user) return false;
    return user.role === 'admin' || 
           user.role === 'executive' || 
           report.submittedBy?._id === user._id ||
           report.team?.leader?._id === user._id;
  };

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
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
        <h4 className="text-muted">보고서를 찾을 수 없습니다</h4>
        <Link to="/reports" className="btn btn-primary">보고서 목록으로 돌아가기</Link>
      </div>
    );
  }

  const status = getStatusInfo(report.status);
  const daysInfo = getDaysInfo(report.startDate, report.endDate);

  return (
    <div className="report-details">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center mb-2">
            <Link to="/reports" className="btn btn-outline-secondary btn-sm mr-3">
              <i className="fas fa-arrow-left mr-2"></i>
              보고서 목록
            </Link>
            <i className="fas fa-file-alt mr-2 text-primary"></i>
            <h1 className="mb-0">
              {report.team?.name || 'Unknown Team'} - {report.weekNumber}주차 보고서
            </h1>
          </div>
          <div className="d-flex align-items-center">
            <span className={`badge badge-${status.color} mr-2`}>
              <i className={`${status.icon} mr-1`}></i>
              {status.text}
            </span>
            <span className={`badge badge-${daysInfo.color} mr-2`}>
              {daysInfo.text}
            </span>
            {report.team && (
              <Link 
                to={`/teams/${report.team._id}`}
                className="badge badge-outline-primary"
                style={{ textDecoration: 'none' }}
              >
                <i className="fas fa-users mr-1"></i>
                팀 보기
              </Link>
            )}
          </div>
        </div>
        
        {canManageReport() && (
          <div className="ml-3">
            <div className="dropdown">
              <button 
                className="btn btn-outline-secondary dropdown-toggle"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const dropdown = e.target.closest('.dropdown');
                  const menu = dropdown.querySelector('.dropdown-menu');
                  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }}
              >
                <i className="fas fa-cog mr-2"></i>
                관리
              </button>
              <div className="dropdown-menu dropdown-menu-right">
                <Link className="dropdown-item" to={`/reports/${id}/edit`}>
                  <i className="fas fa-edit mr-2"></i>
                  보고서 수정
                </Link>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item text-danger"
                  onClick={handleDeleteReport}
                >
                  <i className="fas fa-trash mr-2"></i>
                  보고서 삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Report Summary */}
          <div className="card mb-4">
            <div 
              className="card-header"
              style={{ backgroundColor: status.bgColor }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">보고서 요약</h5>
                <div className="d-flex align-items-center">
                  <span className="mr-3">
                    <strong>완료율:</strong>
                  </span>
                  <div className="progress mr-2" style={{ width: '100px', height: '10px' }}>
                    <div 
                      className={`progress-bar progress-bar-${getCompletionColor(report.completionRate || 0)}`}
                      style={{ width: `${report.completionRate || 0}%` }}
                    ></div>
                  </div>
                  <span className="badge badge-primary">{report.completionRate || 0}%</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <th width="100">기간:</th>
                        <td>
                          {formatDate(report.startDate)} ~ {formatDate(report.endDate)}
                        </td>
                      </tr>
                      <tr>
                        <th>주차:</th>
                        <td>{report.weekNumber}주차</td>
                      </tr>
                      <tr>
                        <th>팀:</th>
                        <td>
                          {report.team ? (
                            <Link to={`/teams/${report.team._id}`}>
                              {report.team.name}
                            </Link>
                          ) : (
                            'Unknown Team'
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <th width="100">작성자:</th>
                        <td>
                          {report.submittedBy ? (
                            <div className="d-flex align-items-center">
                              <div 
                                className="user-avatar mr-2"
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: '#0366d6',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}
                              >
                                {(report.submittedBy.name || report.submittedBy.username || 'U').charAt(0).toUpperCase()}
                              </div>
                              {report.submittedBy.name || report.submittedBy.username}
                            </div>
                          ) : (
                            'Unknown User'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>작성일:</th>
                        <td>{formatDateTime(report.createdAt)}</td>
                      </tr>
                      {report.updatedAt && report.updatedAt !== report.createdAt && (
                        <tr>
                          <th>수정일:</th>
                          <td>{formatDateTime(report.updatedAt)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-clipboard-list mr-2"></i>
                보고서 내용
              </h5>
            </div>
            <div className="card-body">
              {/* Goals */}
              <div className="mb-4">
                <h6 className="text-primary">
                  <i className="fas fa-bullseye mr-2"></i>
                  이번 주 목표
                </h6>
                <div className="p-3 bg-light rounded">
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {report.goals || '목표가 작성되지 않았습니다.'}
                  </p>
                </div>
              </div>

              {/* Progress */}
              {report.progress && (
                <div className="mb-4">
                  <h6 className="text-success">
                    <i className="fas fa-chart-line mr-2"></i>
                    진행상황
                  </h6>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {report.progress}
                    </p>
                  </div>
                </div>
              )}

              {/* Challenges */}
              {report.challenges && (
                <div className="mb-4">
                  <h6 className="text-warning">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    어려움 및 이슈
                  </h6>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {report.challenges}
                    </p>
                  </div>
                </div>
              )}

              {/* Next Week Plan */}
              {report.nextWeekPlan && (
                <div className="mb-0">
                  <h6 className="text-info">
                    <i className="fas fa-calendar-plus mr-2"></i>
                    다음 주 계획
                  </h6>
                  <div className="p-3 bg-light rounded">
                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {report.nextWeekPlan}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contributions */}
          {contributions.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-users mr-2"></i>
                  멤버 기여도
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>멤버</th>
                        <th>기여 내용</th>
                        <th>작업 시간</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributions.map(contribution => (
                        <tr key={contribution._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div 
                                className="user-avatar mr-2"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: '#28a745',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '14px',
                                  fontWeight: '600'
                                }}
                              >
                                {(contribution.user?.name || contribution.user?.username || 'U').charAt(0).toUpperCase()}
                              </div>
                              {contribution.user?.name || contribution.user?.username || 'Unknown User'}
                            </div>
                          </td>
                          <td>{contribution.description}</td>
                          <td>
                            <span className="badge badge-primary">
                              {contribution.hours}시간
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: '2rem' }}>
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-info-circle mr-2"></i>
                보고서 정보
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>진행 현황</h6>
                <div className="progress mb-2">
                  <div 
                    className={`progress-bar progress-bar-${getCompletionColor(report.completionRate || 0)}`}
                    style={{ width: `${report.completionRate || 0}%` }}
                  >
                    {report.completionRate || 0}%
                  </div>
                </div>
                <small className="text-muted">
                  목표 대비 달성률
                </small>
              </div>

              <div className="mb-3">
                <h6>일정</h6>
                <ul className="list-unstyled">
                  <li>
                    <i className="fas fa-play text-success mr-2"></i>
                    <strong>시작:</strong> {formatDate(report.startDate)}
                  </li>
                  <li>
                    <i className="fas fa-flag text-danger mr-2"></i>
                    <strong>마감:</strong> {formatDate(report.endDate)}
                  </li>
                  <li>
                    <i className="fas fa-clock text-info mr-2"></i>
                    <strong>상태:</strong> 
                    <span className={`badge badge-${daysInfo.color} ml-1`}>
                      {daysInfo.text}
                    </span>
                  </li>
                </ul>
              </div>

              {canManageReport() && (
                <div className="mb-3">
                  <h6>액션</h6>
                  <div className="d-grid gap-2">
                    <Link 
                      to={`/reports/${id}/edit`}
                      className="btn btn-primary btn-sm"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      보고서 수정
                    </Link>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleDeleteReport}
                    >
                      <i className="fas fa-trash mr-2"></i>
                      보고서 삭제
                    </button>
                  </div>
                </div>
              )}

              <div className="alert alert-info">
                <small>
                  <i className="fas fa-lightbulb mr-2"></i>
                  <strong>팁:</strong> 이 보고서는 팀의 {report.weekNumber}주차 활동을 기록한 것입니다. 
                  팀 상세 페이지에서 다른 주차의 보고서도 확인할 수 있습니다.
                </small>
              </div>
            </div>
          </div>
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
        }
        
        .dropdown-item:hover {
          color: #16181b;
          background-color: #f8f9fa;
        }
        
        .d-grid {
          display: grid;
        }
        
        .gap-2 {
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default ReportDetails;