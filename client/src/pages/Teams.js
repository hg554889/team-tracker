import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTeams } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/layout/Spinner';
import TeamCard from '../components/team/TeamCard';

function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchTeams();
        setTeams(res.data.data || []);
      } catch (err) {
        setError('팀 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>팀 목록</h2>
        {(user?.role === 'admin' || user?.role === 'leader') && (
          <button className="btn btn-primary" onClick={() => navigate('/teams/create')}>팀 생성</button>
        )}
      </div>
      {loading ? <Spinner /> : (
        <div>
          {teams.length === 0 ? <div>팀이 없습니다.</div> : (
            teams.map((team) => (
              <TeamCard key={team._id} team={team} canEdit={user?.role === 'admin' || team.leader?._id === user?._id} canDelete={user?.role === 'admin' || team.leader?._id === user?._id} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Teams; 