// client/src/pages/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import api from '../../services/api';
import DashboardStat from './DashboardStat';
import TeamProgressCard from './TeamProgressCard';
import UpcomingReportCard from './UpcomingReportCard';
import Spinner from '../../components/layout/Spinner';

const Dashboard = () => {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalTeams: 0,
      totalReports: 0,
      pendingReports: 0,
      totalMembers: 0
    },
    recentTeams: [],
    upcomingReports: [],
    recentReports: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard data based on user role
      const endpoints = [];
      
      if (user?.role === 'admin' || user?.role === 'executive') {
        endpoints.push(
          api.get('/teams'),
          api.get('/reports'),
          api.get('/auth/users') // Only for admin/executive
        );
      } else {
        endpoints.push(
          api.get('/teams'), // User's teams
          api.get('/reports') // User's reports
        );
      }

      const responses = await Promise.all(endpoints);
      const [teamsRes, reportsRes, usersRes] = responses;

      // 안전한 데이터 처리
      const teams = Array.isArray(teamsRes.data) ? teamsRes.data : [];
      const reports = Array.isArray(reportsRes.data) ? reportsRes.data : [];
      const users = usersRes?.data ? (Array.isArray(usersRes.data) ? usersRes.data : []) : [];

      // Calculate statistics
      const stats = {
        totalTeams: teams.length,
        totalReports: reports.length,
        pendingReports: reports.filter(report => report.status === 'not_started' || report.status === 'in_progress').length,
        totalMembers: users.length || 0
      };

      // Get recent teams (last 5)
      const recentTeams = teams
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Get upcoming reports (next 5 due)
      const now = new Date();
      const upcomingReports = reports
        .filter(report => new Date(report.endDate) > now && report.status !== 'completed')
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
        .slice(0, 5);

      // Get recent reports (last 5)
      const recentReports = reports
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setDashboardData({
        stats,
        recentTeams,
        upcomingReports,
        recentReports
      });

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setAlert('대시보드 데이터를 불러오는데 실패했습니다.', 'danger');
      
      // 에러 시 빈 데이터로 초기화
      setDashboardData({
        stats: {
          totalTeams: 0,
          totalReports: 0,
          pendingReports: 0,
          totalMembers: 0
        },
        recentTeams: [],
        upcomingReports: [],
        recentReports: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침입니다';
    if (hour < 18) return '안녕하세요';
    return '좋은 저녁입니다';
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return '관리자';
      case 'executive': return '임원';
      case 'leader': return '리더';
      case 'member': return '멤버';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">
            {getGreeting()}, {user?.name}님!
          </h1>
          <p className="text-muted mb-0">
            {getRoleDisplayName(user?.role)}로 로그인하셨습니다.
          </p>
        </div>
        <div className="d-flex gap-2">
          {(user?.role === 'admin' || user?.role === 'executive' || user?.role === 'leader') && (
            <Link to="/teams/create" className="btn btn-primary">
              <i className="fas fa-plus mr-2"></i>
              팀 생성
            </Link>
          )}
          <Link to="/reports/create" className="btn btn-outline-primary">
            <i className="fas fa-edit mr-2"></i>
            보고서 작성
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-stats">
        <DashboardStat
          title="총 팀 수"
          value={dashboardData.stats.totalTeams}
          icon="fas fa-users"
          color="primary"
          link="/teams"
        />
        <DashboardStat
          title="총 보고서 수"
          value={dashboardData.stats.totalReports}
          icon="fas fa-file-alt"
          color="success"
          link="/reports"
        />
        <DashboardStat
          title="대기 중인 보고서"
          value={dashboardData.stats.pendingReports}
          icon="fas fa-clock"
          color="warning"
          link="/reports"
        />
        {(user?.role === 'admin' || user?.role === 'executive') && (
          <DashboardStat
            title="총 멤버 수"
            value={dashboardData.stats.totalMembers}
            icon="fas fa-user-friends"
            color="info"
            link="/admin/users"
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="row">
        {/* Recent Teams */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">최근 팀</h5>
              <Link to="/teams" className="btn btn-sm btn-outline-primary">
                전체 보기
              </Link>
            </div>
            <div className="card-body">
              {dashboardData.recentTeams.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.recentTeams.map(team => (
                    <TeamProgressCard key={team._id} team={team} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-users fa-2x text-muted mb-3"></i>
                  <p className="text-muted">아직 팀이 없습니다.</p>
                  {(user?.role === 'admin' || user?.role === 'executive' || user?.role === 'leader') && (
                    <Link to="/teams/create" className="btn btn-primary btn-sm">
                      첫 번째 팀 생성하기
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Reports */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">마감 임박 보고서</h5>
              <Link to="/reports" className="btn btn-sm btn-outline-primary">
                전체 보기
              </Link>
            </div>
            <div className="card-body">
              {dashboardData.upcomingReports.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.upcomingReports.map(report => (
                    <UpcomingReportCard key={report._id} report={report} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-calendar-check fa-2x text-muted mb-3"></i>
                  <p className="text-muted">마감 임박한 보고서가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">최근 보고서</h5>
              <Link to="/reports" className="btn btn-sm btn-outline-primary">
                전체 보기
              </Link>
            </div>
            <div className="card-body">
              {dashboardData.recentReports.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>팀</th>
                        <th>주차</th>
                        <th>상태</th>
                        <th>완료율</th>
                        <th>마감일</th>
                        <th>작성자</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentReports.map(report => (
                        <tr key={report._id} style={{ cursor: 'pointer' }}>
                          <td>
                            <Link to={`/reports/${report._id}`} className="text-decoration-none">
                              {report.team?.name || 'Unknown Team'}
                            </Link>
                          </td>
                          <td>{report.weekNumber}주차</td>
                          <td>
                            <span className={`badge badge-${
                              report.status === 'completed' ? 'success' :
                              report.status === 'in_progress' ? 'warning' : 'secondary'
                            }`}>
                              {report.status === 'completed' ? '완료' :
                               report.status === 'in_progress' ? '진행 중' : '시작 전'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress mr-2" style={{ width: '60px', height: '8px' }}>
                                <div 
                                  className={`progress-bar ${
                                    report.completionRate >= 80 ? 'progress-bar-success' :
                                    report.completionRate >= 60 ? 'progress-bar-warning' : 'progress-bar-danger'
                                  }`}
                                  style={{ width: `${report.completionRate || 0}%` }}
                                ></div>
                              </div>
                              <small>{report.completionRate || 0}%</small>
                            </div>
                          </td>
                          <td>{new Date(report.endDate).toLocaleDateString('ko-KR')}</td>
                          <td>{report.submittedBy?.name || 'Unknown'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-file-alt fa-2x text-muted mb-3"></i>
                  <p className="text-muted">아직 보고서가 없습니다.</p>
                  <Link to="/reports/create" className="btn btn-primary btn-sm">
                    첫 번째 보고서 작성하기
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;