// client/src/pages/teams/TeamDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';
import MemberItem from './MemberItem';
import Spinner from '../../components/layout/Spinner';

const TeamDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    fetchTeamDetails();
    fetchTeamReports();
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      const response = await api.get(`/teams/${id}`);
      setTeam(response.data);
    } catch (error) {
      console.error('Team fetch error:', error);
      setAlert('팀 정보를 불러오는데 실패했습니다.', 'danger');
      navigate('/teams');
    }
  };

  const fetchTeamReports = async () => {
    try {
      const response = await api.get(`/teams/${id}/reports`);
      setReports(response.data || []);
    } catch (error) {
      console.error('Reports fetch error:', error);
      setAlert('보고서 목록을 불러오는데 실패했습니다.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addMemberEmail.trim()) return;

    setAddingMember(true);
    try {
      await api.post(`/teams/${id}/members`, { email: addMemberEmail.trim() });
      setAlert('멤버가 성공적으로 추가되었습니다.', 'success');
      setAddMemberEmail('');
      fetchTeamDetails(); // Refresh team data
    } catch (error) {
      const message = error.response?.data?.message || '멤버 추가에 실패했습니다.';
      setAlert(message, 'danger');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('정말로 이 멤버를 팀에서 제거하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/teams/${id}/members/${userId}`);
      setAlert('멤버가 성공적으로 제거되었습니다.', 'success');
      fetchTeamDetails(); // Refresh team data
    } catch (error) {
      const message = error.response?.data?.message || '멤버 제거에 실패했습니다.';
      setAlert(message, 'danger');
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('정말로 이 팀을 삭제하시겠습니까? 모든 보고서도 함께 삭제됩니다.')) {
      return;
    }

    try {
      await api.delete(`/teams/${id}`);
      setAlert('팀이 성공적으로 삭제되었습니다.', 'success');
      navigate('/teams');
    } catch (error) {
      const message = error.response?.data?.message || '팀 삭제에 실패했습니다.';
      setAlert(message, 'danger');
    }
  };

  const canManageTeam = () => {
    if (!team || !user) return false;
    return user.role === 'admin' || 
           user.role === 'executive' || 
           team.leader?._id === user._id;
  };

  const isTeamMember = () => {
    if (!team || !user) return false;
    return team.leader?._id === user._id || 
           team.members?.some(member => member._id === user._id);
  };

  const getTeamTypeInfo = (type) => {
    switch (type) {
      case 'study':
        return { 
          icon: 'fas fa-book', 
          color: 'info', 
          name: '스터디',
          bgColor: '#e7f3ff' 
        };
      case 'project':
        return { 
          icon: 'fas fa-rocket', 
          color: 'success', 
          name: '프로젝트',
          bgColor: '#e8f5e8'
        };
      default:
        return { 
          icon: 'fas fa-users', 
          color: 'secondary', 
          name: '팀',
          bgColor: '#f8f9fa'
        };
    }
  };

  const getReportStats = () => {
    if (!reports.length) return { total: 0, completed: 0, pending: 0, avgCompletion: 0 };
    
    const completed = reports.filter(r => r.status === 'completed').length;
    const pending = reports.filter(r => r.status !== 'completed').length;
    const avgCompletion = reports.reduce((sum, r) => sum + (r.completionRate || 0), 0) / reports.length;
    
    return {
      total: reports.length,
      completed,
      pending,
      avgCompletion: Math.round(avgCompletion)
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
        <h4 className="text-muted">팀을 찾을 수 없습니다</h4>
        <Link to="/teams" className="btn btn-primary">팀 목록으로 돌아가기</Link>
      </div>
    );
  }

  const teamType = getTeamTypeInfo(team.type);
  const stats = getReportStats();

  return (
    <div className="team-details">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center mb-2">
            <Link to="/teams" className="btn btn-outline-secondary btn-sm mr-3">
              <i className="fas fa-arrow-left mr-2"></i>
              팀 목록
            </Link>
            <i className={`${teamType.icon} mr-2 text-${teamType.color}`}></i>
            <h1 className="mb-0">{team.name}</h1>
            <span className={`badge badge-${teamType.color} ml-3`}>
              {teamType.name}
            </span>
          </div>
          <p className="text-muted mb-0">
            {team.description || '설명이 없습니다.'}
          </p>
        </div>
        
        {canManageTeam() && (
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
                <Link className="dropdown-item" to={`/teams/${id}/edit`}>
                  <i className="fas fa-edit mr-2"></i>
                  팀 정보 수정
                </Link>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item text-danger"
                  onClick={handleDeleteTeam}
                >
                  <i className="fas fa-trash mr-2"></i>
                  팀 삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary">{team.members?.length + 1 || 1}</h3>
              <p className="text-muted mb-0">총 멤버</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success">{stats.total}</h3>
              <p className="text-muted mb-0">작성된 보고서</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-info">{stats.completed}</h3>
              <p className="text-muted mb-0">완료된 보고서</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning">{stats.avgCompletion}%</h3>
              <p className="text-muted mb-0">평균 완료율</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="fas fa-info-circle mr-2"></i>
                개요
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => setActiveTab('members')}
              >
                <i className="fas fa-users mr-2"></i>
                멤버 ({team.members?.length + 1 || 1})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                <i className="fas fa-file-alt mr-2"></i>
                보고서 ({reports.length})
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="row">
              <div className="col-md-6">
                <h5>팀 정보</h5>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th width="100">팀명:</th>
                      <td>{team.name}</td>
                    </tr>
                    <tr>
                      <th>타입:</th>
                      <td>
                        <i className={`${teamType.icon} mr-2 text-${teamType.color}`}></i>
                        {teamType.name}
                      </td>
                    </tr>
                    <tr>
                      <th>리더:</th>
                      <td>
                        {team.leader ? (
                          <div className="d-flex align-items-center">
                            <div 
                              className="user-avatar mr-2"
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: '#ffc107',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              {(team.leader.name || team.leader.username || 'L').charAt(0).toUpperCase()}
                            </div>
                            {team.leader.name || team.leader.username}
                            <i className="fas fa-crown text-warning ml-2"></i>
                          </div>
                        ) : (
                          '리더 없음'
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>생성일:</th>
                      <td>{formatDate(team.createdAt)}</td>
                    </tr>
                    <tr>
                      <th>설명:</th>
                      <td>{team.description || '설명이 없습니다.'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="col-md-6">
                <h5>활동 현황</h5>
                <div className="progress mb-3">
                  <div 
                    className={`progress-bar progress-bar-${stats.avgCompletion >= 80 ? 'success' : stats.avgCompletion >= 60 ? 'warning' : 'danger'}`}
                    style={{ width: `${stats.avgCompletion}%` }}
                  >
                    {stats.avgCompletion}%
                  </div>
                </div>
                
                <div className="mb-3">
                  <small className="text-muted d-block">최근 활동</small>
                  {reports.length > 0 ? (
                    <span>
                      {reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].weekNumber}주차 보고서 
                      ({formatDate(reports[0].createdAt)})
                    </span>
                  ) : (
                    <span className="text-muted">아직 활동이 없습니다.</span>
                  )}
                </div>

                {isTeamMember() && (
                  <div className="mt-4">
                    <Link 
                      to={`/reports/create?team=${team._id}`}
                      className="btn btn-primary btn-block"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      새 보고서 작성
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">팀 멤버</h5>
                {canManageTeam() && (
                  <button 
                    className="btn btn-primary btn-sm"
                    data-toggle="modal"
                    data-target="#addMemberModal"
                    onClick={() => {
                      const modal = document.getElementById('addMemberModal');
                      modal.style.display = 'block';
                    }}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    멤버 추가
                  </button>
                )}
              </div>

              {/* Leader */}
              {team.leader && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">리더</h6>
                  <MemberItem 
                    member={team.leader} 
                    role="leader"
                    canManage={false} // Leader cannot be removed
                    onRemove={() => {}}
                  />
                </div>
              )}

              {/* Members */}
              <div>
                <h6 className="text-muted mb-2">멤버 ({team.members?.length || 0}명)</h6>
                {team.members && team.members.length > 0 ? (
                  <div className="list-group">
                    {team.members.map(member => (
                      <MemberItem 
                        key={member._id}
                        member={member}
                        role="member"
                        canManage={canManageTeam()}
                        onRemove={() => handleRemoveMember(member._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-users fa-2x text-muted mb-3"></i>
                    <p className="text-muted">아직 추가된 멤버가 없습니다.</p>
                    {canManageTeam() && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          const modal = document.getElementById('addMemberModal');
                          modal.style.display = 'block';
                        }}
                      >
                        첫 번째 멤버 추가하기
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">팀 보고서</h5>
                {isTeamMember() && (
                  <Link 
                    to={`/reports/create?team=${team._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    새 보고서 작성
                  </Link>
                )}
              </div>

              {reports.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>주차</th>
                        <th>기간</th>
                        <th>상태</th>
                        <th>완료율</th>
                        <th>작성자</th>
                        <th>작성일</th>
                        <th>액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports
                        .sort((a, b) => b.weekNumber - a.weekNumber)
                        .map(report => (
                        <tr key={report._id}>
                          <td>
                            <strong>{report.weekNumber}주차</strong>
                          </td>
                          <td>
                            <small>
                              {new Date(report.startDate).toLocaleDateString('ko-KR')} ~ <br/>
                              {new Date(report.endDate).toLocaleDateString('ko-KR')}
                            </small>
                          </td>
                          <td>
                            <span className={`badge badge-${
                              report.status === 'completed' ? 'success' :
                              report.status === 'in_progress' ? 'warning' : 'secondary'
                            }`}>
                              {report.status === 'completed' ? '완료' :
                               report.status === 'in_progress' ? '진행 중' : '시작 전'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress mr-2" style={{ width: '60px', height: '8px' }}>
                                <div 
                                  className={`progress-bar ${
                                    report.completionRate >= 80 ? 'progress-bar-success' :
                                    report.completionRate >= 60 ? 'progress-bar-warning' : 'progress-bar-danger'
                                  }`}
                                  style={{ width: `${report.completionRate || 0}%` }}
                                ></div>
                              </div>
                              <small>{report.completionRate || 0}%</small>
                            </div>
                          </td>
                          <td>
                            <small>{report.submittedBy?.name || 'Unknown'}</small>
                          </td>
                          <td>
                            <small>{new Date(report.createdAt).toLocaleDateString('ko-KR')}</small>
                          </td>
                          <td>
                            <Link 
                              to={`/reports/${report._id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-file-alt fa-2x text-muted mb-3"></i>
                  <p className="text-muted">아직 작성된 보고서가 없습니다.</p>
                  {isTeamMember() && (
                    <Link 
                      to={`/reports/create?team=${team._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      첫 번째 보고서 작성하기
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      <div className="modal" id="addMemberModal" style={{ display: 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-user-plus mr-2"></i>
                팀 멤버 추가
              </h5>
              <button 
                type="button" 
                className="close"
                onClick={() => {
                  const modal = document.getElementById('addMemberModal');
                  modal.style.display = 'none';
                }}
              >
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="memberEmail" className="form-label">
                    이메일 주소
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="memberEmail"
                    value={addMemberEmail}
                    onChange={(e) => setAddMemberEmail(e.target.value)}
                    placeholder="추가할 멤버의 이메일을 입력하세요"
                    required
                  />
                  <small className="form-text text-muted">
                    등록된 사용자의 이메일 주소를 입력해주세요.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    const modal = document.getElementById('addMemberModal');
                    modal.style.display = 'none';
                  }}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={addingMember}
                >
                  {addingMember ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      추가 중...
                    </>
                  ) : (
                    '멤버 추가'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          padding: 0.75rem 1rem;
        }
        
        .nav-tabs .nav-link.active {
          color: #0366d6;
          background-color: transparent;
          border-bottom: 2px solid #0366d6;
        }
        
        .nav-tabs .nav-link:hover {
          border: none;
          color: #0366d6;
        }
        
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1055;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          outline: 0;
          background-color: rgba(0, 0, 0, 0.5);
        }
        
        .modal-dialog {
          position: relative;
          width: auto;
          margin: 1.75rem auto;
          max-width: 500px;
        }
        
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
      `}</style>
    </div>
  );
};

export default TeamDetails;