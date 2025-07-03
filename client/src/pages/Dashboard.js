import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchTeams, fetchReports } from '../services/api';
import Spinner from '../components/layout/Spinner';

function Dashboard() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [teamsRes, reportsRes] = await Promise.all([
          fetchTeams(),
          fetchReports()
        ]);
        setTeams(teamsRes.data.data || []);
        setReports(reportsRes.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner size="lg" />;

  // 권한별 대시보드 요약
  return (
    <div>
      <h2>대시보드</h2>
      <div className="dashboard-stats d-flex" style={{ gap: 24, marginBottom: 32 }}>
        <div className="stat-card card">
          <div className="stat-value" style={{ fontSize: 28 }}>{teams.length}</div>
          <div className="stat-label">내 팀 수</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value" style={{ fontSize: 28 }}>{reports.length}</div>
          <div className="stat-label">내 보고서 수</div>
        </div>
        {/* 추가 통계/권한별 위젯은 필요시 확장 */}
      </div>
      <div>
        <h4>최근 보고서</h4>
        <ul>
          {reports.slice(0, 5).map((r) => (
            <li key={r._id}>{r.goals} - {r.status} ({new Date(r.createdAt).toLocaleDateString()})</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard; 