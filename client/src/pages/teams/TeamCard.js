// client/src/pages/teams/TeamCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Card, CardBody, Badge, Button } from '../../components/common';  // 경로 수정
import { useAuth } from '../../context/AuthContext';

const StyledTeamCard = styled(Card)`
  transition: all ${props => props.theme.transitions.base};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const TeamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TeamInfo = styled.div`
  flex: 1;
`;

const TeamName = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const TeamLeader = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const TeamDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  margin: ${props => props.theme.spacing.md} 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TeamStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  margin-top: ${props => props.theme.spacing.md};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  flex-wrap: wrap;
`;

const DateInfo = styled.div`
  color: ${props => props.theme.colors.text.muted};
  font-size: ${props => props.theme.typography.fontSize.xs};
  margin-top: ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

function TeamCard({ team, onEdit, onDelete }) {
  const { user } = useAuth();

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
          variant: 'info', 
          name: '스터디',
          icon: 'fas fa-book'
        };
      case 'project':
        return { 
          variant: 'success', 
          name: '프로젝트',
          icon: 'fas fa-rocket'
        };
      default:
        return { 
          variant: 'secondary', 
          name: '팀',
          icon: 'fas fa-users'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!team.endDate) return null;
    const end = new Date(team.endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const typeInfo = getTeamTypeInfo(team.type);
  const daysRemaining = getDaysRemaining();

  return (
    <StyledTeamCard>
      <CardBody>
        <TeamHeader>
          <TeamInfo>
            <TeamName>{team.name}</TeamName>
            <TeamLeader>
              <i className="fas fa-user-tie" />
              <span>{team.leader?.name || '리더 없음'}</span>
            </TeamLeader>
          </TeamInfo>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <Badge variant={typeInfo.variant}>
              <i className={typeInfo.icon} style={{ marginRight: '4px' }} />
              {typeInfo.name}
            </Badge>
            {isTeamMember() && (
              <Badge variant="light" style={{ fontSize: '11px' }}>
                <i className="fas fa-check-circle" style={{ marginRight: '4px' }} />
                참여중
              </Badge>
            )}
          </div>
        </TeamHeader>

        <TeamDescription>
          {team.description || '팀 설명이 없습니다.'}
        </TeamDescription>

        <TeamStats>
          <div style={{ display: 'flex', gap: '16px' }}>
            <StatItem>
              <i className="fas fa-users" />
              <span>{(team.members?.length || 0) + 1}명</span>
            </StatItem>
            <StatItem>
              <i className="fas fa-file-alt" />
              <span>{team.reportCount || 0}개 보고서</span>
            </StatItem>
          </div>

          <ActionButtons>
            <Button
              as={Link}
              to={`/teams/${team._id}`}
              variant="outline"
              size="sm"
            >
              상세보기
            </Button>
            
            {canManageTeam() && (
              <>
                <Button
                  as={Link}
                  to={`/teams/${team._id}/edit`}
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                >
                  <i className="fas fa-edit" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete && onDelete(team._id)}
                  style={{ color: '#dc3545' }}
                >
                  <i className="fas fa-trash" />
                </Button>
              </>
            )}

            {isTeamMember() && (
              <Button
                as={Link}
                to={`/teams/${team._id}/report/new`}
                variant="primary"
                size="sm"
              >
                <i className="fas fa-plus" style={{ marginRight: '4px' }} />
                보고서 작성
              </Button>
            )}
          </ActionButtons>
        </TeamStats>

        {(team.startDate || team.endDate) && (
          <DateInfo>
            <i className="fas fa-calendar-alt" />
            <span>
              {team.startDate && formatDate(team.startDate)}
              {team.startDate && team.endDate && ' ~ '}
              {team.endDate && formatDate(team.endDate)}
              {daysRemaining !== null && (
                <span style={{ 
                  marginLeft: '8px',
                  color: daysRemaining <= 7 ? '#dc3545' : daysRemaining <= 30 ? '#ffc107' : '#28a745',
                  fontWeight: 500
                }}>
                  ({daysRemaining > 0 ? `${daysRemaining}일 남음` : '기간 종료'})
                </span>
              )}
            </span>
          </DateInfo>
        )}

        {team.goal && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            borderLeft: `4px solid ${
              typeInfo.variant === 'info' ? '#17a2b8' : 
              typeInfo.variant === 'success' ? '#28a745' : '#6c757d'
            }`
          }}>
            <div style={{
              fontSize: '12px',
              color: '#6c757d',
              marginBottom: '4px',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              팀 목표
            </div>
            <div style={{
              fontSize: '13px',
              color: '#495057',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {team.goal}
            </div>
          </div>
        )}
      </CardBody>
    </StyledTeamCard>
  );
}

export default TeamCard;