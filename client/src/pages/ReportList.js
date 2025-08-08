import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import api from '../services/api';
import { Card, CardHeader, CardBody, CardTitle, Button, Input, Select, Badge } from '../components/common';
import ReportCard from './reports/ReportCard';  // 경로 수정
import Spinner from '../components/layout/Spinner';

const ReportsWrapper = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
    align-items: stretch;
  }
`;

const PageTitle = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
`;

const FilterSection = styled(Card)`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  align-items: end;
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing['3xl']} ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.secondary};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
`;

function ReportList() {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const [reports, setReports] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all', // all, not_started, in_progress, completed, on_hold
    team: 'all',
    search: '',
    sortBy: 'latest' // latest, oldest, deadline, completion
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, teamsRes] = await Promise.all([
        api.get('/reports'),
        api.get('/teams')
      ]);
      
      // ✨ 여기가 수정된 부분입니다.
      // API 응답 데이터가 배열인지 확인하고 상태를 업데이트합니다.
      const reportsData = reportsRes.data;
      setReports(Array.isArray(reportsData) ? reportsData : []);
      
      const teamsData = teamsRes.data;
      setTeams(Array.isArray(teamsData) ? teamsData : []);

    } catch (error) {
      console.error('Reports fetch error:', error);
      setAlert('보고서 목록을 불러오는데 실패했습니다.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('정말로 이 보고서를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/reports/${reportId}`);
      setReports(reports.filter(report => report._id !== reportId));
      setAlert('보고서가 성공적으로 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('Report delete error:', error);
      const message = error.response?.data?.message || '보고서 삭제에 실패했습니다.';
      setAlert(message, 'danger');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredAndSortedReports = () => {
    // 이제 `reports`는 항상 배열이므로 이 함수는 안전합니다.
    let filtered = reports.filter(report => {
      // 상태 필터
      if (filter.status !== 'all' && report.status !== filter.status) {
        return false;
      }

      // 팀 필터
      if (filter.team !== 'all' && report.team?._id !== filter.team) {
        return false;
      }

      // 검색 필터
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return report.title.toLowerCase().includes(searchLower) ||
               report.summary?.toLowerCase().includes(searchLower) ||
               report.team?.name.toLowerCase().includes(searchLower);
      }

      return true;
    });

    // 정렬
    filtered.sort((a, b) => {
      switch (filter.sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'deadline':
          return new Date(a.endDate || '9999-12-31') - new Date(b.endDate || '9999-12-31');
        case 'completion':
          return (b.completionRate || 0) - (a.completionRate || 0);
        case 'latest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  };

  const getReportStats = () => {
    const total = reports.length;
    const completed = reports.filter(r => r.status === 'completed').length;
    const inProgress = reports.filter(r => r.status === 'in_progress').length;
    const notStarted = reports.filter(r => r.status === 'not_started').length;
    const onHold = reports.filter(r => r.status === 'on_hold').length;
    const overdue = reports.filter(r => {
      const dueDate = new Date(r.endDate || '');
      return dueDate < new Date() && r.status !== 'completed';
    }).length;

    return { total, completed, inProgress, notStarted, onHold, overdue };
  };

  if (loading) {
    return (
      <ReportsWrapper>
        <LoadingContainer>
          <Spinner size="lg" text="보고서 목록 로딩 중..." />
        </LoadingContainer>
      </ReportsWrapper>
    );
  }

  const filteredReports = filteredAndSortedReports();
  const stats = getReportStats();

  return (
    <ReportsWrapper>
      <PageHeader>
        <div>
          <PageTitle>보고서 관리</PageTitle>
          <div style={{ 
            marginTop: '8px', 
            display: 'flex', 
            gap: '8px', 
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Badge variant="primary">전체 {stats.total}개</Badge>
            <Badge variant="success">완료 {stats.completed}개</Badge>
            <Badge variant="warning">진행중 {stats.inProgress}개</Badge>
            <Badge variant="secondary">시작 전 {stats.notStarted}개</Badge>
            {stats.onHold > 0 && <Badge variant="info">보류 {stats.onHold}개</Badge>}
            {stats.overdue > 0 && <Badge variant="danger">지연 {stats.overdue}개</Badge>}
          </div>
        </div>
        <HeaderActions>
          <Button as={Link} to="/teams" variant="outline">
            <i className="fas fa-users" style={{ marginRight: '8px' }} />
            팀에서 보고서 작성
          </Button>
        </HeaderActions>
      </PageHeader>

      <FilterSection>
        <CardHeader>
          <CardTitle>필터 및 정렬</CardTitle>
        </CardHeader>
        <CardBody>
          <FilterGrid>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '14px',
                fontWeight: 500,
                color: '#495057'
              }}>
                상태
              </label>
              <Select
                value={filter.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">전체</option>
                <option value="not_started">시작 전</option>
                <option value="in_progress">진행중</option>
                <option value="completed">완료</option>
                <option value="on_hold">보류</option>
              </Select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '14px',
                fontWeight: 500,
                color: '#495057'
              }}>
                팀
              </label>
              <Select
                value={filter.team}
                onChange={(e) => handleFilterChange('team', e.target.value)}
              >
                <option value="all">전체 팀</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '14px',
                fontWeight: 500,
                color: '#495057'
              }}>
                정렬
              </label>
              <Select
                value={filter.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="deadline">마감일순</option>
                <option value="completion">완료율순</option>
              </Select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '14px',
                fontWeight: 500,
                color: '#495057'
              }}>
                검색
              </label>
              <Input
                type="text"
                placeholder="제목, 내용, 팀명 검색..."
                value={filter.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </FilterGrid>
        </CardBody>
      </FilterSection>

      {filteredReports.length === 0 ? (
        <EmptyState>
          <i className="fas fa-file-alt" style={{ 
            fontSize: '4rem', 
            marginBottom: '24px',
            opacity: 0.3
          }} />
          <h3 style={{ marginBottom: '16px' }}>
            {filter.search || filter.status !== 'all' || filter.team !== 'all'
              ? '조건에 맞는 보고서가 없습니다' 
              : '아직 작성된 보고서가 없습니다'
            }
          </h3>
          <p style={{ marginBottom: '24px' }}>
            팀에 참여하여 주간 보고서를 작성해보세요.
          </p>
          <Button as={Link} to="/teams" variant="primary" size="lg">
            <i className="fas fa-users" style={{ marginRight: '8px' }} />
            팀 목록 보기
          </Button>
        </EmptyState>
      ) : (
        <ReportsGrid>
          {filteredReports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              onDelete={handleDeleteReport}
            />
          ))}
        </ReportsGrid>
      )}

      {/* 통계 정보 */}
      {reports.length > 0 && (
        <div style={{ 
          marginTop: '48px',
          padding: '24px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h6 style={{ 
            margin: '0 0 16px 0',
            color: '#495057',
            fontWeight: 600
          }}>
            📊 보고서 현황
          </h6>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            fontSize: '14px'
          }}>
            <div>
              <strong style={{ color: '#0366d6' }}>총 보고서:</strong> {stats.total}개
            </div>
            <div>
              <strong style={{ color: '#28a745' }}>완료율:</strong> {
                stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
              }%
            </div>
            <div>
              <strong style={{ color: '#ffc107' }}>진행중:</strong> {stats.inProgress}개
            </div>
            {stats.overdue > 0 && (
              <div>
                <strong style={{ color: '#dc3545' }}>지연:</strong> {stats.overdue}개
              </div>
            )}
          </div>
        </div>
      )}
    </ReportsWrapper>
  );
}

export default ReportList;