// client/src/pages/reports/Reports.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';
import ReportItem from './ReportItem';
import Spinner from '../../components/layout/Spinner';

const Reports = () => {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const [reports, setReports] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all', // all, not_started, in_progress, completed
    team: 'all',
    search: '',
    sortBy: 'latest' // latest, oldest, deadline
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
      
      setReports(reportsRes.data || []);
      setTeams(teamsRes.data || []);
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
      setAlert('보고서 삭제에 실패했습니다.', 'danger');
    }
  };

  const canManageReport = (report) => {
    if (user?.role === 'admin' || user?.role === 'executive') return true;
    if (report.submittedBy?._id === user?._id) return true;
    return false;
  };

  const getFilteredAndSortedReports = () => {
    let filtered = reports.filter(report => {
      // Status filter
      if (filter.status !== 'all' && report.status !== filter.status) {
        return false;
      }
      
      // Team filter
      if (filter.team !== 'all' && report.team?._id !== filter.team) {
        return false;
      }
      
      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        return (
          report.team?.name?.toLowerCase().includes(searchLower) ||
          report.goals?.toLowerCase().includes(searchLower) ||
          report.progress?.toLowerCase().includes(searchLower) ||
          report.submittedBy?.name?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

    // Sort reports
    filtered.sort((a, b) => {
      switch (filter.sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'deadline':
          return new Date(a.endDate) - new Date(b.endDate);
        case 'latest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  };

  const getReportStats = () => {
    return {
      total: reports.length,
      completed: reports.filter(r => r.status === 'completed').length,
      inProgress: reports.filter(r => r.status === 'in_progress').length,
      notStarted: reports.filter(r => r.status === 'not_started').length,
      overdue: reports.filter(r => 
        new Date(r.endDate) < new Date() && r.status !== 'completed'
      ).length
    };
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in_progress': return '진행 중';
      case 'not_started': return '시작 전';
      default: return status;
    }
  };

  const filteredReports = getFilteredAndSortedReports();
  const stats = getReportStats();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="reports">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>보고서 관리</h1>
          <p className="text-muted mb-0">
            팀의 주간 보고서를 작성하고 관리할 수 있습니다.
          </p>
        </div>
        <Link to="/reports/create" className="btn btn-primary">
          <i className="fas fa-plus mr-2"></i>
          새 보고서 작성
        </Link>
      </div>

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary">{stats.total}</h3>
              <p className="text-muted mb-0">전체</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success">{stats.completed}</h3>
              <p className="text-muted mb-0">완료</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning">{stats.inProgress}</h3>
              <p className="text-muted mb-0">진행 중</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-secondary">{stats.notStarted}</h3>
              <p className="text-muted mb-0">시작 전</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-danger">{stats.overdue}</h3>
              <p className="text-muted mb-0">지연</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="search" className="form-label">검색</label>
                <input
                  type="text"
                  className="form-control"
                  id="search"
                  placeholder="팀명, 내용, 작성자로 검색..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <label htmlFor="status-filter" className="form-label">상태</label>
                <select
                  className="form-select"
                  id="status-filter"
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                >
                  <option value="all">전체</option>
                  <option value="not_started">시작 전</option>
                  <option value="in_progress">진행 중</option>
                  <option value="completed">완료</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="team-filter" className="form-label">팀</label>
                <select
                  className="form-select"
                  id="team-filter"
                  value={filter.team}
                  onChange={(e) => setFilter({ ...filter, team: e.target.value })}
                >
                  <option value="all">전체 팀</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-2">
              <div className="form-group">
                <label htmlFor="sort-filter" className="form-label">정렬</label>
                <select
                  className="form-select"
                  id="sort-filter"
                  value={filter.sortBy}
                  onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
                >
                  <option value="latest">최신순</option>
                  <option value="oldest">오래된순</option>
                  <option value="deadline">마감일순</option>
                </select>
              </div>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilter({ 
                  status: 'all', 
                  team: 'all', 
                  search: '', 
                  sortBy: 'latest' 
                })}
              >
                <i className="fas fa-redo mr-2"></i>
                초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            보고서 목록
            {filteredReports.length !== reports.length && (
              <span className="text-muted ml-2">
                ({filteredReports.length}/{reports.length})
              </span>
            )}
          </h5>
          
          <div className="d-flex align-items-center">
            <small className="text-muted mr-3">
              {filteredReports.length}개 항목
            </small>
            
            {/* View Toggle */}
            <div className="btn-group btn-group-sm" role="group">
              <button type="button" className="btn btn-outline-secondary active">
                <i className="fas fa-list"></i>
              </button>
              <button type="button" className="btn btn-outline-secondary">
                <i className="fas fa-th"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {filteredReports.length > 0 ? (
            <div className="list-group list-group-flush">
              {filteredReports.map(report => (
                <ReportItem 
                  key={report._id} 
                  report={report}
                  canManage={canManageReport(report)}
                  onDelete={handleDeleteReport}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">
                {filter.search || filter.status !== 'all' || filter.team !== 'all' ? 
                  '조건에 맞는 보고서가 없습니다.' : 
                  '아직 작성된 보고서가 없습니다.'
                }
              </h4>
              <p className="text-muted mb-3">
                {filter.search || filter.status !== 'all' || filter.team !== 'all' ? 
                  '검색 조건을 변경하거나 필터를 초기화해보세요.' :
                  '첫 번째 보고서를 작성하여 시작해보세요.'
                }
              </p>
              {(!filter.search && filter.status === 'all' && filter.team === 'all') && (
                <Link to="/reports/create" className="btn btn-primary">
                  <i className="fas fa-plus mr-2"></i>
                  첫 번째 보고서 작성하기
                </Link>
              )}
              {(filter.search || filter.status !== 'all' || filter.team !== 'all') && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setFilter({ 
                    status: 'all', 
                    team: 'all', 
                    search: '', 
                    sortBy: 'latest' 
                  })}
                >
                  <i className="fas fa-redo mr-2"></i>
                  모든 보고서 보기
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Info */}
      {filteredReports.length > 0 && (
        <div className="mt-4">
          <small className="text-muted">
            총 {filteredReports.length}개의 보고서가 표시되고 있습니다.
            {filter.search && ` (검색: "${filter.search}")`}
            {filter.status !== 'all' && ` (상태: ${getStatusDisplayName(filter.status)})`}
            {filter.team !== 'all' && ` (팀: ${teams.find(t => t._id === filter.team)?.name})`}
          </small>
        </div>
      )}
    </div>
  );
};

export default Reports;