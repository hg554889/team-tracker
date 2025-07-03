// client/src/pages/teams/TeamCard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TeamCard = ({ team, canManage, onDelete, currentUser }) => {
  const [showMemberModal, setShowMemberModal] = useState(false);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isTeamMember = () => {
    return team.leader?._id === currentUser?._id || 
           team.members?.some(member => member._id === currentUser?._id);
  };

  const getMemberRole = (memberId) => {
    if (team.leader?._id === memberId) return 'leader';
    return 'member';
  };

  const teamType = getTeamTypeInfo(team.type);

  return (
    <>
      <div className="card h-100 team-card">
        {/* Card Header */}
        <div 
          className="card-header"
          style={{ 
            backgroundColor: teamType.bgColor,
            borderBottom: `2px solid ${teamType.color === 'info' ? '#17a2b8' : teamType.color === 'success' ? '#28a745' : '#6c757d'}`
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className={`${teamType.icon} mr-2`} style={{ color: teamType.color === 'info' ? '#17a2b8' : teamType.color === 'success' ? '#28a745' : '#6c757d' }}></i>
              <span className={`badge badge-${teamType.color}`} style={{ fontSize: '0.7rem' }}>
                {teamType.name}
              </span>
            </div>
            
            {canManage && (
              <div className="dropdown">
                <button 
                  className="btn btn-sm btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-toggle="dropdown"
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
                    to={`/teams/${team._id}/edit`}
                  >
                    <i className="fas fa-edit mr-2"></i>
                    수정
                  </Link>
                  <button 
                    className="dropdown-item text-danger"
                    onClick={() => onDelete(team._id)}
                  >
                    <i className="fas fa-trash mr-2"></i>
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column">
          <h5 className="card-title mb-2">
            <Link 
              to={`/teams/${team._id}`}
              className="text-decoration-none"
              style={{ color: 'inherit' }}
            >
              {team.name}
            </Link>
          </h5>
          
          <p className="card-text text-muted flex-grow-1" style={{ fontSize: '0.9rem' }}>
            {team.description || '설명이 없습니다.'}
          </p>

          {/* Team Leader */}
          {team.leader && (
            <div className="mb-3">
              <div className="d-flex align-items-center">
                <i className="fas fa-crown text-warning mr-2"></i>
                <small className="text-muted">
                  <strong>리더:</strong> {team.leader.name || team.leader.username}
                </small>
              </div>
            </div>
          )}

          {/* Team Members */}
          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <i className="fas fa-users mr-2 text-primary"></i>
                <small className="text-muted">
                  <strong>멤버:</strong> {team.members?.length || 0}명
                </small>
              </div>
              
              {team.members?.length > 0 && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowMemberModal(true)}
                >
                  멤버 보기
                </button>
              )}
            </div>
            
            {/* Member Avatars Preview */}
            {team.members?.length > 0 && (
              <div className="mt-2">
                <div className="d-flex align-items-center">
                  {team.members.slice(0, 5).map((member, index) => (
                    <div
                      key={member._id}
                      className="user-avatar-sm mr-1"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: index % 2 === 0 ? '#0366d6' : '#28a745',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}
                      title={member.name || member.username}
                    >
                      {(member.name || member.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {team.members.length > 5 && (
                    <small className="text-muted ml-1">
                      +{team.members.length - 5}
                    </small>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Team Stats */}
          <div className="mb-3">
            <div className="row text-center">
              <div className="col-4">
                <small className="text-muted d-block">생성일</small>
                <small className="font-weight-bold">
                  {formatDate(team.createdAt)}
                </small>
              </div>
              <div className="col-4">
                <small className="text-muted d-block">내 역할</small>
                <small className="font-weight-bold">
                  {isTeamMember() ? 
                    (getMemberRole(currentUser?._id) === 'leader' ? '리더' : '멤버') : 
                    '비멤버'
                  }
                </small>
              </div>
              <div className="col-4">
                <small className="text-muted d-block">상태</small>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  활성
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="card-footer bg-transparent">
          <div className="d-flex justify-content-between">
            <Link 
              to={`/teams/${team._id}`}
              className="btn btn-outline-primary btn-sm"
            >
              <i className="fas fa-eye mr-1"></i>
              상세보기
            </Link>
            
            {isTeamMember() && (
              <Link 
                to={`/reports/create?team=${team._id}`}
                className="btn btn-primary btn-sm"
              >
                <i className="fas fa-edit mr-1"></i>
                보고서 작성
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Members Modal */}
      {showMemberModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-users mr-2"></i>
                  {team.name} 팀 멤버
                </h5>
                <button 
                  type="button" 
                  className="close"
                  onClick={() => setShowMemberModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {/* Leader */}
                {team.leader && (
                  <div className="mb-3">
                    <h6 className="text-muted mb-2">리더</h6>
                    <div className="d-flex align-items-center p-2 bg-light rounded">
                      <div 
                        className="user-avatar mr-3"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#ffc107',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}
                      >
                        {(team.leader.name || team.leader.username || 'L').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-weight-bold">
                          {team.leader.name || team.leader.username}
                          <i className="fas fa-crown text-warning ml-2"></i>
                        </div>
                        <small className="text-muted">{team.leader.email}</small>
                      </div>
                    </div>
                  </div>
                )}

                {/* Members */}
                {team.members && team.members.length > 0 && (
                  <div>
                    <h6 className="text-muted mb-2">멤버 ({team.members.length}명)</h6>
                    <div className="list-group list-group-flush">
                      {team.members.map((member, index) => (
                        <div key={member._id} className="list-group-item d-flex align-items-center px-0">
                          <div 
                            className="user-avatar mr-3"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: index % 3 === 0 ? '#0366d6' : index % 3 === 1 ? '#28a745' : '#17a2b8',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            {(member.name || member.username || 'M').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-grow-1">
                            <div className="font-weight-bold">
                              {member.name || member.username}
                            </div>
                            <small className="text-muted">{member.email}</small>
                          </div>
                          {member._id === currentUser?._id && (
                            <span className="badge badge-primary">나</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowMemberModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .team-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        
        .team-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
        }
        
        .modal-dialog {
          position: relative;
          width: auto;
          margin: 1.75rem auto;
          max-width: 500px;
        }
      `}</style>
    </>
  );
};

export default TeamCard;