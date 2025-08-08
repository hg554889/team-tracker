// client/src/pages/report/ReportCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Card, CardBody, Badge, Button } from '../../components/common';  // 경로 수정
import { useAuth } from '../../context/AuthContext';

const StyledReportCard = styled(Card)`
  transition: all ${props => props.theme.transitions.base};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ReportInfo = styled.div`
  flex: 1;
`;

const ReportTitle = styled.h4`
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

const TeamInfo = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const ReportSummary = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  margin: ${props => props.theme.spacing.md} 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ReportMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  margin-top: ${props => props.theme.spacing.md};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  margin: ${props => props.theme.spacing.sm} 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: ${props => {
    const rate = props.rate;
    if (rate >= 80) return props.theme.colors.success;
    if (rate >= 50) return props.theme.colors.warning;
    return props.theme.colors.danger;
  }};
  width: ${props => Math.min(Math.max(props.rate, 0), 100)}%;
  transition: width ${props => props.theme.transitions.base};
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.muted};
  font-size: ${props => props.theme.typography.fontSize.xs};
  margin-top: ${props => props.theme.spacing.sm};
`;

function ReportCard({ report, onDelete }) {
  const { user } = useAuth();

  const canManageReport = () => {
    if (!report || !user) return false;
    return user.role === 'admin' || 
           user.role === 'executive' || 
           report.author?._id === user._id ||
           report.team?.leader === user._id;
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { 
          variant: 'success', 
          name: '완료',
          icon: 'fas fa-check-circle'
        };
      case 'in_progress':
        return { 
          variant: 'warning', 
          name: '진행중',
          icon: 'fas fa-clock'
        };
      case 'not_started':
        return { 
          variant: 'secondary', 
          name: '시작 전',
          icon: 'fas fa-pause-circle'
        };
      case 'on_hold':
        return { 
          variant: 'info', 
          name: '보류',
          icon: 'fas fa-pause'
        };
      default:
        return { 
          variant: 'secondary', 
          name: '알 수 없음',
          icon: 'fas fa-question-circle'
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWeekLabel = (week) => {
    return `${week}주차`;
  };

  const isOverdue = () => {
    if (!report.dueDate) return false;
    return new Date(report.dueDate) < new Date() && report.status !== 'completed';
  };

  const statusInfo = getStatusInfo(report.status);
  const completionRate = report.completionRate || 0;

  return (
    <StyledReportCard>
      <CardBody>
        <ReportHeader>
          <ReportInfo>
            <ReportTitle>{report.title}</ReportTitle>
            <TeamInfo>
              <i className="fas fa-users" />
              <span>{report.team?.name || '팀 정보 없음'}</span>
              <span>•</span>
              <span>{getWeekLabel(report.week)}</span>
            </TeamInfo>
          </ReportInfo>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <Badge variant={statusInfo.variant}>
              <i className={statusInfo.icon} style={{ marginRight: '4px' }} />
              {statusInfo.name}
            </Badge>
            {isOverdue() && (
              <Badge variant="danger" style={{ fontSize: '11px' }}>
                <i className="fas fa-exclamation-triangle" style={{ marginRight: '4px' }} />
                지연
              </Badge>
            )}
          </div>
        </ReportHeader>

        <ReportSummary>
          {report.summary || '보고서 요약이 없습니다.'}
        </ReportSummary>

        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <span style={{ 
              fontSize: '12px', 
              color: '#6c757d',
              fontWeight: 500
            }}>
              완료율
            </span>
            <span style={{ 
              fontSize: '12px', 
              color: '#495057',
              fontWeight: 600
            }}>
              {completionRate}%
            </span>
          </div>
          <ProgressBar>
            <ProgressFill rate={completionRate} />
          </ProgressBar>
        </div>

        <ReportMeta>
          <div style={{ display: 'flex', gap: '16px' }}>
            <MetaItem>
              <i className="fas fa-calendar-alt" />
              <span>{formatDate(report.createdAt)}</span>
            </MetaItem>
            {report.contributionsCount > 0 && (
              <MetaItem>
                <i className="fas fa-tasks" />
                <span>{report.contributionsCount}개 기여</span>
              </MetaItem>
            )}
          </div>

          <ActionButtons>
            <Button
              as={Link}
              to={`/reports/${report._id}`}
              variant="outline"
              size="sm"
            >
              상세보기
            </Button>
            
            {canManageReport() && (
              <>
                <Button
                  as={Link}
                  to={`/reports/${report._id}/edit`}
                  variant="ghost"
                  size="sm"
                >
                  <i className="fas fa-edit" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete && onDelete(report._id)}
                  style={{ color: '#dc3545' }}
                >
                  <i className="fas fa-trash" />
                </Button>
              </>
            )}
          </ActionButtons>
        </ReportMeta>

        <AuthorInfo>
          <i className="fas fa-user" />
          <span>작성자: {report.author?.name || '알 수 없음'}</span>
          {report.updatedAt !== report.createdAt && (
            <>
              <span>•</span>
              <span>수정: {formatDate(report.updatedAt)}</span>
            </>
          )}
        </AuthorInfo>
      </CardBody>
    </StyledReportCard>
  );
}

export default ReportCard;