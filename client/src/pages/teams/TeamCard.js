// client/src/pages/teams/TeamCard.js

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  padding: 1.2rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TeamName = styled(Link)`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #212529;
  text-decoration: none;
  
  &:hover {
    color: #0366d6;
    text-decoration: none;
  }
`;

const TeamType = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
  border-radius: 4px;
  background-color: ${props => props.type === 'project' ? '#0366d610' : '#28a74510'};
  color: ${props => props.type === 'project' ? '#0366d6' : '#28a745'};
`;

const CardBody = styled.div`
  padding: 1.2rem;
  flex: 1;
`;

const Description = styled.p`
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  
  /* 3줄까지만 표시하고 말줄임표 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LeaderInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const LeaderAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 0.5rem;
  font-size: 0.7rem;
`;

const LeaderName = styled.span`
  font-weight: 500;
  color: #495057;
`;

const MemberCount = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const CardFooter = styled.div`
  padding: 1rem 1.2rem;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CreatedDate = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
`;

const ViewButton = styled(Link)`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  background-color: #0366d6;
  color: white;
  border: none;
  text-decoration: none;
  
  &:hover {
    background-color: #0254ac;
    text-decoration: none;
    color: white;
  }
`;

const TeamCard = ({ team }) => {
  // 생성일 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // 팀 유형 표시
  const getTeamTypeText = (type) => {
    return type === 'project' ? '프로젝트' : '스터디';
  };
  
  // 리더 이니셜 표시
  const getLeaderInitials = (leader) => {
    if (!leader || !leader.name) return '?';
    
    const names = leader.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <Card>
      <CardHeader>
        <TeamName to={`/teams/${team._id}`}>{team.name}</TeamName>
        <TeamType type={team.type}>{getTeamTypeText(team.type)}</TeamType>
      </CardHeader>
      
      <CardBody>
        <Description>{team.description}</Description>
        
        <LeaderInfo>
          <LeaderAvatar>{getLeaderInitials(team.leader)}</LeaderAvatar>
          <LeaderName>{team.leader?.name || '리더 정보 없음'}</LeaderName>
        </LeaderInfo>
        
        <MemberCount>
          <i className="fas fa-users"></i> {team.members ? team.members.length : 0}명의 멤버
        </MemberCount>
      </CardBody>
      
      <CardFooter>
        <CreatedDate>
          {team.createdAt ? `생성일: ${formatDate(team.createdAt)}` : ''}
        </CreatedDate>
        <ViewButton to={`/teams/${team._id}`}>
          자세히 보기
        </ViewButton>
      </CardFooter>
    </Card>
  );
};

export default TeamCard;