    // client/src/pages/reports/ReportDetails.js

import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import Spinner from '../../components/layout/Spinner';
import styled from 'styled-components';
import api from '../../services/api';
import { format } from 'date-fns';

const ReportContainer = styled.div`
  padding: 1.5rem;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ReportInfo = styled.div`
  flex: 1;
`;

const ReportTitle = styled.h1`
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
  border-radius: 4px;
  margin-left: 1rem;
  
  background-color: ${props => {
    switch (props.status) {
      case 'completed': return '#28a74510';
      case 'in_progress': return '#fd7e1410';
      default: return '#6c757d10';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#28a745';
      case 'in_progress': return '#fd7e14';
      default: return '#6c757d';
    }
  }};
`;

const TeamLink = styled(Link)`
  color: #0366d6;
  font-size: 1.1rem;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ReportMeta = styled.div`
  display: flex;
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0.5rem 0;
  flex-wrap: wrap;
`;

const ReportMetaItem = styled.div`
  margin-right: 1.5rem;
  margin-bottom: 0.5rem;
  
  i {
    margin-right: 0.25rem;
  }
`;

const ReportActions = styled.div`
  display: flex;
  
  @media (max-width: 768px) {
    margin-top: 1rem;
    width: 100%;
  }
`;

const EditButton = styled(Link)`
  display: inline-block;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  background-color: #0366d6;
  color: white;
  border: none;
  text-decoration: none;
  margin-right: 0.5rem;
  
  &:hover {
    background-color: #0254ac;
    text-decoration: none;
    color: white;
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const DeleteButton = styled.button`
  display: inline-block;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  background-color: #dc3545;
  color: white;
  border: none;
  
  &:hover {
    background-color: #c82333;
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const ProgressSection = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ProgressTitle = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const ProgressValue = styled.div`
  font-size: 1.1rem;
  color: ${props => {
    if (props.value >= 75) return '#28a745';
    if (props.value >= 50) return '#17a2b8';
    if (props.value >= 25) return '#fd7e14';
    return '#dc3545';
  }};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 0.6rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: ${props => {
    if (props.value >= 75) return '#28a745';
    if (props.value >= 50) return '#17a2b8';
    if (props.value >= 25) return '#fd7e14';
    return '#dc3545';
  }};
  width: ${props => `${props.value}%`};
  transition: width 0.3s ease;
`;

const ContentSection = styled.div`
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  font-weight: 600;
`;

const SectionBody = styled.div`
  padding: 1.5rem;
`;

const MultilineText = styled.div`
  white-space: pre-line;
`;

const ContributionsSection = styled(ContentSection)``;

const ContributionsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const ContributionCard = styled.div`
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 1rem;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const ContributionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const ContributionAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #6c757d;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ContributionInfo = styled.div`
  flex: 1;
`;

const ContributionName = styled.div`
  font-weight: 500;
`;

const ContributionHours = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
`;

const ContributionDesc = styled.div`
  font-size: 0.9rem;
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
`;

const DialogTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
`;

const DialogMessage = styled.p`
  margin-bottom: 1.5rem;
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 400;
  color: #212529;
  background-color: #f8f9fa;
  border: 1px solid #f8f9fa;
  border-radius: 4px;
  margin-right: 0.5rem;
  cursor: pointer;
  
  &:hover {
    background-color: #e2e6ea;
    border-color: #dae0e5;
  }
`;

const ConfirmButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 400;
  color: #fff;
  background-color: #dc3545;
  border: 1px solid #dc3545;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #c82333;
    border-color: #bd2130;
  }
`;

const AddContributionSection = styled(ContentSection)`
  margin-top: 2rem;
`;

const AddContributionForm = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
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

const FormTextarea = styled.textarea`
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
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 400;
  color: #fff;
  background-color: #0366d6;
  border: 1px solid #0366d6;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #0254ac;
    border-color: #0254ac;
  }
  
  &:disabled {
    background-color: #6c757d;
    border-color: #6c757d;
    cursor: not-allowed;
  }
`;

const ReportDetails = () => {
  const [report, setReport] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contributionForm, setContributionForm] = useState({
    description: '',
    hours: ''
  });
  const [submittingContribution, setSubmittingContribution] = useState(false);
  
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  // 보고서 정보 로드
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const reportRes = await api.get(`/reports/${id}`);
        setReport(reportRes.data.data);
        
        const contributionsRes = await api.get(`/reports/${id}/contributions`);
        setContributions(contributionsRes.data.data);
        
        setLoading(false);
      } catch (err) {
        console.error('보고서 정보 로드 오류:', err);
        setAlert('보고서 정보를 불러오는데 실패했습니다', 'danger');
        navigate('/reports');
      }
    };
    
    fetchReportData();
  }, [id, setAlert, navigate]);
  
  // 기여도 폼 변경 핸들러
  const handleContributionChange = (e) => {
    setContributionForm({
      ...contributionForm,
      [e.target.name]: e.target.value
    });
  };
  
  // 기여도 추가 핸들러
  const handleAddContribution = async (e) => {
    e.preventDefault();
    
    const { description, hours } = contributionForm;
    
    if (!description || !hours) {
      setAlert('모든 필드를 입력해주세요', 'danger');
      return;
    }
    
    setSubmittingContribution(true);
    
    try {
      await api.post(`/reports/${id}/contributions`, {
        description,
        hours: parseFloat(hours)
      });
      
      const contributionsRes = await api.get(`/reports/${id}/contributions`);
      setContributions(contributionsRes.data.data);
      
      setContributionForm({ description: '', hours: '' });
      setAlert('기여도가 성공적으로 추가되었습니다', 'success');
    } catch (err) {
      const errorMsg = err.message || '기여도 추가에 실패했습니다';
      setAlert(errorMsg, 'danger');
    } finally {
      setSubmittingContribution(false);
    }
  };
  
  // 보고서 삭제 핸들러
  const handleDeleteReport = async () => {
    try {
      await api.delete(`/reports/${id}`);
      setAlert('보고서가 성공적으로 삭제되었습니다', 'success');
      navigate('/reports');
    } catch (err) {
      console.error('보고서 삭제 오류:', err);
      setAlert('보고서 삭제에 실패했습니다', 'danger');
      setShowDeleteDialog(false);
    }
  };
  
  // 상태에 따른 텍스트
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '완료됨';
      case 'in_progress': return '진행 중';
      case 'not_started': return '시작 전';
      default: return '알 수 없음';
    }
  };
  
  // 날짜 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd');
  };
  
  // 사용자 이니셜 생성
  const getUserInitials = (name) => {
    if (!name) return '?';
    
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  // 권한 확인 (보고서 작성자, 팀 리더, 관리자)
  const isAuthorized = () => {
    if (!report || !user) return false;
    
    const isSubmitter = report.submittedBy._id === user._id;
    const isTeamLeader = report.team.leader._id === user._id;
    const isAdmin = user.role === 'admin';
    
    return isSubmitter || isTeamLeader || isAdmin;
  };
  
  // 팀원 여부 확인
  const isTeamMember = () => {
    if (!report || !user) return false;
    return report.team.members.some(member => member._id === user._id);
  };
  
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <ReportContainer>
      <ReportHeader>
        <ReportInfo>
          <ReportTitle>
            {report.weekNumber}주차 보고서
            <StatusBadge status={report.status}>
              {getStatusText(report.status)}
            </StatusBadge>
          </ReportTitle>
          <TeamLink to={`/teams/${report.team._id}`}>
            {report.team.name} ({report.team.type === 'project' ? '프로젝트' : '스터디'})
          </TeamLink>
          <ReportMeta>
            <ReportMetaItem>
              <i className="fas fa-calendar"></i> {formatDate(report.startDate)} ~ {formatDate(report.endDate)}
            </ReportMetaItem>
            <ReportMetaItem>
              <i className="fas fa-user"></i> 작성자: {report.submittedBy.name}
            </ReportMetaItem>
            <ReportMetaItem>
              <i className="fas fa-clock"></i> 작성일: {formatDate(report.createdAt)}
            </ReportMetaItem>
          </ReportMeta>
        </ReportInfo>
        
        {isAuthorized() && (
          <ReportActions>
            <EditButton to={`/reports/${id}/edit`}>
              <i className="fas fa-edit"></i> 보고서 편집
            </EditButton>
            <DeleteButton onClick={() => setShowDeleteDialog(true)}>
              <i className="fas fa-trash-alt"></i> 보고서 삭제
            </DeleteButton>
          </ReportActions>
        )}
      </ReportHeader>
      
      <ProgressSection>
        <ProgressTitle>
          <span>완료율</span>
          <ProgressValue value={report.completionRate}>{report.completionRate}%</ProgressValue>
        </ProgressTitle>
        <ProgressBar>
          <ProgressFill value={report.completionRate} />
        </ProgressBar>
      </ProgressSection>
      
      <ContentSection>
        <SectionHeader>주간 목표</SectionHeader>
        <SectionBody>
          <MultilineText>{report.goals}</MultilineText>
        </SectionBody>
      </ContentSection>
      
      <ContentSection>
        <SectionHeader>진행 상황</SectionHeader>
        <SectionBody>
          <MultilineText>{report.progress}</MultilineText>
        </SectionBody>
      </ContentSection>
      
      {report.challenges && (
        <ContentSection>
          <SectionHeader>도전 과제</SectionHeader>
          <SectionBody>
            <MultilineText>{report.challenges}</MultilineText>
          </SectionBody>
        </ContentSection>
      )}
      
      {report.nextWeekPlan && (
        <ContentSection>
          <SectionHeader>다음 주 계획</SectionHeader>
          <SectionBody>
            <MultilineText>{report.nextWeekPlan}</MultilineText>
          </SectionBody>
        </ContentSection>
      )}
      
      <ContributionsSection>
        <SectionHeader>팀원 기여도</SectionHeader>
        <SectionBody>
          {contributions.length > 0 ? (
            <ContributionsList>
              {contributions.map(contribution => (
                <ContributionCard key={contribution._id}>
                  <ContributionHeader>
                    <ContributionAvatar>
                      {getUserInitials(contribution.user.name)}
                    </ContributionAvatar>
                    <ContributionInfo>
                      <ContributionName>{contribution.user.name}</ContributionName>
                      <ContributionHours>{contribution.hours}시간</ContributionHours>
                    </ContributionInfo>
                  </ContributionHeader>
                  <ContributionDesc>{contribution.description}</ContributionDesc>
                </ContributionCard>
              ))}
            </ContributionsList>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>
              아직 등록된 기여도가 없습니다.
            </div>
          )}
        </SectionBody>
      </ContributionsSection>
      
      {isTeamMember() && (
        <AddContributionSection>
          <SectionHeader>나의 기여도 추가</SectionHeader>
          <SectionBody>
            <AddContributionForm onSubmit={handleAddContribution}>
              <FormGroup>
                <FormLabel htmlFor="description">활동 내용 *</FormLabel>
                <FormTextarea
                  id="description"
                  name="description"
                  value={contributionForm.description}
                  onChange={handleContributionChange}
                  placeholder="이번 주에 수행한 활동을 자세히 설명해주세요"
                  rows="3"
                  required
                ></FormTextarea>
              </FormGroup>
              <FormGroup>
                <FormLabel htmlFor="hours">투입 시간 (시간) *</FormLabel>
                <FormInput
                  type="number"
                  id="hours"
                  name="hours"
                  value={contributionForm.hours}
                  onChange={handleContributionChange}
                  placeholder="이번 주에 투입한 시간을 입력하세요"
                  min="0.1"
                  step="0.1"
                  required
                />
              </FormGroup>
              <SubmitButton type="submit" disabled={submittingContribution}>
                {submittingContribution ? '추가 중...' : '기여도 추가하기'}
              </SubmitButton>
            </AddContributionForm>
          </SectionBody>
        </AddContributionSection>
      )}
      
      {/* 삭제 확인 다이얼로그 */}
      {showDeleteDialog && (
        <ConfirmDialog>
          <DialogContent>
            <DialogTitle>보고서 삭제 확인</DialogTitle>
            <DialogMessage>
              정말로 {report.weekNumber}주차 보고서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 기여도 데이터도 함께 삭제됩니다.
            </DialogMessage>
            <DialogActions>
              <CancelButton onClick={() => setShowDeleteDialog(false)}>
                취소
              </CancelButton>
              <ConfirmButton onClick={handleDeleteReport}>
                삭제
              </ConfirmButton>
            </DialogActions>
          </DialogContent>
        </ConfirmDialog>
      )}
    </ReportContainer>
  );
};

export default ReportDetails;