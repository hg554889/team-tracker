import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTeam } from '../services/api';
import Spinner from '../components/layout/Spinner';
import { useAlert } from '../context/AlertContext';

function TeamCreate() {
  const [form, setForm] = useState({ name: '', type: 'project', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createTeam(form);
      setAlert('팀이 생성되었습니다!', 'success');
      navigate('/teams');
    } catch (err) {
      setError('팀 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h2>팀 생성</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label className="form-label">팀 이름</label>
          <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">유형</label>
          <select name="type" className="form-select" value={form.type} onChange={handleChange} required>
            <option value="project">프로젝트</option>
            <option value="study">스터디</option>
          </select>
        </div>
        <div className="form-group mb-3">
          <label className="form-label">설명</label>
          <textarea name="description" className="form-control" value={form.description} onChange={handleChange} required />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Spinner size="sm" /> : '생성'}</button>
        </div>
      </form>
    </div>
  );
}

export default TeamCreate; 