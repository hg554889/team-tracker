// client/src/pages/TeamCreate.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import api from '../services/api';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  CardTitle,
  FormGroup, 
  Label, 
  Input, 
  Textarea, 
  Select, 
  Button,
  FormError 
} from '../components/common';
import Spinner from '../components/layout/Spinner';

const CreateWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg};
`;

const PageHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PageTitle = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const BackButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

function TeamCreate() {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'study',
    description: '',
    goal: '',
    startDate: '',
    endDate: ''
  });
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

    if (!formData.name.trim()) {
      newErrors.name = '팀 이름을 입력해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '팀 설명을 입력해주세요.';
    }

    if (!formData.goal.trim()) {
      newErrors.goal = '팀 목표를 입력해주세요.';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start >= end) {
        newErrors.endDate = '종료일은 시작일보다 늦어야 합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert('입력 정보를 확인해주세요.', 'warning');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/teams', {
        ...formData,
        leader: user._id
      });

      setAlert('팀이 성공적으로 생성되었습니다!', 'success');
      navigate(`/teams/${response.data._id}`);
    } catch (error) {
      console.error('Team create error:', error);
      const message = error.response?.data?.message || '팀 생성에 실패했습니다.';
      setAlert(message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      Object.values(formData).some(value => value.trim() !== '') &&
      window.confirm('작성 중인 내용이 있습니다. 정말로 취소하시겠습니까?')
    ) {
      navigate('/teams');
    } else if (!Object.values(formData).some(value => value.trim() !== '')) {
      navigate('/teams');
    }
  };

  return (
    <CreateWrapper>
      <PageHeader>
        <PageTitle>새 팀 만들기</PageTitle>
        <BackButton 
          variant="ghost" 
          as={Link} 
          to="/teams"
        >
          <i className="fas fa-arrow-left" />
          팀 목록으로
        </BackButton>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>팀 정보 입력</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label required>팀 이름</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="예: React 스터디팀"
                isInvalid={!!errors.name}
                maxLength={50}
              />
              {errors.name && <FormError>{errors.name}</FormError>}
            </FormGroup>

            <FormGroup>
              <Label required>팀 유형</Label>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                isInvalid={!!errors.type}
              >
                <option value="study">스터디</option>
                <option value="project">프로젝트</option>
              </Select>
              {errors.type && <FormError>{errors.type}</FormError>}
            </FormGroup>

            <FormGroup>
              <Label required>팀 설명</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="팀의 주요 활동과 목적을 간단히 설명해주세요."
                rows={4}
                isInvalid={!!errors.description}
                maxLength={500}
              />
              {errors.description && <FormError>{errors.description}</FormError>}
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d', 
                textAlign: 'right',
                marginTop: '4px'
              }}>
                {formData.description.length}/500
              </div>
            </FormGroup>

            <FormGroup>
              <Label required>팀 목표</Label>
              <Textarea
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                placeholder="이 팀을 통해 달성하고자 하는 구체적인 목표를 작성해주세요."
                rows={3}
                isInvalid={!!errors.goal}
                maxLength={300}
              />
              {errors.goal && <FormError>{errors.goal}</FormError>}
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d', 
                textAlign: 'right',
                marginTop: '4px'
              }}>
                {formData.goal.length}/300
              </div>
            </FormGroup>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '16px',
              '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr'
              }
            }}>
              <FormGroup>
                <Label>시작일</Label>
                <Input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  isInvalid={!!errors.startDate}
                />
                {errors.startDate && <FormError>{errors.startDate}</FormError>}
              </FormGroup>

              <FormGroup>
                <Label>종료일 (예정)</Label>
                <Input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || undefined}
                  isInvalid={!!errors.endDate}
                />
                {errors.endDate && <FormError>{errors.endDate}</FormError>}
              </FormGroup>
            </div>

            <FormActions>
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={loading}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : '팀 생성하기'}
              </Button>
            </FormActions>
          </form>
        </CardBody>
      </Card>

      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h6 style={{ 
          margin: '0 0 8px 0',
          color: '#495057',
          fontSize: '14px',
          fontWeight: 600
        }}>
          <i className="fas fa-info-circle" style={{ marginRight: '8px', color: '#17a2b8' }} />
          팀 생성 안내
        </h6>
        <ul style={{ 
          margin: 0,
          paddingLeft: '20px',
          fontSize: '13px',
          color: '#6c757d',
          lineHeight: 1.5
        }}>
          <li>팀을 생성하시면 자동으로 팀장 권한을 갖게 됩니다.</li>
          <li>팀장은 팀원 추가/제거, 팀 정보 수정 권한을 갖습니다.</li>
          <li>생성 후 팀 설정에서 언제든지 정보를 수정할 수 있습니다.</li>
        </ul>
      </div>
    </CreateWrapper>
  );
}

export default TeamCreate;