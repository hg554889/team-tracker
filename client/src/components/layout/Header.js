// client/src/components/layout/Header.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  return (
    <header style={{ height: 56, background: '#222', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
      <div style={{ fontWeight: 'bold', fontSize: 20 }}>Team Tracker</div>
      <div>
        {user && (
          <>
            <span style={{ marginRight: 16 }}>{user.name || '사용자'}</span>
            <button onClick={logout} style={{ background: '#fff', color: '#222', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>로그아웃</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;