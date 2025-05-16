// client/src/components/layout/Sidebar.js

import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  width: 240px;
  background-color: #2f3136;
  color: #fff;
  overflow-y: auto;
  transition: all 0.3s;
  z-index: 990;
  
  @media (max-width: 768px) {
    transform: ${(props) => (props.isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  background-color: #222529;
`;

const SidebarTitle = styled.h3`
  color: #fff;
  margin: 0;
  font-size: 1.2rem;
`;

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SidebarMenuItem = styled.li`
  padding: 0;
`;

const SidebarLink = styled(NavLink)`
  display: block;
  padding: 15px 20px;
  color: #b9bbbe;
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  
  &:hover, &.active {
    background-color: #36393f;
    color: #fff;
    border-left-color: #0366d6;
  }
  
  i {
    margin-right: 10px;
    width: 20px;  /* 아이콘 너비 고정 */
    text-align: center;  /* 아이콘 중앙 정렬 */
  }
`;

const SidebarSection = styled.div`
  margin-top: 20px;
`;

const SidebarSubtitle = styled.h4`
  color: #b9bbbe;
  font-size: 0.9rem;
  text-transform: uppercase;
  padding: 10px 20px;
  margin: 0;
`;

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <SidebarTitle>메뉴</SidebarTitle>
      </SidebarHeader>
      
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarLink to="/">
            <i className="fas fa-tachometer-alt"></i> 대시보드
          </SidebarLink>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarLink to="/teams">
            <i className="fas fa-users"></i> 팀 관리
          </SidebarLink>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarLink to="/reports">
            <i className="fas fa-file-alt"></i> 주간 보고서
          </SidebarLink>
        </SidebarMenuItem>
        
        {/* 팀 생성 링크 - admin과 leader만 표시 */}
        {user && (user.role === 'admin' || user.role === 'leader') && (
          <SidebarMenuItem>
            <SidebarLink to="/teams/create">
              <i className="fas fa-plus"></i> 새 팀 만들기
            </SidebarLink>
          </SidebarMenuItem>
        )}
      </SidebarMenu>  
      
      {/* 관리자인 경우에만 표시 */}
      {user && user.role === 'admin' && (
        <SidebarSection>
          <SidebarSubtitle>관리자</SidebarSubtitle>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarLink to="/admin/users">
                <i className="fas fa-user-cog"></i> 사용자 관리
              </SidebarLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarLink to="/admin/stats">
                <i className="fas fa-chart-bar"></i> 통계
              </SidebarLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarSection>
      )}
      
      {/* 모바일에서 메뉴 토글 버튼 */}
      <div className="d-block d-md-none">
        <button 
          className="btn btn-primary btn-sm"
          style={{ position: 'fixed', left: '10px', bottom: '10px', zIndex: 1000 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className={`fas fa-${isOpen ? 'times' : 'bars'}`}></i>
        </button>
      </div>
    </SidebarContainer>
  );
};

export default Sidebar;