// client/src/pages/teams/Teams.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';
import TeamCard from './TeamCard';
import Spinner from '../../components/layout/Spinner';

const Teams = () => {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all', // all, study, project
    search: ''
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
    if (!window.confirm('정말로 이 팀을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/teams/${teamId}`);
      setTeams(teams.filter(team => team._id !== teamId));
      setAlert('팀이 성공적으로 삭제되었습니다.', 'success');
    } catch (error) {
      console.error('Team delete error:', error);
      setAlert('팀 삭제에 실패했습니다.', 'danger');
    }
  };

  const canManageTeam = (team) => {
    if (user?.role === 'admin' || user?.role === 'executive') return true;
    if (user?.role === 'leader' && team.leader?._id === user._id) return true;
    return false;
  };

  const canCreateTeam = () => {
    return ['admin', 'executive', 'leader'].includes(user?.role);
  };

  const filteredTeams = teams.filter(team => {
    // Type filter
    if (filter.type !== 'all' && team.type !== filter.type) {
      return false;
    }
    
    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        team.name.toLowerCase().includes(searchLower) ||
        team.description?.toLowerCase().includes(searchLower) ||
        team.leader?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getTeamStats = () => {
    return {
      total: teams.length,
      study: teams.filter(t => t.type === 'study').length,
      project: teams.filter(t => t.type === 'project').length,
      myTeams: teams.filter(t => 
        t.leader?._id === user?._id || 
        t.members?.some(m => m._id === user?._id)
      ).length
    };
  };

  const stats = getTeamStats();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="teams">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>팀 관리</h1>
          <p className="text-muted mb-0">
            동아리 내 모든 팀을 관리하고 확인할 수 있습니다.
          </p>
        </div>
        {canCreateTeam() && (
          <Link to="/teams/create" className="btn btn-primary">
            <i className="fas fa-plus mr-2"></i>
            새 팀 생성
          </Link>
        )}
      </div>

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary">{stats.total}</h3>
              <p className="text-muted mb-0">전체 팀</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-info">{stats.study}</h3>
              <p className="text-muted mb-0">스터디 팀</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success">{stats.project}</h3>
              <p className="text-muted mb-0">프로젝트 팀</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning">{stats.myTeams}</h3>
              <p className="text-muted mb-0">내 팀</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="search" className="form-label">팀 검색</label>
                <input
                  type="text"
                  className="form-control"
                  id="search"
                  placeholder="팀명, 설명, 리더명으로 검색..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="type-filter" className="form-label">팀 타입</label>
                <select
                  className="form-select"
                  id="type-filter"
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                >
                  <option value="all">전체</option>
                  <option value="study">스터디</option>
                  <option value="project">프로젝트</option>
                </select>
              </div>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setFilter({ type: 'all', search: '' })}
              >
                <i className="fas fa-redo mr-2"></i>
                필터 초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="row">
        {filteredTeams.length > 0 ? (
          filteredTeams.map(team => (
            <div key={team._id} className="col-lg-4 col-md-6 mb-4">
              <TeamCard 
                team={team} 
                canManage={canManageTeam(team)}
                onDelete={handleDeleteTeam}
                currentUser={user}
              />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fas fa-users fa-3x text-muted mb-3"></i>
                <h4 className="text-muted">
                  {filter.search || filter.type !== 'all' ? 
                    '조건에 맞는 팀이 없습니다.' : 
                    '아직 생성된 팀이 없습니다.'
                  }
                </h4>
                <p className="text-muted mb-3">
                  {filter.search || filter.type !== 'all' ? 
                    '검색 조건을 변경하거나 필터를 초기화해보세요.' :
                    '첫 번째 팀을 생성하여 시작해보세요.'
                  }
                </p>
                {canCreateTeam() && (!filter.search && filter.type === 'all') && (
                  <Link to="/teams/create" className="btn btn-primary">
                    <i className="fas fa-plus mr-2"></i>
                    첫 번째 팀 생성하기
                  </Link>
                )}
                {(filter.search || filter.type !== 'all') && (
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setFilter({ type: 'all', search: '' })}
                  >
                    <i className="fas fa-redo mr-2"></i>
                    모든 팀 보기
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Info */}
      {filteredTeams.length > 0 && (
        <div className="mt-4">
          <small className="text-muted">
            총 {filteredTeams.length}개의 팀이 표시되고 있습니다.
            {filter.search && ` (검색: "${filter.search}")`}
            {filter.type !== 'all' && ` (타입: ${filter.type === 'study' ? '스터디' : '프로젝트'})`}
          </small>
        </div>
      )}
    </div>
  );
};

export default Teams;