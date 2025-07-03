// client/src/components/layout/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Define menu items based on user role
  const getMenuItems = () => {
    const menuItems = [
      {
        path: '/dashboard',
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

    // Filter menu items based on user role
    return menuItems.filter(item => 
      item.roles.includes(user?.role || 'member')
    );
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar" style={{ width: 200, background: '#f5f5f5', height: '100vh', position: 'fixed', top: 56, left: 0, padding: 24, borderRight: '1px solid #eee' }}>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {menuItems.map((item) => (
            <li style={{ marginBottom: 16 }} key={item.path}>
              <button onClick={() => navigate(item.path)} className="nav-link" style={{ background: 'none', border: 'none', color: '#222', fontSize: 16, cursor: 'pointer' }}>
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </button>
            </li>
          ))}
          
          {/* Role-specific menu items */}
          {(user?.role === 'admin' || user?.role === 'executive') && (
            <>
              <div className="nav-divider my-2" style={{ borderTop: '1px solid #e9ecef' }}></div>
              <div className="nav-header px-3 py-2 text-muted text-uppercase small">
                관리자 메뉴
              </div>
              {user?.role === 'admin' && (
                <li style={{ marginBottom: 16 }}>
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) => 
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                    style={{ background: 'none', border: 'none', color: '#222', fontSize: 16, cursor: 'pointer' }}
                  >
                    <i className="fas fa-user-cog mr-2"></i>
                    사용자 관리
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink
                  to="/admin/statistics"
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  style={{ background: 'none', border: 'none', color: '#222', fontSize: 16, cursor: 'pointer' }}
                >
                  <i className="fas fa-chart-bar mr-2"></i>
                  통계 관리
                </NavLink>
              </li>
            </>
          )}
          
          {/* Quick Actions */}
          <div className="nav-divider my-2" style={{ borderTop: '1px solid #e9ecef' }}></div>
          <div className="nav-header px-3 py-2 text-muted text-uppercase small">
            빠른 작업
          </div>
          
          {(user?.role === 'admin' || user?.role === 'executive' || user?.role === 'leader') && (
            <li>
              <NavLink
                to="/teams/create"
                className="nav-link"
                style={{ background: 'none', border: 'none', color: '#222', fontSize: 16, cursor: 'pointer' }}
              >
                <i className="fas fa-plus mr-2"></i>
                팀 생성
              </NavLink>
            </li>
          )}
          
          <li>
            <NavLink
              to="/reports/create"
              className="nav-link"
              style={{ background: 'none', border: 'none', color: '#222', fontSize: 16, cursor: 'pointer' }}
            >
              <i className="fas fa-edit mr-2"></i>
              보고서 작성
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;