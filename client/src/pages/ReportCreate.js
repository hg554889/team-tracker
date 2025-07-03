import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createReport } from '../services/api';
import Spinner from '../components/layout/Spinner';
import { useAlert } from '../context/AlertContext';

function ReportCreate() {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const [form, setForm] = useState({
    goals: '',
    progress: '',
    completionRate: 0,
    status: 'not_started',
    challenges: '',
    nextWeekPlan: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createReport(teamId, form);
      setAlert('보고서가 작성되었습니다!', 'success');
      navigate(`/teams/${teamId}`);
    } catch (err) {
      setError('보고서 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h2>보고서 작성</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label className="form-label">목표</label>
          <input name="goals" className="form-control" value={form.goals} onChange={handleChange} required />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">진행상황</label>
          <textarea name="progress" className="form-control" value={form.progress} onChange={handleChange} required />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">완료율 (%)</label>
          <input name="completionRate" type="number" min="0" max="100" className="form-control" value={form.completionRate} onChange={handleChange} required />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">상태</label>
          <select name="status" className="form-select" value={form.status} onChange={handleChange}>
            <option value="not_started">시작 전</option>
            <option value="in_progress">진행 중</option>
            <option value="completed">완료</option>
          </select>
        </div>
        <div className="form-group mb-3">
          <label className="form-label">도전과제</label>
          <input name="challenges" className="form-control" value={form.challenges} onChange={handleChange} />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">다음주 계획</label>
          <input name="nextWeekPlan" className="form-control" value={form.nextWeekPlan} onChange={handleChange} />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Spinner size="sm" /> : '제출'}</button>
        </div>
      </form>
    </div>
  );
}

export default ReportCreate; 