// client/src/pages/teams/MemberItem.js
import React from 'react';

const MemberItem = ({ member, role, canManage, onRemove }) => {
  const getRoleInfo = (role) => {
    switch (role) {
      case 'leader':
        return {
          icon: 'fas fa-crown',
          color: 'warning',
          text: '리더',
          bgColor: '#fff3cd'
        };
      case 'member':
        return {
          icon: 'fas fa-user',
          color: 'primary',
          text: '멤버',
          bgColor: '#e7f3ff'
        };
      default:
        return {
          icon: 'fas fa-user',
          color: 'secondary',
          text: '멤버',
          bgColor: '#f8f9fa'
        };
    }
  };

  const getJoinDate = () => {
    // In real app, this would come from team membership join date
    // For now, use createdAt as approximation
    return member.createdAt ? 
      new Date(member.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 
      '알 수 없음';
  };

  const getAvatarColor = (name) => {
    const colors = ['#0366d6', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1'];
    const index = (name || '').length % colors.length;
    return colors[index];
  };

  const roleInfo = getRoleInfo(role);

  return (
    <div className={`list-group-item member-item ${role === 'leader' ? 'leader-item' : ''}`}>
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center flex-grow-1">
          {/* Avatar */}
          <div 
            className="user-avatar mr-3"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: role === 'leader' ? '#ffc107' : getAvatarColor(member.name || member.username),
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '600',
              boxShadow: role === 'leader' ? '0 0 0 3px rgba(255, 193, 7, 0.25)' : 'none'
            }}
          >
            {(member.name || member.username || 'U').charAt(0).toUpperCase()}
          </div>

          {/* Member Info */}
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <h6 className="mb-0 mr-2">
                {member.name || member.username}
              </h6>
              
              <span className={`badge badge-${roleInfo.color}`} style={{ fontSize: '0.7rem' }}>
                <i className={`${roleInfo.icon} mr-1`}></i>
                {roleInfo.text}
              </span>
              
              {role === 'leader' && (
                <span className="badge badge-warning ml-1" style={{ fontSize: '0.6rem' }}>
                  팀장
                </span>
              )}
            </div>
            
            <div className="mb-1">
              <small className="text-muted">
                <i className="fas fa-envelope mr-1"></i>
                {member.email}
              </small>
            </div>
            
            <div className="d-flex align-items-center">
              <small className="text-muted mr-3">
                <i className="fas fa-calendar-plus mr-1"></i>
                가입: {getJoinDate()}
              </small>
              
              {member.role && (
                <small className="text-muted">
                  <i className="fas fa-shield-alt mr-1"></i>
                  권한: {member.role === 'admin' ? '관리자' : 
                         member.role === 'executive' ? '임원' :
                         member.role === 'leader' ? '리더' : '멤버'}
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ml-3 d-flex align-items-center">
          {/* Member Status Indicator */}
          <div className="mr-3">
            <small className="text-muted d-block text-center">상태</small>
            <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>
              활성
            </span>
          </div>

          {/* Actions */}
          {canManage && role !== 'leader' && (
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
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    // In real app, this would open a profile modal or redirect
                    console.log('View profile:', member._id);
                  }}
                >
                  <i className="fas fa-user mr-2"></i>
                  프로필 보기
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    // In real app, this could promote to different roles
                    console.log('Manage roles:', member._id);
                  }}
                >
                  <i className="fas fa-user-tag mr-2"></i>
                  역할 관리
                </button>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item text-danger"
                  onClick={() => {
                    if (window.confirm(`정말로 ${member.name || member.username}님을 팀에서 제거하시겠습니까?`)) {
                      onRemove();
                    }
                  }}
                >
                  <i className="fas fa-user-minus mr-2"></i>
                  팀에서 제거
                </button>
              </div>
            </div>
          )}
          
          {role === 'leader' && (
            <div className="text-center">
              <small className="text-muted d-block">팀장</small>
              <i className="fas fa-crown text-warning"></i>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info (expandable) */}
      <div className="member-details mt-2" style={{ display: 'none' }}>
        <div className="row">
          <div className="col-md-6">
            <h6 className="text-muted">활동 통계</h6>
            <ul className="list-unstyled">
              <li><small>작성한 보고서: 0개</small></li>
              <li><small>평균 완료율: 0%</small></li>
              <li><small>마지막 활동: 알 수 없음</small></li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6 className="text-muted">연락처</h6>
            <ul className="list-unstyled">
              <li><small>이메일: {member.email}</small></li>
              {member.phone && <li><small>전화: {member.phone}</small></li>}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .member-item {
          transition: all 0.2s ease-in-out;
          border-left: 3px solid transparent;
        }
        
        .member-item:hover {
          background-color: #f8f9fa;
          border-left-color: #0366d6;
        }
        
        .leader-item {
          background-color: #fff8e1;
          border-left-color: #ffc107;
        }
        
        .leader-item:hover {
          background-color: #fff3cd;
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
          font-size: 0.875rem;
        }
        
        .dropdown-item:hover {
          color: #16181b;
          background-color: #f8f9fa;
        }
        
        .user-avatar {
          position: relative;
        }
        
        .user-avatar::after {
          content: '';
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background-color: #28a745;
          border: 2px solid white;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default MemberItem;