// client/src/pages/reports/ReportItem.js

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { format } from 'date-fns';

const ReportCard = styled.div`
  background-color: white;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ReportLink = styled(Link)`
  display: flex;
  padding: 1rem;
  color: inherit;
  text-decoration: none;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  &:hover {
    text-decoration: none;
    color: inherit;
  }
`;

const ReportInfo = styled.div`
  flex: 1;
`;

const ReportTitle = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  color: #212529;
`;

const ReportMeta = styled.div`
  display: flex;
  color: #6c757d;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
`;

const ReportMetaItem = styled.div`
  margin-right: 1rem;
  
  i {
    margin-right: 0.25rem;
  }
`;

const ProgressContainer = styled.div`
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  align-items: center;
`;

const ProgressLabel = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  width: 60px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 0.5rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
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

const ProgressValue = styled.div`
  font-size: 0.75rem;
  color: #212529;
  width: 45px;
  text-align: right;
  margin-left: 0.5rem;
  font-weight: 600;
`;

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding-left: 1rem;
  min-width: 100px;
  
  @media (max-width: 768px) {
    align-items: flex-start;
    padding-left: 0;
    margin-top: 0.5rem;
  }
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  
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

const DateRange = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
`;

const ReportItem = ({ report }) => {
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
  
  return (
    <ReportCard>
      <ReportLink to={`/reports/${report._id}`}>
        <ReportInfo>
          <ReportTitle>{report.weekNumber}주차 보고서</ReportTitle>
          <ReportMeta>
            <ReportMetaItem>
              <i className="fas fa-user"></i> {report.submittedBy?.name || '알 수 없음'}
            </ReportMetaItem>
            <ReportMetaItem>
              <i className="fas fa-clock"></i> {formatDate(report.createdAt)}
            </ReportMetaItem>
          </ReportMeta>
          
          <ProgressContainer>
            <ProgressLabel>완료율</ProgressLabel>
            <ProgressBar>
              <ProgressFill value={report.completionRate} />
            </ProgressBar>
            <ProgressValue>{report.completionRate}%</ProgressValue>
          </ProgressContainer>
        </ReportInfo>
        
        <StatusContainer>
          <StatusBadge status={report.status}>
            {getStatusText(report.status)}
          </StatusBadge>
          <DateRange>
            {formatDate(report.startDate)} ~ {formatDate(report.endDate)}
          </DateRange>
        </StatusContainer>
      </ReportLink>
    </ReportCard>
  );
};

export default ReportItem;