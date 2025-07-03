import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTeam, updateTeam } from '../services/api';
import Spinner from '../components/layout/Spinner';
import { useAlert } from '../context/AlertContext';

function TeamEdit() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', type: 'project', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchTeam(id);
        setForm({
          name: res.data.data.name,
          type: res.data.data.type,
          description: res.data.data.description
        });
      } catch (err) {
        setError('팀 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateTeam(id, form);
      setAlert('팀 정보가 수정되었습니다!', 'success');
      navigate(`/teams/${id}`);
    } catch (err) {
      setError('팀 정보 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h2>팀 정보 수정</h2>
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
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Spinner size="sm" /> : '저장'}</button>
        </div>
      </form>
    </div>
  );
}

export default TeamEdit; 