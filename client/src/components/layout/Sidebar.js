// client/src/components/layout/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const SidebarWrapper = styled.aside`
  width: 240px;
  background-color: ${props => props.theme.colors.white};
  height: calc(100vh - 56px);
  position: fixed;
  top: 56px;
  left: ${props => props.isOpen ? '0' : '-240px'};
  border-right: 1px solid ${props => props.theme.colors.border.default};
  transition: left ${props => props.theme.transitions.base};
  z-index: ${props => props.theme.zIndex.fixed};
  overflow-y: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    left: ${props => props.isMobileOpen ? '0' : '-240px'};
    box-shadow: ${props => props.isMobileOpen ? props.theme.shadows.xl : 'none'};
  }
`;

const Nav = styled.nav`
  padding: ${props => props.theme.spacing.md} 0;
`;

const NavSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const NavHeader = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${props => props.theme.colors.text.muted};
`;

const NavDivider = styled.hr`
  margin: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border: none;
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.primary};
  text-decoration: none;
  transition: all ${props => props.theme.transitions.fast};
  position: relative;
  
  &:hover {
    background-color: ${props => props.theme.colors.gray[50]};
    color: ${props => props.theme.colors.primary};
  }
  
  &.active {
    background-color: ${props => props.theme.colors.primary}10;
    color: ${props => props.theme.colors.primary};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: ${props => props.theme.colors.primary};
    }
  }
  
  i {
    width: 20px;
    margin-right: ${props => props.theme.spacing.sm};
    text-align: center;
  }
`;

function Sidebar({ isOpen, isMobileOpen, onClose }) {
  const { user } = useAuth();

  const menuItems = [
    {
      path: '/',
      icon: 'fas fa-tachometer-alt',
      label: '대시보드',
      roles: ['admin', 'executive', 'leader', 'member']
    },
    {
      path: '/teams',
      icon: 'fas fa-users',
      label: '팀 관리',
      roles: ['admin', 'executive', 'leader', 'member']
    },
    {
      path: '/reports',
      icon: 'fas fa-file-alt',
      label: '보고서',
      roles: ['admin', 'executive', 'leader', 'member']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'member')
  );

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <SidebarWrapper isOpen={isOpen} isMobileOpen={isMobileOpen}>
      <Nav>
        <NavSection>
          {filteredMenuItems.map((item) => (
            <StyledNavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
            >
              <i className={item.icon} />
              {item.label}
            </StyledNavLink>
          ))}
        </NavSection>

        {(user?.role === 'admin' || user?.role === 'executive') && (
          <>
            <NavDivider />
            <NavHeader>관리자 메뉴</NavHeader>
            <NavSection>
              {user?.role === 'admin' && (
                <StyledNavLink to="/admin/users" onClick={handleNavClick}>
                  <i className="fas fa-user-cog" />
                  사용자 관리
                </StyledNavLink>
              )}
              <StyledNavLink to="/admin/statistics" onClick={handleNavClick}>
                <i className="fas fa-chart-bar" />
                통계 관리
              </StyledNavLink>
            </NavSection>
          </>
        )}

        <NavDivider />
        <NavHeader>빠른 작업</NavHeader>
        <NavSection>
          {(user?.role === 'admin' || user?.role === 'executive' || user?.role === 'leader') && (
            <StyledNavLink to="/teams/create" onClick={handleNavClick}>
              <i className="fas fa-plus" />
              팀 생성
            </StyledNavLink>
          )}
          <StyledNavLink to="/reports/create" onClick={handleNavClick}>
            <i className="fas fa-edit" />
            보고서 작성
          </StyledNavLink>
        </NavSection>
      </Nav>
    </SidebarWrapper>
  );
}

export default Sidebar;