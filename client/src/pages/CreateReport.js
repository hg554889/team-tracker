import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createReport } from '../services/api';
import Spinner from '../components/layout/Spinner';

function CreateReport() {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ goals: '', progress: '', completionRate: 0, status: 'not_started' });
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
      navigate(`/teams/${teamId}`);
    } catch (err) {
      setError('보고서 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>보고서 작성</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div>
          <label>목표</label>
          <input name="goals" value={form.goals} onChange={handleChange} required />
        </div>
        <div>
          <label>진행 상황</label>
          <textarea name="progress" value={form.progress} onChange={handleChange} required />
        </div>
        <div>
          <label>완료율 (%)</label>
          <input name="completionRate" type="number" min="0" max="100" value={form.completionRate} onChange={handleChange} required />
        </div>
        <div>
          <label>상태</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="not_started">시작 전</option>
            <option value="in_progress">진행 중</option>
            <option value="completed">완료</option>
          </select>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={loading}>{loading ? <Spinner size="sm" /> : '제출'}</button>
        </div>
      </form>
    </div>
  );
}

export default CreateReport; 