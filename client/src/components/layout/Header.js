// client/src/components/layout/Header.js

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #0366d6;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const Logo = styled(Link)`
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  
  &:hover {
    text-decoration: none;
    color: #f0f0f0;
  }
`;

const NavContainer = styled.nav`
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  margin-left: 15px;
  font-size: 0.9rem;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
    color: #f0f0f0;
  }
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 15px;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
    color: #f0f0f0;
  }
`;

const UserInfo = styled.span`
  margin-right: 15px;
  font-size: 0.9rem;
`;

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  // 인증된 사용자 메뉴
  const authLinks = (
    <NavContainer>
      {user && (
        <UserInfo>
          <i className="fas fa-user"></i> {user.name}
        </UserInfo>
      )}
      <NavButton onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i> 로그아웃
      </NavButton>
    </NavContainer>
  );

  // 인증되지 않은 사용자 메뉴
  const guestLinks = (
    <NavContainer>
      <NavLink to="/register">회원가입</NavLink>
      <NavLink to="/login">로그인</NavLink>
    </NavContainer>
  );

  return (
    <HeaderContainer>
      <Logo to="/">팀 주간 트래커</Logo>
      {isAuthenticated ? authLinks : guestLinks}
    </HeaderContainer>
  );
};

export default Header;