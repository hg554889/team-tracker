// client/src/pages/TeamEdit.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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

const EditWrapper = styled.div`
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
`;

function TeamEdit() {
  const { id } = useParams();
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [team, setTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'study',
    description: '',
    goal: '',
    startDate: '',
    endDate: ''
  });
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teams/${id}`);
      const teamData = response.data;
      
      setTeam(teamData);
      
      const formattedData = {
        name: teamData.name || '',
        type: teamData.type || 'study',
        description: teamData.description || '',
        goal: teamData.goal || '',
        startDate: teamData.startDate ? teamData.startDate.split('T')[0] : '',
        endDate: teamData.endDate ? teamData.endDate.split('T')[0] : ''
      };
      
      setFormData(formattedData);
      setOriginalData(formattedData);
    } catch (error) {
      console.error('Team fetch error:', error);
      setAlert('팀 정보를 불러오는데 실패했습니다.', 'danger');
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const canEditTeam = () => {
    if (!team || !user) return false;
    return user.role === 'admin' || 
           user.role === 'executive' || 
           team.leader?._id === user._id;
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return Object.keys(formData).some(key => 
      formData[key] !== originalData[key]
    );
  };

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
    
    if (!canEditTeam()) {
      setAlert('팀을 수정할 권한이 없습니다.', 'warning');
      return;
    }

    if (!hasChanges()) {
      setAlert('변경된 내용이 없습니다.', 'info');
      return;
    }

    if (!validateForm()) {
      setAlert('입력 정보를 확인해주세요.', 'warning');
      return;
    }

    setSubmitting(true);
    
    try {
      await api.put(`/teams/${id}`, formData);
      setAlert('팀 정보가 성공적으로 수정되었습니다!', 'success');
      navigate(`/teams/${id}`);
    } catch (error) {
      console.error('Team update error:', error);
      const message = error.response?.data?.message || '팀 정보 수정에 실패했습니다.';
      setAlert(message, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm('변경된 내용이 저장되지 않습니다. 정말로 취소하시겠습니까?')) {
        navigate(`/teams/${id}`);
      }
    } else {
      navigate(`/teams/${id}`);
    }
  };

  const handleReset = () => {
    if (hasChanges() && originalData) {
      if (window.confirm('변경된 내용을 모두 되돌리시겠습니까?')) {
        setFormData({ ...originalData });
        setErrors({});
      }
    }
  };

  if (loading) {
    return (
      <EditWrapper>
        <LoadingContainer>
          <Spinner size="lg" text="팀 정보 로딩 중..." />
        </LoadingContainer>
      </EditWrapper>
    );
  }

  if (!team) {
    return (
      <EditWrapper>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>팀을 찾을 수 없습니다.</h3>
          <Button as={Link} to="/teams" variant="primary">
            팀 목록으로 돌아가기
          </Button>
        </div>
      </EditWrapper>
    );
  }

  if (!canEditTeam()) {
    return (
      <EditWrapper>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="fas fa-lock" style={{ 
              fontSize: '3rem', 
              color: '#6c757d', 
              marginBottom: '1rem' 
            }} />
            <h3 style={{ marginBottom: '1rem' }}>접근 권한이 없습니다</h3>
            <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
              이 팀을 수정할 권한이 없습니다. 팀장이나 관리자만 팀 정보를 수정할 수 있습니다.
            </p>
            <Button as={Link} to={`/teams/${id}`} variant="primary">
              팀 상세보기로 돌아가기
            </Button>
          </CardBody>
        </Card>
      </EditWrapper>
    );
  }

  return (
    <EditWrapper>
      <PageHeader>
        <PageTitle>{team.name} 수정</PageTitle>
        <BackButton 
          variant="ghost" 
          as={Link} 
          to={`/teams/${id}`}
        >
          <i className="fas fa-arrow-left" />
          팀 상세보기로
        </BackButton>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>팀 정보 수정</CardTitle>
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
              gap: '16px'
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
                disabled={submitting}
              >
                취소
              </Button>
              
              {hasChanges() && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={submitting}
                >
                  되돌리기
                </Button>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                disabled={submitting || !hasChanges()}
              >
                {submitting ? <Spinner size="sm" /> : '수정 완료'}
              </Button>
            </FormActions>
          </form>
        </CardBody>
      </Card>

      {hasChanges() && (
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px',
          border: '1px solid #ffeaa7',
          color: '#856404'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }} />
            <strong>변경사항이 있습니다!</strong>
          </div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            저장하지 않고 페이지를 벗어나면 변경사항이 손실됩니다.
          </div>
        </div>
      )}
    </EditWrapper>
  );
}

export default TeamEdit;