// client/src/components/layout/Header.js
import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common';

const HeaderWrapper = styled.header`
  height: 56px;
  background-color: ${props => props.theme.colors.dark};
  color: ${props => props.theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  z-index: ${props => props.theme.zIndex.sticky};
  position: sticky;
  top: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const Logo = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.white};
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.typography.fontSize.xl};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity ${props => props.theme.transitions.fast};
  
  &:hover {
    opacity: 0.8;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const UserInfo = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.gray[200]};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <HeaderWrapper>
      <HeaderLeft>
        <MenuButton onClick={toggleSidebar}>
          <i className="fas fa-bars" />
        </MenuButton>
        <Logo>Team Tracker</Logo>
      </HeaderLeft>
      <HeaderRight>
        {user && (
          <>
            <UserInfo>
              <i className="fas fa-user-circle" style={{ marginRight: '8px' }} />
              {user.name || '사용자'}
            </UserInfo>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              style={{ borderColor: 'white', color: 'white' }}
            >
              로그아웃
            </Button>
          </>
        )}
      </HeaderRight>
    </HeaderWrapper>
  );
}

export default Header;