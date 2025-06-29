// client/src/pages/dashboard/Dashboard.js

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import Spinner from '../../components/layout/Spinner';
import DashboardStat from './DashboardStat';
import TeamProgressCard from './TeamProgressCard';
import UpcomingReportCard from './UpcomingReportCard';
import styled from 'styled-components';
import api from '../../services/api';

const DashboardContainer = styled.div`
  padding: 1.5rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const DashboardTitle = styled.h1`
  margin: 0;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const DashboardGreeting = styled.p`
  font-size: 1.1rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
  color: #666;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const TeamsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ReportsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
`;

const CreateButtonContainer = styled.div`
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CreateButton = styled(Link)`
  display: inline-block;
  background-color: #0366d6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0254ac;
    text-decoration: none;
    color: white;
  }
  
  @media (max-width: 768px) {
    display: block;
    width: 100%;
    text-align: center;
  }
`;

const NoDataMessage = styled.div`
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 2rem;
  text-align: center;
  color: #6c757d;
`;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalReports: 0,
    averageCompletion: 0,
    pendingReports: 0
  });
  const [teams, setTeams] = useState([]);
  const [upcomingReports, setUpcomingReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 팀 데이터 가져오기
        const teamsRes = await api.get('/teams');
        setTeams(teamsRes.data.data);
        
        // 보고서 데이터 가져오기
        const reportsRes = await api.get('/reports');
        const reports = reportsRes.data.data;
        
        // 기본 통계 계산
        const totalTeams = teamsRes.data.count;
        const totalReports = reports.length;
        
        // 완료율 평균 계산
        const completedReports = reports.filter(report => report.status === 'completed');
        const averageCompletion = completedReports.length > 0
          ? completedReports.reduce((sum, report) => sum + report.completionRate, 0) / completedReports.length
          : 0;
        
        // 마감이 임박한 보고서
        const pendingReports = reports.filter(report => report.status !== 'completed');
        const upcoming = pendingReports.sort((a, b) => new Date(a.endDate) - new Date(b.endDate)).slice(0, 3);
        
        setStats({
          totalTeams,
          totalReports,
          averageCompletion,
          pendingReports: pendingReports.length
        });
        setUpcomingReports(upcoming);
      } catch (err) {
        console.error('대시보드 데이터 로드 오류:', err);
        setAlert('대시보드 데이터를 불러오는데 실패했습니다', 'danger');
      } finally {
        setLoading(false); // 무조건 호출
      }
    };

    fetchDashboardData();
  }, [setAlert]);
  
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <DashboardContainer>
      <DashboardHeader>
        <div>
          <DashboardTitle>대시보드</DashboardTitle>
          <DashboardGreeting>안녕하세요, {user.name}님!</DashboardGreeting>
        </div>
        
        {/* 팀 생성 버튼 추가 */}
        <CreateButtonContainer>
          <CreateButton to="/teams/create">
            <i className="fas fa-plus"></i> 새 팀 만들기
          </CreateButton>
        </CreateButtonContainer>
      </DashboardHeader>
      
      <StatsContainer>
        <DashboardStat
          title="활동 중인 팀"
          value={stats.totalTeams}
          icon="users"
          color="#0366d6"
        />
        <DashboardStat
          title="전체 보고서"
          value={stats.totalReports}
          icon="file-alt"
          color="#28a745"
        />
        <DashboardStat
          title="평균 완료율"
          value={`${stats.averageCompletion.toFixed(1)}%`}
          icon="tasks"
          color="#fd7e14"
        />
        <DashboardStat
          title="진행 중인 보고서"
          value={stats.pendingReports}
          icon="clock"
          color="#dc3545"
        />
      </StatsContainer>
      
      <SectionTitle>나의 팀</SectionTitle>
      {teams.length > 0 ? (
        <TeamsContainer>
          {teams.map(team => (
            <TeamProgressCard key={team._id} team={team} />
          ))}
        </TeamsContainer>
      ) : (
        <NoDataMessage>
          <p>아직 참여 중인 팀이 없습니다.</p>
          {(user.role === 'admin' || user.role === 'leader') && (
            <CreateButton to="/teams/create">
              <i className="fas fa-plus"></i> 새 팀 만들기
            </CreateButton>
          )}
        </NoDataMessage>
      )}
      
      <SectionTitle>마감 임박 보고서</SectionTitle>
      {upcomingReports.length > 0 ? (
        <ReportsContainer>
          {upcomingReports.map(report => (
            <UpcomingReportCard key={report._id} report={report} />
          ))}
        </ReportsContainer>
      ) : (
        <NoDataMessage>
          <p>마감 임박한 보고서가 없습니다.</p>
        </NoDataMessage>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;