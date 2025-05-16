// client/src/pages/auth/Register.js

import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
`;

const RegisterCard = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const RegisterTitle = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #0366d6;
`;

const RegisterForm = styled.form`
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

const LoginLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
`;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { name, username, email, password, password2 } = formData;
  const { register, isAuthenticated } = useContext(AuthContext);
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
    
    // 유효성 검사
    if (!name || !username || !email || !password || !password2) {
      setAlert('모든 항목을 입력해주세요', 'danger');
      return;
    }
    
    if (password !== password2) {
      setAlert('비밀번호가 일치하지 않습니다', 'danger');
      return;
    }
    
    if (password.length < 6) {
      setAlert('비밀번호는 6자 이상이어야 합니다', 'danger');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register({
        name,
        username,
        email,
        password,
        role: 'member' // 기본 역할은 member
      });
      
      if (!result.success) {
        setAlert(result.error, 'danger');
      } else {
        setAlert('회원가입 성공!', 'success');
        navigate('/');
      }
    } catch (err) {
      setAlert('회원가입 실패', 'danger');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <RegisterContainer>
      <RegisterCard>
        <RegisterTitle>회원가입</RegisterTitle>
        <RegisterForm onSubmit={onSubmit}>
          <FormGroup>
            <FormLabel htmlFor="name">이름</FormLabel>
            <FormInput
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="이름을 입력하세요"
              required
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="username">사용자 이름</FormLabel>
            <FormInput
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="사용자 이름을 입력하세요"
              required
            />
          </FormGroup>
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
              placeholder="비밀번호를 입력하세요 (최소 6자)"
              required
            />
          </FormGroup>
          <FormGroup>
            <FormLabel htmlFor="password2">비밀번호 확인</FormLabel>
            <FormInput
              type="password"
              id="password2"
              name="password2"
              value={password2}
              onChange={onChange}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </FormGroup>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </SubmitButton>
        </RegisterForm>
        <LoginLink>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;