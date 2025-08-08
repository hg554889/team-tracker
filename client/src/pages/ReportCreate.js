// client/src/pages/ReportCreate.js
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
  FormError,
  Badge
} from '../components/common';
import Spinner from '../components/layout/Spinner';

const CreateWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg};
`;

const PageHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const PageTitle = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const TeamInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const MainForm = styled.div`
  /* 메인 폼 영역 */
`;

const Sidebar = styled.div`
  /* 사이드바 영역 */
`;

const FormActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

const ContributionSection = styled.div`
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.gray[50]};
`;

const ContributionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ContributionItem = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const RemoveButton = styled(Button)`
  padding: ${props => props.theme.spacing.xs};
  width: 32px;
  height: 32px;
`;

function ReportCreate() {
  const { id } = useParams(); // 팀 ID
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [team, setTeam] = useState(null);
  const [formData, setFormData] = useState({
    week: '',
    title: '',
    summary: '',
    achievements: '',
    challenges: '',
    nextWeekPlan: '',
    status: 'in_progress',
    completionRate: 0
  });
  const [contributions, setContributions] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchTeam();
    } else {
      // 팀 ID가 없으면 팀 선택 페이지로 이동하거나 에러 처리
      setAlert('팀을 선택해주세요.', 'warning');
      navigate('/teams');
    }
  }, [id]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teams/${id}`);
      const teamData = response.data;
      
      setTeam(teamData);
      
      // 현재 주차 자동 계산
      const currentWeek = getCurrentWeek();
      setFormData(prev => ({
        ...prev,
        week: currentWeek,
        title: `${teamData.name} ${currentWeek}주차 보고서`
      }));

    } catch (error) {
      console.error('Team fetch error:', error);
      setAlert('팀 정보를 불러오는데 실패했습니다.', 'danger');
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  };

  const canCreateReport = () => {
    if (!team || !user) return false;
    return team.leader?._id === user._id || 
           team.members?.some(member => member._id === user._id) ||
           user.role === 'admin' ||
           user.role === 'executive';
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
    
    // 해당 필드의 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addContribution = () => {
    setContributions(prev => [
      ...prev,
      {
        id: Date.now(),
        description: '',
        hours: 0,
        member: user._id
      }
    ]);
  };

  const removeContribution = (id) => {
    setContributions(prev => prev.filter(contrib => contrib.id !== id));
  };

  const updateContribution = (id, field, value) => {
    setContributions(prev => prev.map(contrib => 
      contrib.id === id ? { ...contrib, [field]: value } : contrib
    ));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.week) {
      newErrors.week = '주차를 입력해주세요.';
    }

    if (!formData.title.trim()) {
      newErrors.title = '보고서 제목을 입력해주세요.';
    }

    if (!formData.summary.trim()) {
      newErrors.summary = '이번 주 요약을 입력해주세요.';
    }

    if (formData.completionRate < 0 || formData.completionRate > 100) {
      newErrors.completionRate = '완료율은 0-100 사이의 값이어야 합니다.';
    }

    // 기여도 검증
    const invalidContributions = contributions.filter(contrib => 
      !contrib.description.trim() || contrib.hours <= 0
    );
    
    if (invalidContributions.length > 0) {
      newErrors.contributions = '모든 기여도 항목을 올바르게 작성해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 기존 client/src/pages/ReportCreate.js의 handleSubmit 함수만 수정

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!canCreateReport()) {
    setAlert('보고서를 작성할 권한이 없습니다.', 'warning');
    return;
  }

  if (!validateForm()) {
    setAlert('입력 정보를 확인해주세요.', 'warning');
    return;
  }

  setSubmitting(true);
  
  try {
    // ✅ 기존 formData를 서버가 원하는 형태로 변환
    const reportData = {
      goals: formData.summary || formData.title || '목표 미작성',     // 요약이나 제목을 목표로
      progress: formData.achievements || '진행사항 미작성',           // 성과를 진행사항으로
      challenges: formData.challenges || '',
      nextWeekPlan: formData.nextWeekPlan || '',
      completionRate: formData.completionRate || 0,
      status: formData.status || 'in_progress'
    };
    
    // 디버깅용 로그
    console.log('🔄 Original formData:', formData);
    console.log('📤 Converted reportData:', reportData);
    
    const reportResponse = await api.post(`/teams/${id}/reports`, reportData);
    console.log('📥 Server response:', reportResponse.data);
    
    // 응답에서 ID 추출 (서버 응답 구조에 따라)
    const reportId = reportResponse.data.data?._id || reportResponse.data._id;

    // 기여도 추가
    if (contributions.length > 0) {
      for (const contribution of contributions) {
        await api.post(`/reports/${reportId}/contributions`, {
          description: contribution.description,
          hours: contribution.hours,
          member: contribution.member
        });
      }
    }

    setAlert('보고서가 성공적으로 생성되었습니다!', 'success');
    navigate(`/reports/${reportId}`);
    
  } catch (error) {
    console.error('❌ Report create error:', error);
    
    // 상세 에러 정보 출력
    if (error.response) {
      console.error('❌ Error status:', error.response.status);
      console.error('❌ Error data:', error.response.data);
    }
    
    // 에러 메시지 처리
    let message = '보고서 생성에 실패했습니다.';
    
    if (error.response?.data?.errors) {
      // express-validator 에러들
      const errorMessages = error.response.data.errors.map(err => err.msg);
      message = `입력 오류: ${errorMessages.join(', ')}`;
    } else if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    
    setAlert(message, 'danger');
  } finally {
    setSubmitting(false);
  }
};

  const handleCancel = () => {
    const hasContent = Object.values(formData).some(value => 
      typeof value === 'string' ? value.trim() !== '' : value !== 0
    ) || contributions.length > 0;

    if (hasContent) {
      if (window.confirm('작성 중인 내용이 있습니다. 정말로 취소하시겠습니까?')) {
        navigate(`/teams/${id}`);
      }
    } else {
      navigate(`/teams/${id}`);
    }
  };

  if (loading) {
    return (
      <CreateWrapper>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <Spinner size="lg" text="팀 정보 로딩 중..." />
        </div>
      </CreateWrapper>
    );
  }

  if (!team) {
    return (
      <CreateWrapper>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '2rem' }}>
            <h3>팀을 찾을 수 없습니다.</h3>
            <Button as={Link} to="/teams" variant="primary">
              팀 목록으로 돌아가기
            </Button>
          </CardBody>
        </Card>
      </CreateWrapper>
    );
  }

  if (!canCreateReport()) {
    return (
      <CreateWrapper>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="fas fa-lock" style={{ 
              fontSize: '3rem', 
              color: '#6c757d', 
              marginBottom: '1rem' 
            }} />
            <h3>보고서 작성 권한이 없습니다</h3>
            <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
              이 팀의 보고서를 작성할 권한이 없습니다.
            </p>
            <Button as={Link} to={`/teams/${id}`} variant="primary">
              팀 상세보기로 돌아가기
            </Button>
          </CardBody>
        </Card>
      </CreateWrapper>
    );
  }

  return (
    <CreateWrapper>
      <PageHeader>
        <PageTitle>새 보고서 작성</PageTitle>
        <TeamInfo>
          <i className="fas fa-users" />
          <span>{team.name}</span>
          <Badge variant={team.type === 'study' ? 'info' : 'success'}>
            {team.type === 'study' ? '스터디' : '프로젝트'}
          </Badge>
        </TeamInfo>
      </PageHeader>

      <FormGrid>
        <MainForm>
          <Card>
            <CardHeader>
              <CardTitle>보고서 기본 정보</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 2fr', 
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <FormGroup>
                    <Label required>주차</Label>
                    <Input
                      type="number"
                      name="week"
                      value={formData.week}
                      onChange={handleChange}
                      min="1"
                      max="53"
                      isInvalid={!!errors.week}
                    />
                    {errors.week && <FormError>{errors.week}</FormError>}
                  </FormGroup>

                  <FormGroup>
                    <Label required>완료율 (%)</Label>
                    <Input
                      type="number"
                      name="completionRate"
                      value={formData.completionRate}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      isInvalid={!!errors.completionRate}
                    />
                    {errors.completionRate && <FormError>{errors.completionRate}</FormError>}
                  </FormGroup>
                </div>

                <FormGroup>
                  <Label required>보고서 제목</Label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="예: React 스터디팀 3주차 보고서"
                    isInvalid={!!errors.title}
                    maxLength={100}
                  />
                  {errors.title && <FormError>{errors.title}</FormError>}
                </FormGroup>

                <FormGroup>
                  <Label required>이번 주 요약</Label>
                  <Textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    placeholder="이번 주에 진행한 주요 활동을 간단히 요약해주세요."
                    rows={4}
                    isInvalid={!!errors.summary}
                    maxLength={500}
                  />
                  {errors.summary && <FormError>{errors.summary}</FormError>}
                </FormGroup>

                <FormGroup>
                  <Label>주요 성과</Label>
                  <Textarea
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleChange}
                    placeholder="이번 주에 달성한 주요 성과를 작성해주세요."
                    rows={4}
                    maxLength={500}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>어려웠던 점</Label>
                  <Textarea
                    name="challenges"
                    value={formData.challenges}
                    onChange={handleChange}
                    placeholder="이번 주에 겪은 어려움이나 해결해야 할 문제점을 작성해주세요."
                    rows={4}
                    maxLength={500}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>다음 주 계획</Label>
                  <Textarea
                    name="nextWeekPlan"
                    value={formData.nextWeekPlan}
                    onChange={handleChange}
                    placeholder="다음 주에 진행할 계획을 작성해주세요."
                    rows={4}
                    maxLength={500}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>진행 상태</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="not_started">시작 전</option>
                    <option value="in_progress">진행 중</option>
                    <option value="completed">완료</option>
                    <option value="on_hold">보류</option>
                  </Select>
                </FormGroup>
              </form>
            </CardBody>
          </Card>
        </MainForm>

        <Sidebar>
          <Card>
            <CardHeader>
              <CardTitle>개인별 기여도</CardTitle>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={addContribution}
                type="button"
              >
                <i className="fas fa-plus" />
              </Button>
            </CardHeader>
            <CardBody>
              {contributions.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#6c757d', 
                  padding: '2rem 1rem' 
                }}>
                  <i className="fas fa-plus-circle" style={{ 
                    fontSize: '2rem', 
                    marginBottom: '1rem',
                    opacity: 0.5
                  }} />
                  <p>기여도를 추가해보세요.</p>
                  <Button 
                    size="sm" 
                    variant="primary" 
                    onClick={addContribution}
                    type="button"
                  >
                    기여도 추가
                  </Button>
                </div>
              ) : (
                contributions.map((contribution) => (
                  <ContributionSection key={contribution.id}>
                    <ContributionHeader>
                      <strong>기여도 #{contributions.indexOf(contribution) + 1}</strong>
                      <RemoveButton 
                        variant="danger"
                        size="sm"
                        onClick={() => removeContribution(contribution.id)}
                        type="button"
                      >
                        <i className="fas fa-times" />
                      </RemoveButton>
                    </ContributionHeader>
                    
                    <FormGroup style={{ marginBottom: '8px' }}>
                      <Textarea
                        placeholder="수행한 작업 내용을 입력하세요."
                        value={contribution.description}
                        onChange={(e) => updateContribution(
                          contribution.id, 
                          'description', 
                          e.target.value
                        )}
                        rows={2}
                        maxLength={200}
                      />
                    </FormGroup>
                    
                    <FormGroup style={{ margin: 0 }}>
                      <Input
                        type="number"
                        placeholder="소요 시간 (시간)"
                        value={contribution.hours}
                        onChange={(e) => updateContribution(
                          contribution.id, 
                          'hours', 
                          Number(e.target.value)
                        )}
                        min="0.1"
                        step="0.1"
                      />
                    </FormGroup>
                  </ContributionSection>
                ))
              )}
              
              {errors.contributions && (
                <FormError style={{ marginTop: '8px' }}>
                  {errors.contributions}
                </FormError>
              )}
            </CardBody>
          </Card>

          <div style={{ 
            marginTop: '16px',
            padding: '16px', 
            backgroundColor: '#e7f3ff', 
            borderRadius: '8px',
            border: '1px solid #b8daff'
          }}>
            <h6 style={{ 
              margin: '0 0 8px 0',
              color: '#004085',
              fontSize: '14px',
              fontWeight: 600
            }}>
              <i className="fas fa-info-circle" style={{ marginRight: '8px' }} />
              작성 팁
            </h6>
            <ul style={{ 
              margin: 0,
              paddingLeft: '20px',
              fontSize: '13px',
              color: '#004085',
              lineHeight: 1.5
            }}>
              <li>구체적이고 명확하게 작성하세요.</li>
              <li>수치나 결과물이 있다면 포함하세요.</li>
              <li>다음 주 계획은 실현 가능하게 세우세요.</li>
            </ul>
          </div>
        </Sidebar>
      </FormGrid>

      <FormActions>
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={submitting}
        >
          취소
        </Button>

        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? <Spinner size="sm" /> : '보고서 생성'}
        </Button>
      </FormActions>
    </CreateWrapper>
  );
}

export default ReportCreate;