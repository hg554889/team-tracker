// client/src/pages/reports/EditReport.js

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import Spinner from '../../components/layout/Spinner';
import styled from 'styled-components';
import api from '../../services/api';
import { format } from 'date-fns';

const FormContainer = styled.div`
  padding: 1.5rem;
`;

const FormHeader = styled.div`
  margin-bottom: 2rem;
`;

const FormTitle = styled.h1`
  margin: 0;
  margin-bottom: 0.5rem;
`;

const FormSubtitle = styled.p`
  color: #6c757d;
  margin: 0;
`;

const FormCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  max-width: 800px;
`;

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

const FormSelect = styled.select`
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

const FormRange = styled.input`
  width: 100%;
  height: 1.5rem;
`;

const RangeValue = styled.div`
  text-align: right;
  font-weight: 500;
  color: ${props => {
    if (props.value >= 75) return '#28a745';
    if (props.value >= 50) return '#17a2b8';
    if (props.value >= 25) return '#fd7e14';
    return '#dc3545';
  }};
`;

const HelpText = styled.small`
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6c757d;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
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

const DateRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const DateGroup = styled.div`
  flex: 1;
`;

const EditReport = () => {
  const [report, setReport] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    weekNumber: 1,
    startDate: '',
    endDate: '',
    status: 'in_progress',
    goals: '',
    progress: '',
    challenges: '',
    nextWeekPlan: '',
    completionRate: 0
  });
  
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  const { 
    weekNumber, 
    startDate, 
    endDate, 
    status, 
    goals, 
    progress, 
    challenges, 
    nextWeekPlan, 
    completionRate 
  } = formData;
  
  // 보고서 정보 로드
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const reportRes = await api.get(`/reports/${id}`);
        const reportData = reportRes.data.data;
        
        setReport(reportData);
        setTeam(reportData.team);
        
        // 날짜 포맷 변환
        const formattedStartDate = format(new Date(reportData.startDate), 'yyyy-MM-dd');
        const formattedEndDate = format(new Date(reportData.endDate), 'yyyy-MM-dd');
        
        setFormData({
          weekNumber: reportData.weekNumber,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          status: reportData.status,
          goals: reportData.goals,
          progress: reportData.progress,
          challenges: reportData.challenges || '',
          nextWeekPlan: reportData.nextWeekPlan || '',
          completionRate: reportData.completionRate
        });
        
        setLoading(false);
      } catch (err) {
        console.error('보고서 정보 로드 오류:', err);
        setAlert('보고서 정보를 불러오는데 실패했습니다', 'danger');
        navigate('/reports');
      }
    };
    
    fetchReportData();
  }, [id, setAlert, navigate]);
  
  // 폼 입력 변경 핸들러
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // 폼 제출 핸들러
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!goals || !progress) {
      setAlert('목표와 진행 상황은 필수 입력 항목입니다', 'danger');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await api.put(`/reports/${id}`, formData);
      
      setAlert('보고서가 성공적으로 수정되었습니다', 'success');
      navigate(`/reports/${id}`);
    } catch (err) {
      const errorMsg = err.message || '보고서 수정에 실패했습니다';
      setAlert(errorMsg, 'danger');
      setSubmitting(false);
    }
  };
  
  // 취소 버튼 핸들러
  const onCancel = () => {
    navigate(`/reports/${id}`);
  };
  
  // 권한 확인 (보고서 작성자, 팀 리더, 관리자)
  const isAuthorized = () => {
    if (!report || !user) return false;
    
    const isSubmitter = report.submittedBy._id === user._id;
    const isTeamLeader = team && team.leader === user._id;
    const isAdmin = user.role === 'admin';
    
    return isSubmitter || isTeamLeader || isAdmin;
  };
  
  if (loading) {
    return <Spinner />;
  }
  
  // 권한 확인
  if (!isAuthorized()) {
    return (
      <FormContainer>
        <FormHeader>
          <FormTitle>권한 없음</FormTitle>
          <FormSubtitle>이 보고서를 수정할 권한이 없습니다. 보고서 작성자나 팀 리더에게 문의하세요.</FormSubtitle>
        </FormHeader>
      </FormContainer>
    );
  }
  
  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>주간 보고서 수정</FormTitle>
        <FormSubtitle>{team.name} 팀의 {weekNumber}주차 보고서를 수정합니다.</FormSubtitle>
      </FormHeader>
      
      <FormCard>
        <form onSubmit={onSubmit}>
          <DateRow>
            <DateGroup>
              <FormGroup>
                <FormLabel htmlFor="startDate">시작일 *</FormLabel>
                <FormInput
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={startDate}
                  onChange={onChange}
                  required
                />
              </FormGroup>
            </DateGroup>
            
            <DateGroup>
              <FormGroup>
                <FormLabel htmlFor="endDate">종료일 *</FormLabel>
                <FormInput
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={endDate}
                  onChange={onChange}
                  required
                />
              </FormGroup>
            </DateGroup>
          </DateRow>
          
          <FormGroup>
            <FormLabel htmlFor="status">진행 상태 *</FormLabel>
            <FormSelect
              id="status"
              name="status"
              value={status}
              onChange={onChange}
              required
            >
              <option value="not_started">시작 전</option>
              <option value="in_progress">진행 중</option>
              <option value="completed">완료됨</option>
            </FormSelect>
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="goals">주간 목표 *</FormLabel>
            <FormTextarea
              id="goals"
              name="goals"
              value={goals}
              onChange={onChange}
              placeholder="이번 주 달성하고자 하는 목표를 작성하세요"
              rows="4"
              required
            ></FormTextarea>
            <HelpText>구체적이고 측정 가능한 목표를 설정하세요.</HelpText>
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="progress">진행 상황 *</FormLabel>
            <FormTextarea
              id="progress"
              name="progress"
              value={progress}
              onChange={onChange}
              placeholder="이번 주 진행된 작업 내용을 상세히 작성하세요"
              rows="6"
              required
            ></FormTextarea>
            <HelpText>진행된 작업, 미팅, 결정 사항 등을 모두 포함하세요.</HelpText>
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="challenges">도전 과제</FormLabel>
            <FormTextarea
              id="challenges"
              name="challenges"
              value={challenges}
              onChange={onChange}
              placeholder="이번 주 겪은 어려움이나 해결이 필요한 문제를 작성하세요"
              rows="3"
            ></FormTextarea>
            <HelpText>현재 직면한 어려움과 해결 방안을 설명하세요.</HelpText>
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="nextWeekPlan">다음 주 계획</FormLabel>
            <FormTextarea
              id="nextWeekPlan"
              name="nextWeekPlan"
              value={nextWeekPlan}
              onChange={onChange}
              placeholder="다음 주에 진행할 계획을 작성하세요"
              rows="3"
            ></FormTextarea>
            <HelpText>다음 주 우선 순위 작업과 목표를 설명하세요.</HelpText>
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="completionRate">
              완료율: <RangeValue value={completionRate}>{completionRate}%</RangeValue>
            </FormLabel>
            <FormRange
              type="range"
              id="completionRate"
              name="completionRate"
              value={completionRate}
              onChange={onChange}
              min="0"
              max="100"
              step="5"
            />
            <HelpText>이번 주 목표 대비 진행률을 설정하세요.</HelpText>
          </FormGroup>
          
          <FormActions>
            <CancelButton type="button" onClick={onCancel}>
              취소
            </CancelButton>
            <SubmitButton type="submit" disabled={submitting}>
              {submitting ? '저장 중...' : '보고서 저장하기'}
            </SubmitButton>
          </FormActions>
        </form>
      </FormCard>
    </FormContainer>
  );
};

export default EditReport;