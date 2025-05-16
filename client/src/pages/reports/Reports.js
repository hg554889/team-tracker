// client/src/pages/reports/Reports.js

import React, { useState, useEffect, useContext } from 'react';
import AlertContext from '../../context/AlertContext';
import Spinner from '../../components/layout/Spinner';
import ReportItem from './ReportItem';
import styled from 'styled-components';
import api from '../../services/api';

const ReportsContainer = styled.div`
  padding: 1.5rem;
`;

const ReportsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ReportsTitle = styled.h1`
  margin: 0;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const SearchFilterContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-right: 0.5rem;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 0.5rem;
    width: 100%;
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
  margin-right: 0.5rem;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 0.5rem;
    width: 100%;
  }
`;

const TeamFilterSelect = styled(FilterSelect)`
  min-width: 150px;
`;

const NoReportsMessage = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
`;

const ContentCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const CardHeader = styled.div`
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardBody = styled.div`
  padding: 1rem 1.5rem;
`;

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  
  const { setAlert } = useContext(AlertContext);
  
  // 보고서 및 팀 정보 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 보고서 로드
        const reportsRes = await api.get('/reports');
        setReports(reportsRes.data.data);
        setFilteredReports(reportsRes.data.data);
        
        // 팀 정보 로드
        const teamsRes = await api.get('/teams');
        setTeams(teamsRes.data.data);
        
        setLoading(false);
      } catch (err) {
        console.error('보고서 목록 로드 오류:', err);
        setAlert('보고서 목록을 불러오는데 실패했습니다', 'danger');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [setAlert]);
  
  // 검색 및 필터링 적용
  useEffect(() => {
    let result = reports;
    
    // 팀 필터링
    if (teamFilter !== 'all') {
      result = result.filter(report => 
        report.team && report.team._id === teamFilter
      );
    }
    
    // 상태 필터링
    if (statusFilter !== 'all') {
      result = result.filter(report => report.status === statusFilter);
    }
    
    // 검색어 필터링 (주차 번호로 검색)
    if (searchTerm) {
      result = result.filter(report => 
        report.weekNumber.toString().includes(searchTerm)
      );
    }
    
    setFilteredReports(result);
  }, [reports, searchTerm, statusFilter, teamFilter]);
  
  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // 상태 필터 변경 핸들러
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  // 팀 필터 변경 핸들러
  const handleTeamFilterChange = (e) => {
    setTeamFilter(e.target.value);
  };
  
  // 상태 텍스트 변환
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '완료됨';
      case 'in_progress': return '진행 중';
      case 'not_started': return '시작 전';
      default: return '전체';
    }
  };
  
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <ReportsContainer>
      <ReportsHeader>
        <ReportsTitle>주간 보고서</ReportsTitle>
      </ReportsHeader>
      
      <SearchFilterContainer>
        <SearchInput 
          type="text" 
          placeholder="주차 번호로 검색" 
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <FilterSelect 
          value={statusFilter} 
          onChange={handleStatusFilterChange}
        >
          <option value="all">모든 상태</option>
          <option value="not_started">시작 전</option>
          <option value="in_progress">진행 중</option>
          <option value="completed">완료됨</option>
        </FilterSelect>
        <TeamFilterSelect 
          value={teamFilter} 
          onChange={handleTeamFilterChange}
        >
          <option value="all">모든 팀</option>
          {teams.map(team => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </TeamFilterSelect>
      </SearchFilterContainer>
      
      <ContentCard>
        <CardHeader>
          <span>총 {filteredReports.length}개의 보고서</span>
          <span>
            {statusFilter !== 'all' && `상태: ${getStatusText(statusFilter)}`}
            {teamFilter !== 'all' && teamFilter && ` | 팀: ${teams.find(t => t._id === teamFilter)?.name}`}
          </span>
        </CardHeader>
        <CardBody>
          {filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <ReportItem key={report._id} report={report} />
            ))
          ) : (
            <NoReportsMessage>
              조건에 맞는 보고서가 없습니다.
            </NoReportsMessage>
          )}
        </CardBody>
      </ContentCard>
    </ReportsContainer>
  );
};

export default Reports;