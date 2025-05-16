// client/src/pages/teams/CreateTeam.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import styled from 'styled-components';
import api from '../../services/api';

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

const CreateTeam = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'project',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { name, type, description } = formData;
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  // 폼 입력 변경 핸들러
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // 폼 제출 핸들러
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!name || !description) {
      setAlert('모든 필수 항목을 입력해주세요', 'danger');
      return;
    }
    
    // 관리자 또는 리더 권한 확인
    if (user.role !== 'admin' && user.role !== 'leader') {
      setAlert('팀 생성 권한이 없습니다', 'danger');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await api.post('/teams', formData);
      
      setAlert('팀이 성공적으로 생성되었습니다', 'success');
      navigate(`/teams/${res.data.data._id}`);
    } catch (err) {
      const errorMsg = err.message || '팀 생성에 실패했습니다';
      setAlert(errorMsg, 'danger');
      setLoading(false);
    }
  };
  
  // 취소 버튼 핸들러
  const onCancel = () => {
    navigate('/teams');
  };
  
  // 권한 확인
  if (user && user.role !== 'admin' && user.role !== 'leader') {
    return (
      <FormContainer>
        <FormHeader>
          <FormTitle>권한 없음</FormTitle>
          <FormSubtitle>팀을 생성할 권한이 없습니다. 관리자나 리더에게 문의하세요.</FormSubtitle>
        </FormHeader>
      </FormContainer>
    );
  }
  
  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>새 팀 만들기</FormTitle>
        <FormSubtitle>새로운 프로젝트 또는 스터디 팀을 생성합니다.</FormSubtitle>
      </FormHeader>
      
      <FormCard>
        <form onSubmit={onSubmit}>
          <FormGroup>
            <FormLabel htmlFor="name">팀 이름 *</FormLabel>
            <FormInput
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="팀 이름을 입력하세요"
              required
            />
            <HelpText>팀을 대표하는 간결한 이름을 입력하세요.</HelpText>
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="type">팀 유형 *</FormLabel>
            <FormSelect
              id="type"
              name="type"
              value={type}
              onChange={onChange}
              required
            >
              <option value="project">프로젝트</option>
              <option value="study">스터디</option>
            </FormSelect>
            <HelpText>팀의 성격에 맞는 유형을 선택하세요.</HelpText>
          </FormGroup>
          
          <FormGroup>
            <FormLabel htmlFor="description">팀 설명 *</FormLabel>
            <FormTextarea
              id="description"
              name="description"
              value={description}
              onChange={onChange}
              placeholder="팀에 대한 설명을 입력하세요"
              rows="5"
              required
            ></FormTextarea>
            <HelpText>팀의 목표, 활동 내용, 계획 등을 자세히 적어주세요.</HelpText>
          </FormGroup>
          
          <FormActions>
            <CancelButton type="button" onClick={onCancel}>
              취소
            </CancelButton>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? '생성 중...' : '팀 생성하기'}
            </SubmitButton>
          </FormActions>
        </form>
      </FormCard>
    </FormContainer>
  );
};

export default CreateTeam;