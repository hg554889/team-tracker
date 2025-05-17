// client/src/pages/teams/TeamDetails.js

import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AlertContext from '../../context/AlertContext';
import Spinner from '../../components/layout/Spinner';
import ReportItem from '../reports/ReportItem';
import MemberItem from './MemberItem';
import styled from 'styled-components';
import api from '../../services/api';

const TeamDetailsContainer = styled.div`
  padding: 1.5rem;
`;

const TeamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TeamInfo = styled.div`
  flex: 1;
`;

const TeamName = styled.h1`
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
`;

const TeamType = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  text-transform: uppercase;
  border-radius: 4px;
  background-color: ${props => props.type === 'project' ? '#0366d610' : '#28a74510'};
  color: ${props => props.type === 'project' ? '#0366d6' : '#28a745'};
  margin-left: 1rem;
`;

const TeamDescription = styled.p`
  color: #6c757d;
  margin-bottom: 1rem;
`;

const TeamMeta = styled.div`
  display: flex;
  color: #6c757d;
  font-size: 0.875rem;
`;

const TeamMetaItem = styled.div`
  margin-right: 1.5rem;
  
  i {
    margin-right: 0.25rem;
  }
`;

const TeamActions = styled.div`
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

const ContentSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AddButton = styled(Link)`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  background-color: #0366d6;
  color: white;
  border: none;
  text-decoration: none;
  
  &:hover {
    background-color: #0254ac;
    text-decoration: none;
    color: white;
  }
`;

const ContentCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const CardHeader = styled.div`
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  font-weight: 600;
`;

const CardBody = styled.div`
  padding: 1rem 1.5rem;
`;

const NoDataMessage = styled.p`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
`;

const MemberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
`;

const ReportList = styled.div`
  
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

const TeamDetails = () => {
  const [team, setTeam] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  
  // 팀 정보 로드
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const teamRes = await api.get(`/teams/${id}`);
        setTeam(teamRes.data.data);
        
        const reportsRes = await api.get(`/teams/${id}/reports`);
        setReports(reportsRes.data.data);
        
        setLoading(false);
      } catch (err) {
        console.error('팀 정보 로드 오류:', err);
        setAlert('팀 정보를 불러오는데 실패했습니다', 'danger');
        navigate('/teams');
      }
    };
    
    fetchTeamData();
  }, [id, setAlert, navigate]);
  
  // 팀 삭제 핸들러
  const handleDeleteTeam = async () => {
    try {
      await api.delete(`/teams/${id}`);
      setAlert('팀이 성공적으로 삭제되었습니다', 'success');
      navigate('/teams');
    } catch (err) {
      console.error('팀 삭제 오류:', err);
      setAlert('팀 삭제에 실패했습니다', 'danger');
      setShowDeleteDialog(false);
    }
  };
  
  // 팀원 제거 핸들러
  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/teams/${id}/members/${memberId}`);
      
      // 팀 정보 갱신
      const teamRes = await api.get(`/teams/${id}`);
      setTeam(teamRes.data.data);
      
      setAlert('팀원이 성공적으로 제거되었습니다', 'success');
    } catch (err) {
      console.error('팀원 제거 오류:', err);
      setAlert('팀원 제거에 실패했습니다', 'danger');
    }
  };
  
  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // 팀 유형 표시
  const getTeamTypeText = (type) => {
    return type === 'project' ? '프로젝트' : '스터디';
  };
  
  // 권한 확인 (팀 리더, 관리자)
  const isAuthorized = () => {
    if (!team || !user) return false;
    return team.leader._id === user._id || user.role === 'admin';
  };
  
  // 팀원 여부 확인
  const isTeamMember = () => {
    if (!team || !user) return false;
    return team.members.some(member => member._id === user._id);
  };
  
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <TeamDetailsContainer>
      <TeamHeader>
        <TeamInfo>
          <TeamName>
            {team.name}
            <TeamType type={team.type}>{getTeamTypeText(team.type)}</TeamType>
          </TeamName>
          <TeamDescription>{team.description}</TeamDescription>
          <TeamMeta>
            <TeamMetaItem>
              <i className="fas fa-user"></i> 리더: {team.leader.name}
            </TeamMetaItem>
            <TeamMetaItem>
              <i className="fas fa-users"></i> 멤버: {team.members.length}명
            </TeamMetaItem>
            <TeamMetaItem>
              <i className="fas fa-calendar-alt"></i> 생성일: {formatDate(team.createdAt)}
            </TeamMetaItem>
          </TeamMeta>
        </TeamInfo>
        
        {isAuthorized() && (
          <TeamActions>
            <EditButton to={`/teams/${id}/edit`}>
              <i className="fas fa-edit"></i> 팀 편집
            </EditButton>
            <DeleteButton onClick={() => setShowDeleteDialog(true)}>
              <i className="fas fa-trash-alt"></i> 팀 삭제
            </DeleteButton>
          </TeamActions>
        )}
      </TeamHeader>
      
      <ContentSection>
        <SectionTitle>
          팀원 목록
          {isAuthorized() && (
            <AddButton to={`/teams/${id}/edit#members`}>
              <i className="fas fa-user-plus"></i> 팀원 추가
            </AddButton>
          )}
        </SectionTitle>
        
        <ContentCard>
          <CardHeader>
            총 {team.members.length}명의 팀원
          </CardHeader>
          <CardBody>
            {team.members.length > 0 ? (
              <MemberGrid>
                {team.members.map(member => (
                  <MemberItem 
                    key={member._id}
                    member={member}
                    isLeader={team.leader._id === member._id}
                    canRemove={isAuthorized() && team.leader._id !== member._id}
                    onRemove={() => handleRemoveMember(member._id)}
                  />
                ))}
              </MemberGrid>
            ) : (
              <NoDataMessage>아직 팀원이 없습니다.</NoDataMessage>
            )}
          </CardBody>
        </ContentCard>
      </ContentSection>
      
      <ContentSection>
        <SectionTitle>
          주간 보고서
          {isAuthorized() && (
            <AddButton to={`/teams/${id}/reports/create`}>
              <i className="fas fa-plus"></i> 보고서 작성
            </AddButton>
          )}
        </SectionTitle>
        
        <ContentCard>
          <CardHeader>
            총 {reports.length}개의 보고서
          </CardHeader>
          <CardBody>
            {reports.length > 0 ? (
              <ReportList>
                {reports.map(report => (
                  <ReportItem key={report._id} report={report} />
                ))}
              </ReportList>
            ) : (
              <NoDataMessage>아직 작성된 보고서가 없습니다.</NoDataMessage>
            )}
          </CardBody>
        </ContentCard>
      </ContentSection>
      
      {/* 삭제 확인 다이얼로그 */}
      {showDeleteDialog && (
        <ConfirmDialog>
          <DialogContent>
            <DialogTitle>팀 삭제 확인</DialogTitle>
            <DialogMessage>
              정말로 '{team.name}' 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 보고서 데이터도 함께 삭제됩니다.
            </DialogMessage>
            <DialogActions>
              <CancelButton onClick={() => setShowDeleteDialog(false)}>
                취소
              </CancelButton>
              <ConfirmButton onClick={handleDeleteTeam}>
                삭제
              </ConfirmButton>
            </DialogActions>
          </DialogContent>
        </ConfirmDialog>
      )}
    </TeamDetailsContainer>
  );
};

export default TeamDetails;