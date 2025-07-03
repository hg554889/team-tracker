import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTeam, fetchTeamReports, addTeamMember, removeTeamMember } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import Spinner from '../components/layout/Spinner';
import MemberList from '../components/team/MemberList';
import ReportCard from '../components/report/ReportCard';

function TeamDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);

  const canEdit = user && (user.role === 'admin' || team?.leader?._id === user._id);
  const canAddMember = canEdit;
  const canRemoveMember = canEdit;
  const canWriteReport = user && (user.role === 'admin' || team?.leader?._id === user._id);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [teamRes, reportsRes] = await Promise.all([
          fetchTeam(id),
          fetchTeamReports(id)
        ]);
        setTeam(teamRes.data.data);
        setReports(reportsRes.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberLoading(true);
    try {
      await addTeamMember(id, { email: memberEmail });
      setAlert('팀원이 추가되었습니다!', 'success');
      setMemberEmail('');
      // reload team info
      const res = await fetchTeam(id);
      setTeam(res.data.data);
    } catch (err) {
      setAlert(
        err.response?.data?.error || err.response?.data?.message || '팀원 추가에 실패했습니다.',
        'danger'
      );
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    setMemberLoading(true);
    try {
      await removeTeamMember(id, userId);
      setAlert('팀원이 제거되었습니다!', 'success');
      // reload team info
      const res = await fetchTeam(id);
      setTeam(res.data.data);
    } catch (err) {
      setAlert(
        err.response?.data?.error || err.response?.data?.message || '팀원 제거에 실패했습니다.',
        'danger'
      );
    } finally {
      setMemberLoading(false);
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (!team) return <div>팀 정보를 불러올 수 없습니다.</div>;

  return (
    <div>
      <h2>{team.name} <span style={{ fontSize: 16, color: '#888' }}>({team.type})</span></h2>
      <div style={{ marginBottom: 16 }}>{team.description}</div>
      <div style={{ marginBottom: 24 }}>
        <b>리더:</b> {team.leader?.name} ({team.leader?.email})
      </div>
      <h4>팀원</h4>
      <MemberList members={team.members || []} onRemove={handleRemoveMember} canRemove={canRemoveMember} />
      {canAddMember && (
        <form onSubmit={handleAddMember} className="d-flex align-items-center mt-2 mb-4" style={{ gap: 8 }}>
          <input type="email" className="form-control" placeholder="이메일로 팀원 초대" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
          <button className="btn btn-success" type="submit" disabled={memberLoading}>추가</button>
        </form>
      )}
      <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
        <h4>보고서 목록</h4>
        {canWriteReport && (
          <button className="btn btn-primary" onClick={() => navigate(`/teams/${id}/report/new`)}>보고서 작성</button>
        )}
      </div>
      {reports.length === 0 ? <div>보고서가 없습니다.</div> : (
        reports.map((report) => <ReportCard key={report._id} report={report} />)
      )}
    </div>
  );
}

export default TeamDetails; 