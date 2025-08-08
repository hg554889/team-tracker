// client/src/pages/Register.js
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
  Select,
  Button,
  FormError,
  FormText
} from '../components/common';
import Spinner from '../components/layout/Spinner';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.success}10 0%, 
    ${props => props.theme.colors.primary}10 100%);
  padding: ${props => props.theme.spacing.md};
`;

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  box-shadow: ${props => props.theme.shadows.xl};
`;

const RegisterHeader = styled(CardHeader)`
  text-align: center;
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.success}, 
    ${props => props.theme.colors.info});
  color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md} 0 0;
`;

const RegisterTitle = styled(CardTitle)`
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
`;

const RegisterForm = styled.form`
  width: 100%;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing.lg};
`;

const LoginLink = styled(Link)`
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

const PasswordStrength = styled.div`
  margin-top: ${props => props.theme.spacing.xs};
  display: flex;
  gap: 2px;
`;

const StrengthBar = styled.div`
  height: 4px;
  flex: 1;
  background-color: ${props => props.active 
    ? props.color || props.theme.colors.gray[300] 
    : props.theme.colors.gray[200]
  };
  border-radius: 2px;
  transition: background-color ${props => props.theme.transitions.fast};
`;

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    name: '',
    username: '',
    email: '', 
    password: '',
    confirmPassword: '',
    role: 'member'
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

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return Math.min(strength, 4);
  };

  const getStrengthColor = (level) => {
    switch (level) {
      case 1: return '#dc3545'; // 약함
      case 2: return '#ffc107'; // 보통
      case 3: return '#28a745'; // 강함
      case 4: return '#17a2b8'; // 매우 강함
      default: return '#e9ecef';
    }
  };

  const getStrengthText = (level) => {
    switch (level) {
      case 1: return '약함';
      case 2: return '보통';
      case 3: return '강함';
      case 4: return '매우 강함';
      default: return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.username.trim()) {
      newErrors.username = '사용자 이름을 입력해주세요.';
    } else if (formData.username.length < 3) {
      newErrors.username = '사용자 이름은 3자 이상이어야 합니다.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '사용자 이름은 영문, 숫자, 밑줄(_)만 사용 가능합니다.';
    }

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

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
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
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/');
    } catch (error) {
      // 에러는 AuthContext에서 처리됨
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColor = getStrengthColor(passwordStrength);
  const strengthText = getStrengthText(passwordStrength);

  return (
    <RegisterContainer>
      <RegisterCard>
        <RegisterHeader>
          <RegisterTitle>
            <i className="fas fa-user-plus" />
            회원가입
          </RegisterTitle>
        </RegisterHeader>
        
        <CardBody>
          <WelcomeText>
            Team Tracker와 함께 팀 활동을 관리해보세요!
          </WelcomeText>
          
          <RegisterForm onSubmit={handleSubmit}>
            <FormGroup>
              <Label required>이름</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="실명을 입력하세요"
                isInvalid={!!errors.name}
                disabled={loading}
                autoComplete="name"
                autoFocus
              />
              {errors.name && <FormError>{errors.name}</FormError>}
            </FormGroup>

            <FormGroup>
              <Label required>사용자 이름</Label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="영문, 숫자, 밑줄(_) 사용 가능"
                isInvalid={!!errors.username}
                disabled={loading}
                autoComplete="username"
              />
              {errors.username && <FormError>{errors.username}</FormError>}
              <FormText>로그인 시 이메일 대신 사용할 수 있습니다.</FormText>
            </FormGroup>

            <FormGroup>
              <Label required>이메일</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                isInvalid={!!errors.email}
                disabled={loading}
                autoComplete="email"
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
                placeholder="6자 이상 입력하세요"
                isInvalid={!!errors.password}
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.password && <FormError>{errors.password}</FormError>}
              
              {formData.password && (
                <>
                  <PasswordStrength>
                    {[1, 2, 3, 4].map(level => (
                      <StrengthBar
                        key={level}
                        active={level <= passwordStrength}
                        color={level <= passwordStrength ? strengthColor : undefined}
                      />
                    ))}
                  </PasswordStrength>
                  {strengthText && (
                    <FormText style={{ color: strengthColor, marginTop: '4px' }}>
                      비밀번호 강도: {strengthText}
                    </FormText>
                  )}
                </>
              )}
            </FormGroup>

            <FormGroup>
              <Label required>비밀번호 확인</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                isInvalid={!!errors.confirmPassword}
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <FormError>{errors.confirmPassword}</FormError>}
            </FormGroup>

            <FormGroup>
              <Label>역할</Label>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="member">멤버</option>
                <option value="leader">팀장</option>
              </Select>
              <FormText>
                관리자나 임원 권한은 가입 후 관리자가 변경할 수 있습니다.
              </FormText>
            </FormGroup>

            <FormActions>
              <LoginLink to="/login">
                이미 계정이 있나요? 로그인
              </LoginLink>
              
              <Button
                type="submit"
                variant="success"
                loading={loading}
                disabled={loading || !formData.name || !formData.username || 
                         !formData.email || !formData.password || !formData.confirmPassword}
              >
                {loading ? <Spinner size="sm" /> : '가입하기'}
              </Button>
            </FormActions>
          </RegisterForm>
        </CardBody>
      </RegisterCard>
      
      {/* 개발 환경에서만 보이는 안내 */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          borderRadius: '6px',
          fontSize: '12px',
          maxWidth: '250px'
        }}>
          <strong>개발 환경:</strong><br />
          테스트용 계정을 자유롭게 생성하세요.
        </div>
      )}
    </RegisterContainer>
  );
}

export default Register;