// client/src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  CardTitle,
  FormGroup, 
  Label, 
  Input, 
  Button,
  FormError 
} from '../components/common';
import Spinner from '../components/layout/Spinner';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary}10 0%, 
    ${props => props.theme.colors.success}10 100%);
  padding: ${props => props.theme.spacing.md};
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: ${props => props.theme.shadows.xl};
`;

const LoginHeader = styled(CardHeader)`
  text-align: center;
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary}, 
    ${props => props.theme.colors.primaryDark});
  color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md} 0 0;
`;

const LoginTitle = styled(CardTitle)`
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
`;

const LoginForm = styled.form`
  width: 100%;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing.lg};
`;

const RegisterLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  &:hover {
    color: ${props => props.theme.colors.primaryDark};
    text-decoration: underline;
  }
`;

const WelcomeText = styled.p`
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // 해당 필드의 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
    }

    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      // 에러는 AuthContext에서 처리됨
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <LoginTitle>
            <i className="fas fa-sign-in-alt" />
            로그인
          </LoginTitle>
        </LoginHeader>
        
        <CardBody>
          <WelcomeText>
            Team Tracker에 오신 것을 환영합니다!
          </WelcomeText>
          
          <LoginForm onSubmit={handleSubmit}>
            <FormGroup>
              <Label required>이메일</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="example@email.com"
                isInvalid={!!errors.email}
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
              {errors.email && <FormError>{errors.email}</FormError>}
            </FormGroup>

            <FormGroup>
              <Label required>비밀번호</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="비밀번호를 입력하세요"
                isInvalid={!!errors.password}
                disabled={loading}
                autoComplete="current-password"
              />
              {errors.password && <FormError>{errors.password}</FormError>}
            </FormGroup>

            <FormActions>
              <RegisterLink to="/register">
                회원가입하기
              </RegisterLink>
              
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading || !formData.email || !formData.password}
              >
                {loading ? <Spinner size="sm" /> : '로그인'}
              </Button>
            </FormActions>
          </LoginForm>
        </CardBody>
      </LoginCard>
      
      {/* 개발 환경에서만 보이는 테스트 계정 정보 */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          padding: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          borderRadius: '6px',
          fontSize: '12px',
          maxWidth: '250px'
        }}>
          <strong>개발 테스트 계정:</strong><br />
          이메일: admin@test.com<br />
          비밀번호: password123
        </div>
      )}
    </LoginContainer>
  );
}

export default Login;