import React from 'react';
import { useNavigate } from 'react-router-dom';

function TeamCard({ team, canEdit, canDelete }) {
  const navigate = useNavigate();
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <span style={{ fontWeight: 600, fontSize: 18 }}>{team.name}</span>
          <span style={{ marginLeft: 12, fontSize: 14, color: '#888' }}>({team.type})</span>
        </div>
        {canEdit && (
          <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/teams/${team._id}/edit`)} style={{ marginRight: 8 }}>수정</button>
        )}
        {canDelete && (
          <button className="btn btn-sm btn-outline-danger" onClick={() => navigate(`/teams/${team._id}/delete`)}>삭제</button>
        )}
      </div>
      <div className="card-body">
        <div style={{ marginBottom: 8 }}>{team.description}</div>
        <div style={{ fontSize: 14, color: '#666' }}>리더: {team.leader?.name || 'N/A'}</div>
        <div style={{ fontSize: 14, color: '#666' }}>멤버: {team.members?.length || 0}명</div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate(`/teams/${team._id}`)}>상세 보기</button>
      </div>
    </div>
  );
}

export default TeamCard; 