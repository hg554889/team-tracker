// client/src/pages/auth/Login.js

import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 450px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const LoginTitle = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #0366d6;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1.2rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const FormInput = styled.input`
  display: block;
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus {
    border-color: #0366d6;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(3, 102, 214, 0.25);
  }
`;

const SubmitButton = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  background-color: #0366d6;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  
  &:hover {
    background-color: #0254ac;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { email, password } = formData;
  const { login, isAuthenticated } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  // 이미 로그인한 경우 대시보드로 리디렉션
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setAlert('모든 항목을 입력해주세요', 'danger');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setAlert(result.error, 'danger');
      } else {
        setAlert('로그인 성공!', 'success');
        navigate('/');
      }
    } catch (err) {
      setAlert('로그인 실패', 'danger');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <LoginContainer>
      <LoginCard>
        <LoginTitle>로그인</LoginTitle>
        <LoginForm onSubmit={onSubmit}>
          <FormGroup>
            <FormLabel htmlFor="email">이메일</FormLabel>
            <FormInput
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="이메일 주소를 입력하세요"
              required
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="password">비밀번호</FormLabel>
            <FormInput
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </FormGroup>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </SubmitButton>
        </LoginForm>
        <RegisterLink>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;