import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/layout/Spinner';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
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
      await register(form);
      navigate('/');
    } catch (err) {
      setError('회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: 400, margin: '40px auto' }}>
      <div className="auth-card card">
        <div className="auth-header card-header text-center">
          <h2>회원가입</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label className="form-label">이름</label>
              <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">아이디(영문)</label>
              <input name="username" className="form-control" value={form.username} onChange={handleChange} required />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">이메일</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">비밀번호</label>
              <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? <Spinner size="sm" /> : '회원가입'}</button>
              <a href="/login" style={{ fontSize: 14 }}>로그인</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register; 