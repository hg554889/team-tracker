import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchReport } from '../services/api';
import Spinner from '../components/layout/Spinner';

function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchReport(id);
        setReport(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Spinner size="lg" />;
  if (!report) return <div>보고서 정보를 불러올 수 없습니다.</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>보고서 상세</h2>
      <div className="card mb-3">
        <div className="card-body">
          <div><b>주차:</b> {report.weekNumber}</div>
          <div><b>목표:</b> {report.goals}</div>
          <div><b>진행상황:</b> {report.progress}</div>
          <div><b>완료율:</b> {report.completionRate}%</div>
          <div><b>상태:</b> {report.status === 'completed' ? '완료' : report.status === 'in_progress' ? '진행 중' : '시작 전'}</div>
          <div><b>도전과제:</b> {report.challenges}</div>
          <div><b>다음주 계획:</b> {report.nextWeekPlan}</div>
          <div><b>작성자:</b> {report.submittedBy?.name} ({report.submittedBy?.email})</div>
          <div><b>작성일:</b> {new Date(report.createdAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

export default ReportDetails; 