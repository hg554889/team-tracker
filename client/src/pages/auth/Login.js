// client/src/pages/auth/Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;
  const { login, isAuthenticated, error, clearErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear errors when component mounts
    clearErrors();
  }, [isAuthenticated, navigate, clearErrors]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login({ email, password });
      // 로그인 성공 시 navigate는 useEffect에서 처리
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Team Tracker</h2>
          <p className="text-muted">로그인하여 시작하세요</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              type="email"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              type="password"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger" style={{ fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm mr-2"></span>
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="text-muted">
            계정이 없으신가요?{' '}
            <Link to="/register" className="text-primary">
              회원가입
            </Link>
          </p>
        </div>

        {/* Demo accounts info */}
        <div className="mt-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '0.375rem' }}>
          <h6 className="mb-2 text-muted">데모 계정</h6>
          <div style={{ fontSize: '0.875rem' }}>
            <div className="mb-1">
              <strong>관리자:</strong> admin@test.com / password123
            </div>
            <div className="mb-1">
              <strong>임원:</strong> executive@test.com / password123
            </div>
            <div className="mb-1">
              <strong>리더:</strong> leader@test.com / password123
            </div>
            <div>
              <strong>멤버:</strong> member@test.com / password123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;