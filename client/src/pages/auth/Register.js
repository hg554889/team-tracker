// client/src/pages/auth/Register.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { name, username, email, password, password2 } = formData;
  const { register, isAuthenticated, error, clearErrors } = useAuth();
  const { setAlert } = useAlert();
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
    
    // Clear validation error for this field
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!name.trim()) {
      errors.name = '이름을 입력해주세요.';
    } else if (name.length < 2) {
      errors.name = '이름은 최소 2글자 이상이어야 합니다.';
    }

    // Username validation
    if (!username.trim()) {
      errors.username = '사용자명을 입력해주세요.';
    } else if (username.length < 3) {
      errors.username = '사용자명은 최소 3글자 이상이어야 합니다.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = '사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.';
    }

    // Email validation
    if (!email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    // Password validation
    if (!password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 6) {
      errors.password = '비밀번호는 최소 6글자 이상이어야 합니다.';
    }

    // Password confirmation validation
    if (!password2) {
      errors.password2 = '비밀번호 확인을 입력해주세요.';
    } else if (password !== password2) {
      errors.password2 = '비밀번호가 일치하지 않습니다.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert('입력 정보를 확인해주세요.', 'danger');
      return;
    }

    setLoading(true);
    
    try {
      await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password
      });
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>회원가입</h2>
          <p className="text-muted">새 계정을 만들어 시작하세요</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              이름 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${validationErrors.name || error ? 'is-invalid' : ''}`}
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="실제 이름을 입력하세요"
              required
            />
            {validationErrors.name && (
              <div className="invalid-feedback">{validationErrors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              사용자명 <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${validationErrors.username || error ? 'is-invalid' : ''}`}
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="영문, 숫자, 언더스코어만 사용"
              required
            />
            {validationErrors.username && (
              <div className="invalid-feedback">{validationErrors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일 <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className={`form-control ${validationErrors.email || error ? 'is-invalid' : ''}`}
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="이메일을 입력하세요"
              required
            />
            {validationErrors.email && (
              <div className="invalid-feedback">{validationErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호 <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className={`form-control ${validationErrors.password || error ? 'is-invalid' : ''}`}
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="최소 6글자 이상"
              required
            />
            {validationErrors.password && (
              <div className="invalid-feedback">{validationErrors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password2" className="form-label">
              비밀번호 확인 <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className={`form-control ${validationErrors.password2 || error ? 'is-invalid' : ''}`}
              id="password2"
              name="password2"
              value={password2}
              onChange={onChange}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
            {validationErrors.password2 && (
              <div className="invalid-feedback">{validationErrors.password2}</div>
            )}
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
                가입 중...
              </>
            ) : (
              '회원가입'
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="text-muted">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-primary">
              로그인
            </Link>
          </p>
        </div>

        <div className="mt-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
          <p className="text-muted mb-1">
            <strong>참고:</strong> 회원가입 후 관리자가 권한을 설정해드립니다.
          </p>
          <p className="text-muted mb-0">
            기본 권한은 '멤버'로 설정됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;