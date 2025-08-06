import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';
import Alert from './Alert';

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainWrapper = styled.div`
  display: flex;
  flex: 1;
  position: relative;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.sidebarOpen ? '240px' : '0'};
  padding: ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.background.default};
  min-height: calc(100vh - 56px);
  transition: margin-left ${props => props.theme.transitions.base};
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    margin-left: 0;
    padding: ${props => props.theme.spacing.md};
  }
`;

const Overlay = styled.div`
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: ${props => props.show ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.theme.colors.background.overlay};
    z-index: ${props => props.theme.zIndex.modalBackdrop};
  }
`;

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <LayoutWrapper>
      <Header toggleSidebar={toggleSidebar} />
      <MainWrapper>
        <Sidebar 
          isOpen={sidebarOpen} 
          isMobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <MainContent sidebarOpen={sidebarOpen}>
          <Alert />
          <Outlet />
        </MainContent>
        <Overlay 
          show={mobileSidebarOpen} 
          onClick={() => setMobileSidebarOpen(false)}
        />
      </MainWrapper>
    </LayoutWrapper>
  );
}

export default Layout;