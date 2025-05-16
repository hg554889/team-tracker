// client/src/pages/dashboard/UpcomingReportCard.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api';
import { format, differenceInDays } from 'date-fns';

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1.2rem;
  border-bottom: 1px solid #eee;
  background-color: ${props => props.isUrgent ? '#fff5f5' : 'white'};
`;

const ReportTitle = styled(Link)`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #212529;
  text-decoration: none;
  display: block;
  
  &:hover {
    color: #0366d6;
    text-decoration: none;
  }
`;

const TeamName = styled(Link)`
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.25rem;
  display: block;
  text-decoration: none;
  
  &:hover {
    color: #0366d6;
    text-decoration: none;
  }
`;

const CardBody = styled.div`
  padding: 1.2rem;
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatusItem = styled.div`
  text-align: center;
  flex: 1;
`;

const StatusLabel = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
`;

const StatusValue = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #212529;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 0.5rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: ${props => {
    if (props.value >= 75) return '#28a745';
    if (props.value >= 50) return '#17a2b8';
    if (props.value >= 25) return '#fd7e14';
    return '#dc3545';
  }};
  width: ${props => `${props.value}%`};
  transition: width 0.3s ease;
`;

const DateInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 1rem;
`;

const DateRange = styled.div`
`;

const DeadlineInfo = styled.div`
  color: ${props => props.isUrgent ? '#dc3545' : '#6c757d'};
  font-weight: ${props => props.isUrgent ? '600' : 'normal'};
`;

const CardFooter = styled.div`
  padding: 1rem 1.2rem;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
`;

const EditButton = styled(Link)`
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

const UpcomingReportCard = ({ report }) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);
  
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (report.team) {
          const res = await api.get(`/teams/${report.team}`);
          setTeam(res.data.data);
        }
        
        // 남은 일수 계산
        const endDate = new Date(report.endDate);
        const today = new Date();
        setDaysLeft(differenceInDays(endDate, today));
        
        setLoading(false);
      } catch (err) {
        console.error('팀 정보 로드 오류:', err);
        setLoading(false);
      }
    };
    
    fetchTeam();
  }, [report]);
  
  // 상태에 따른 텍스트
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '완료됨';
      case 'in_progress': return '진행 중';
      case 'not_started': return '시작 전';
      default: return '알 수 없음';
    }
  };
  
  // 날짜 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd');
  };
  
  const isUrgent = daysLeft <= 2;
  
  if (loading) {
    return <div>로딩 중...</div>;
  }
  
  return (
    <Card>
      <CardHeader isUrgent={isUrgent}>
        <ReportTitle to={`/reports/${report._id}`}>
          {team?.name} {report.weekNumber}주차 보고서
        </ReportTitle>
        <TeamName to={`/teams/${team?._id}`}>
          {team?.name} ({team?.type === 'project' ? '프로젝트' : '스터디'})
        </TeamName>
      </CardHeader>
      
      <CardBody>
        <StatusRow>
          <StatusItem>
            <StatusLabel>상태</StatusLabel>
            <StatusValue>{getStatusText(report.status)}</StatusValue>
          </StatusItem>
          <StatusItem>
            <StatusLabel>완료율</StatusLabel>
            <StatusValue>{report.completionRate}%</StatusValue>
          </StatusItem>
          <StatusItem>
            <StatusLabel>제출자</StatusLabel>
            <StatusValue>{report.submittedBy?.name || '알 수 없음'}</StatusValue>
          </StatusItem>
        </StatusRow>
        
        <ProgressBar>
          <ProgressFill value={report.completionRate} />
        </ProgressBar>
        
        <DateInfo>
          <DateRange>
            {formatDate(report.startDate)} ~ {formatDate(report.endDate)}
          </DateRange>
          <DeadlineInfo isUrgent={isUrgent}>
            {daysLeft < 0 ? (
              '마감 기한 지남'
            ) : daysLeft === 0 ? (
              '오늘 마감'
            ) : (
              `${daysLeft}일 남음`
            )}
          </DeadlineInfo>
        </DateInfo>
      </CardBody>
      
      <CardFooter>
        <EditButton to={`/reports/${report._id}/edit`}>
          보고서 작성하기
        </EditButton>
      </CardFooter>
    </Card>
  );
};

export default UpcomingReportCard;