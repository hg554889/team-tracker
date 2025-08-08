// client/src/pages/teams/Teams.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';
import { Card, CardHeader, CardBody, CardTitle, Button, Input, Select, Badge } from '../../components/common';
import TeamCard from '../../components/teams/TeamCard';  // 새로 생성한 TeamCard
import Spinner from '../../components/layout/Spinner';

const TeamsWrapper = styled.div`
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
  grid-template-columns: 1fr 1fr 2fr;
  gap: ${props => props.theme.spacing.md};
  align-items: end;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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

const Teams = () => {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all', // all, study, project
    search: '',
    myTeamsOnly: false
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teams');
      setTeams(response.data || []);
    } catch (error) {
      console.error('Teams fetch error:', error);
      setAlert('팀 목록을 불러오는데 실패했습니다.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('정말로 이 팀을 삭제하시겠습니까? 모든 보고서도 함께 삭제됩니다.')) {
      return;
    }

    try {
      await api.delete(`/teams/${teamId}`);
      setTeams(teams.filter(team => team._id !== teamId));
      setAlert('팀이 성공적으로 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('Team delete error:', error);
      const message = error.response?.data?.message || '팀 삭제에 실패했습니다.';
      setAlert(message, 'danger');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredTeams = teams.filter(team => {
    // 타입 필터
    if (filter.type !== 'all' && team.type !== filter.type) {
      return false;
    }

    // 검색 필터
    if (filter.search && !team.name.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }

    // 내 팀만 보기 필터
    if (filter.myTeamsOnly) {
      const isMyTeam = team.leader?._id === user._id || 
                      team.members?.some(member => member._id === user._id);
      if (!isMyTeam) {
        return false;
      }
    }

    return true;
  });

  const canCreateTeam = () => {
    return user?.role === 'admin' || user?.role === 'executive' || user?.role === 'leader';
  };

  const getTeamStats = () => {
    const total = filteredTeams.length;
    const myTeams = filteredTeams.filter(team => 
      team.leader?._id === user._id || 
      team.members?.some(member => member._id === user._id)
    ).length;
    const studyTeams = filteredTeams.filter(team => team.type === 'study').length;
    const projectTeams = filteredTeams.filter(team => team.type === 'project').length;

    return { total, myTeams, studyTeams, projectTeams };
  };

  if (loading) {
    return (
      <TeamsWrapper>
        <LoadingContainer>
          <Spinner size="lg" text="팀 목록 로딩 중..." />
        </LoadingContainer>
      </TeamsWrapper>
    );
  }

  const stats = getTeamStats();

  return (
    <TeamsWrapper>
      <PageHeader>
        <div>
          <PageTitle>팀 관리</PageTitle>
          <div style={{ 
            marginTop: '8px', 
            display: 'flex', 
            gap: '12px', 
            alignItems: 'center' 
          }}>
            <Badge variant="primary">전체 {stats.total}개</Badge>
            <Badge variant="info">스터디 {stats.studyTeams}개</Badge>
            <Badge variant="success">프로젝트 {stats.projectTeams}개</Badge>
            <Badge variant="secondary">내 팀 {stats.myTeams}개</Badge>
          </div>
        </div>
        <HeaderActions>
          {canCreateTeam() && (
            <Button as={Link} to="/teams/create" variant="primary">
              <i className="fas fa-plus" style={{ marginRight: '8px' }} />
              새 팀 만들기
            </Button>
          )}
        </HeaderActions>
      </PageHeader>

      <FilterSection>
        <CardHeader>
          <CardTitle>필터</CardTitle>
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
                팀 유형
              </label>
              <Select
                value={filter.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">전체</option>
                <option value="study">스터디</option>
                <option value="project">프로젝트</option>
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
                표시 옵션
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                height: '42px',
                paddingLeft: '12px'
              }}>
                <input
                  type="checkbox"
                  id="myTeamsOnly"
                  checked={filter.myTeamsOnly}
                  onChange={(e) => handleFilterChange('myTeamsOnly', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="myTeamsOnly" style={{ margin: 0, fontSize: '14px' }}>
                  내 팀만 보기
                </label>
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontSize: '14px',
                fontWeight: 500,
                color: '#495057'
              }}>
                팀 이름 검색
              </label>
              <Input
                type="text"
                placeholder="팀 이름을 입력하세요..."
                value={filter.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </FilterGrid>
        </CardBody>
      </FilterSection>

      {filteredTeams.length === 0 ? (
        <EmptyState>
          <i className="fas fa-users" style={{ 
            fontSize: '4rem', 
            marginBottom: '24px',
            opacity: 0.3
          }} />
          <h3 style={{ marginBottom: '16px' }}>
            {filter.search || filter.myTeamsOnly || filter.type !== 'all' 
              ? '조건에 맞는 팀이 없습니다' 
              : '아직 생성된 팀이 없습니다'
            }
          </h3>
          <p style={{ marginBottom: '24px' }}>
            {canCreateTeam() 
              ? '새로운 팀을 생성해서 활동을 시작해보세요.' 
              : '팀장이나 관리자가 팀을 생성할 때까지 기다려주세요.'
            }
          </p>
          {canCreateTeam() && (
            <Button as={Link} to="/teams/create" variant="primary" size="lg">
              <i className="fas fa-plus" style={{ marginRight: '8px' }} />
              첫 번째 팀 만들기
            </Button>
          )}
        </EmptyState>
      ) : (
        <TeamsGrid>
          {filteredTeams.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              onDelete={handleDeleteTeam}
            />
          ))}
        </TeamsGrid>
      )}
    </TeamsWrapper>
  );
};

export default Teams;