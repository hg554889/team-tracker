// client/src/pages/dashboard/TeamProgressCard.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api';

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
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
`;

const ProgressTitle = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const ProgressLabel = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const ProgressValue = styled.div`
  font-size: 0.875rem;
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

const ReportLink = styled(Link)`
  display: block;
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
  color: #212529;
  margin-bottom: 0.75rem;
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e9ecef;
    text-decoration: none;
    color: #212529;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ReportTitle = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 500;
`;

const ReportStatus = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.status) {
      case 'completed': return '#28a74510';
      case 'in_progress': return '#fd7e1410';
      default: return '#6c757d10';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#28a745';
      case 'in_progress': return '#fd7e14';
      default: return '#6c757d';
    }
  }};
`;

const ReportDate = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
`;

const CardFooter = styled.div`
  padding: 1rem 1.2rem;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TeamMemberCount = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const ViewAllButton = styled(Link)`
  font-size: 0.875rem;
  color: #0366d6;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TeamProgressCard = ({ team }) => {
  const [reports, setReports] = useState([]);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get(`/reports/teams/${team._id}`);
        const latestReports = res.data.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 3);
        
        setReports(latestReports);
        
        // 평균 완료율 계산
        if (latestReports.length > 0) {
          const avgProgress = latestReports.reduce((sum, report) => 
            sum + report.completionRate, 0
          ) / latestReports.length;
          
          setProgress(avgProgress);
        }
      } catch (err) {
        if (err.status === 404) {
          console.warn('팀 보고서가 존재하지 않습니다.');
        } else {
          console.error('팀 보고서 로드 오류:', err);
        }
      }
    };
    
    fetchReports();
  }, [team._id]);
  
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
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // 팀 유형 표시
  const getTeamTypeText = (type) => {
    return type === 'project' ? '프로젝트' : '스터디';
  };
  
  return (
    <Card>
      <CardHeader>
        <TeamName to={`/teams/${team._id}`}>{team.name}</TeamName>
        <TeamType type={team.type}>{getTeamTypeText(team.type)}</TeamType>
      </CardHeader>
      
      <CardBody>
        <ProgressTitle>
          <ProgressLabel>평균 완료율</ProgressLabel>
          <ProgressValue>{progress.toFixed(1)}%</ProgressValue>
        </ProgressTitle>
        <ProgressBar>
          <ProgressFill value={progress} />
        </ProgressBar>
        
        {reports.length > 0 ? (
          reports.map(report => (
            <ReportLink key={report._id} to={`/reports/${report._id}`}>
              <ReportTitle>
                <span>{report.weekNumber}주차</span>
                <ReportStatus status={report.status}>
                  {getStatusText(report.status)}
                </ReportStatus>
              </ReportTitle>
              <ReportDate>
                {formatDate(report.startDate)} ~ {formatDate(report.endDate)}
              </ReportDate>
            </ReportLink>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>
            아직 보고서가 없습니다
          </div>
        )}
      </CardBody>
      
      <CardFooter>
        <TeamMemberCount>
          <i className="fas fa-users"></i> {team.members ? team.members.length : 0}명의 멤버
        </TeamMemberCount>
        <ViewAllButton to={`/teams/${team._id}`}>
          자세히 보기 <i className="fas fa-angle-right"></i>
        </ViewAllButton>
      </CardFooter>
    </Card>
  );
};

export default TeamProgressCard;