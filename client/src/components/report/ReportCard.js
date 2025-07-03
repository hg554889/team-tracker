import React from 'react';
import { useNavigate } from 'react-router-dom';

function ReportCard({ report }) {
  const navigate = useNavigate();
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <span style={{ fontWeight: 600 }}>주차 {report.weekNumber}</span>
        <span style={{ fontSize: 13, color: '#888' }}>{report.status === 'completed' ? '완료' : report.status === 'in_progress' ? '진행 중' : '시작 전'}</span>
      </div>
      <div className="card-body">
        <div><b>목표:</b> {report.goals}</div>
        <div><b>진행상황:</b> {report.progress}</div>
        <div><b>완료율:</b> {report.completionRate}%</div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate(`/reports/${report._id}`)}>상세 보기</button>
      </div>
    </div>
  );
}

export default ReportCard; 