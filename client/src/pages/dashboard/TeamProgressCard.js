// client/src/pages/dashboard/TeamProgressCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const TeamProgressCard = ({ team }) => {
  const getTeamTypeIcon = (type) => {
    switch (type) {
      case 'study':
        return 'fas fa-book';
      case 'project':
        return 'fas fa-rocket';
      default:
        return 'fas fa-users';
    }
  };

  const getTeamTypeName = (type) => {
    switch (type) {
      case 'study':
        return '스터디';
      case 'project':
        return '프로젝트';
      default:
        return '팀';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate team activity score based on recent reports
  const getActivityLevel = () => {
    // This would typically be calculated based on recent report submissions
    // For now, we'll use a placeholder logic
    const memberCount = team.members?.length || 0;
    if (memberCount >= 5) return { level: 'high', color: 'success', text: '활발' };
    if (memberCount >= 3) return { level: 'medium', color: 'warning', text: '보통' };
    return { level: 'low', color: 'secondary', text: '저조' };
  };

  const activity = getActivityLevel();

  return (
    <div className="list-group-item list-group-item-action">
      <div className="d-flex w-100 justify-content-between align-items-start">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center mb-2">
            <i className={`${getTeamTypeIcon(team.type)} mr-2 text-primary`}></i>
            <h6 className="mb-0">
              <Link 
                to={`/teams/${team._id}`} 
                className="text-decoration-none"
                style={{ color: 'inherit' }}
              >
                {team.name}
              </Link>
            </h6>
            <span className={`badge badge-${activity.color} ml-2`} style={{ fontSize: '0.7rem' }}>
              {activity.text}
            </span>
          </div>
          
          <p className="mb-2 text-muted" style={{ fontSize: '0.875rem' }}>
            {team.description || '설명이 없습니다.'}
          </p>
          
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <span className="badge badge-outline-primary mr-2" style={{ fontSize: '0.7rem' }}>
                {getTeamTypeName(team.type)}
              </span>
              <small className="text-muted">
                <i className="fas fa-user mr-1"></i>
                {team.members?.length || 0}명
              </small>
            </div>
            
            <small className="text-muted">
              {formatDate(team.createdAt)}
            </small>
          </div>
          
          {team.leader && (
            <div className="mt-2">
              <small className="text-muted">
                <i className="fas fa-crown mr-1 text-warning"></i>
                리더: {team.leader.name || team.leader.username}
              </small>
            </div>
          )}
        </div>
        
        <div className="ml-3 d-flex align-items-center">
          <Link 
            to={`/teams/${team._id}`}
            className="btn btn-sm btn-outline-primary"
          >
            상세보기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeamProgressCard;