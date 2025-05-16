// client/src/pages/teams/MemberItem.js

import React, { useState } from 'react';
import styled from 'styled-components';

const MemberCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  align-items: center;
  position: relative;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const MemberAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.isLeader ? '#0366d610' : '#6c757d10'};
  color: ${props => props.isLeader ? '#0366d6' : '#6c757d'};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 0.75rem;
  font-size: 1.2rem;
  font-weight: 600;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.div`
  font-weight: 500;
  display: flex;
  align-items: center;
`;

const LeaderBadge = styled.span`
  display: inline-block;
  font-size: 0.675rem;
  background-color: #0366d610;
  color: #0366d6;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-weight: 600;
  margin-left: 0.5rem;
  text-transform: uppercase;
`;

const MemberUsername = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const ConfirmDialog = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  z-index: 10;
`;

const DialogMessage = styled.div`
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 0.75rem;
  font-weight: 500;
`;

const DialogActions = styled.div`
  display: flex;
`;

const CancelButton = styled.button`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-right: 0.5rem;
  cursor: pointer;
  
  &:hover {
    background-color: #e2e6ea;
  }
`;

const ConfirmButton = styled.button`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background-color: #dc3545;
  color: white;
  border: 1px solid #dc3545;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #c82333;
  }
`;

const MemberItem = ({ member, isLeader, canRemove, onRemove }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  // 멤버 제거 핸들러
  const handleRemove = () => {
    setShowConfirm(false);
    onRemove();
  };
  
  // 멤버 이니셜 생성
  const getInitials = (name) => {
    if (!name) return '?';
    
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <MemberCard>
      <MemberAvatar isLeader={isLeader}>
        {getInitials(member.name)}
      </MemberAvatar>
      <MemberInfo>
        <MemberName>
          {member.name}
          {isLeader && <LeaderBadge>리더</LeaderBadge>}
        </MemberName>
        <MemberUsername>@{member.username}</MemberUsername>
      </MemberInfo>
      
      {canRemove && (
        <RemoveButton onClick={() => setShowConfirm(true)}>
          <i className="fas fa-times"></i>
        </RemoveButton>
      )}
      
      {showConfirm && (
        <ConfirmDialog>
          <DialogMessage>
            정말로 {member.name}님을 팀에서 제거하시겠습니까?
          </DialogMessage>
          <DialogActions>
            <CancelButton onClick={() => setShowConfirm(false)}>
              취소
            </CancelButton>
            <ConfirmButton onClick={handleRemove}>
              제거
            </ConfirmButton>
          </DialogActions>
        </ConfirmDialog>
      )}
    </MemberCard>
  );
};

export default MemberItem;