// client/src/pages/teams/EditTeam.js

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import Spinner from '../../components/layout/Spinner';
import MemberItem from './MemberItem';
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
  margin-bottom: 2rem;
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

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const MemberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const AddMemberForm = styled.form`
  display: flex;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AddMemberInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-right: 0.5rem;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
`;

const AddMemberButton = styled.button`
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
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
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const EditTeam = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'project',
    description: ''
  });
  const [team, setTeam] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const { name, type, description } = formData;
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  // 팀 정보 로드
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get(`/teams/${id}`);
        const teamData = res.data.data;
        
        setTeam(teamData);
        setFormData({
          name: teamData.name,
          type: teamData.type,
          description: teamData.description
        });
        setLoading(false);
      } catch (err) {
        console.error('팀 정보 로드 오류:', err);
        setAlert('팀 정보를 불러오는데 실패했습니다', 'danger');
        navigate('/teams');
      }
    };
    
    fetchTeam();
  }, [id, setAlert, navigate]);
  
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
    
    setUpdating(true);
    
    try {
      const res = await api.put(`/teams/${id}`, formData);
      
      setTeam(res.data.data);
      setAlert('팀 정보가 성공적으로 업데이트되었습니다', 'success');
      setUpdating(false);
    } catch (err) {
      const errorMsg = err.message || '팀 정보 업데이트에 실패했습니다';
      setAlert(errorMsg, 'danger');
      setUpdating(false);
    }
  };
  
  // 취소 버튼 핸들러
  const onCancel = () => {
    navigate(`/teams/${id}`);
  };
  
  // 멤버 추가 핸들러
  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!newMemberEmail) {
      setAlert('이메일을 입력해주세요', 'danger');
      return;
    }
    
    setAddingMember(true);
    
    try {
      // 이메일로 사용자 검색
      const userRes = await api.get(`/users/email/${newMemberEmail}`);
      const userId = userRes.data.data._id;
      
      // 멤버 추가 API 호출
      await api.post(`/teams/${id}/members`, { userId });
      
      // 팀 정보 갱신
      const teamRes = await api.get(`/teams/${id}`);
      setTeam(teamRes.data.data);
      
      setAlert('멤버가 성공적으로 추가되었습니다', 'success');
      setNewMemberEmail('');
    } catch (err) {
      const errorMsg = err.message || '멤버 추가에 실패했습니다';
      setAlert(errorMsg, 'danger');
    } finally {
      setAddingMember(false);
    }
  };
  
  // 멤버 제거 핸들러
  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/teams/${id}/members/${memberId}`);
      
      // 팀 정보 갱신
      const teamRes = await api.get(`/teams/${id}`);
      setTeam(teamRes.data.data);
      
      setAlert('멤버가 성공적으로 제거되었습니다', 'success');
    } catch (err) {
      const errorMsg = err.message || '멤버 제거에 실패했습니다';
      setAlert(errorMsg, 'danger');
    }
  };
  
  // 권한 확인 (리더, 관리자)
  const isAuthorized = () => {
    if (!team || !user) return false;
    return user.role === 'admin' || team.leader._id === user._id;
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
          <FormSubtitle>이 팀을 수정할 권한이 없습니다. 팀 리더나 관리자에게 문의하세요.</FormSubtitle>
        </FormHeader>
      </FormContainer>
    );
  }
  
  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>팀 수정</FormTitle>
        <FormSubtitle>{team.name} 팀의 정보를 수정합니다.</FormSubtitle>
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
            <SubmitButton type="submit" disabled={updating}>
              {updating ? '업데이트 중...' : '팀 정보 저장하기'}
            </SubmitButton>
          </FormActions>
        </form>
      </FormCard>
      
      <FormCard id="members">
        <SectionTitle>팀원 관리</SectionTitle>
        
        <AddMemberForm onSubmit={handleAddMember}>
          <AddMemberInput
            type="email"
            placeholder="추가할 멤버의 이메일 입력"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
          />
          <AddMemberButton type="submit" disabled={addingMember}>
            {addingMember ? '추가 중...' : '멤버 추가'}
          </AddMemberButton>
        </AddMemberForm>
        
        <MemberGrid>
          {team.members.map(member => (
            <MemberItem 
              key={member._id}
              member={member}
              isLeader={team.leader._id === member._id}
              canRemove={team.leader._id !== member._id}
              onRemove={() => handleRemoveMember(member._id)}
            />
          ))}
        </MemberGrid>
      </FormCard>
    </FormContainer>
  );
};

export default EditTeam;