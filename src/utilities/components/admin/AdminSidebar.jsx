// ============================================================
//  AdminSidebar.jsx – Reusable Admin Sidebar Component
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getAuthHeaders, getAuthPayload } from '../../auth';
import '../../style/admin/AdminDashboard.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
  { label: 'Doctors', icon: 'medical_services', path: '/admin/doctors' },
  { label: 'Receptionists', icon: 'badge', path: '/admin/receptionists' },
  { label: 'Symptoms Master', icon: 'coronavirus', path: '/admin/symptoms' },
  { label: 'Reports', icon: 'analytics', path: '/admin/reports' },
];

function AdminSidebar({ isCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState(() => {
    const payload = getAuthPayload();
    return payload?.username || "Admin User";
  });

  useEffect(() => {
    fetch("http://localhost:8000/admin/me", {
      headers: getAuthHeaders()
    })
      .then((res) => {
        if (!res.ok) return fetch("http://localhost:8000/admin").then(r => r.json());
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setName(data[0].name);
        } else if (data?.name) {
          setName(data.name);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 bg-blue-600/25 rounded-xl blur-sm group-hover:bg-blue-600/40 transition-all"></div>
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-[1.5px] shadow-md group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-slate-900 rounded-[10.5px] flex items-center justify-center overflow-hidden">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L4 6v5c0 5.25 3.4 10.15 8 11.5 4.6-1.35 8-6.25 8-11.5V6l-8-4z"
                  fill="#0284c7"
                  fillOpacity="0.25"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <path d="M12 7v10M7 12h10" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                <path
                  d="M9 12l2 2.2 4-4.2"
                  stroke="#38bdf8"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        {!isCollapsed && <div className="flex flex-col">
          <span className="font-bold text-xl text-slate-900 tracking-tight leading-none">
            Medi<span className="text-blue-600">Q</span>
          </span>
          <span className="text-[9px] font-bold tracking-widest text-blue-600 uppercase mt-0.5">
            Admin Portal
          </span>
        </div>}
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/admin/doctors' && location.pathname === '/admin/add-doctor') ||
            (item.path === '/admin/receptionists' && location.pathname === '/admin/add-receptionist') ||
            (item.path === '/admin/symptoms' && (location.pathname === '/admin/symptoms' || location.pathname === '/admin/add-symptom'));

          return (
            <button
              key={item.path}
              className={`sidebar__nav-link ${
                isActive ? 'sidebar__nav-link--active' : 'sidebar__nav-link--inactive'
              }`}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="material-symbols-outlined sidebar__nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="sidebar__nav-text">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer – User info + Logout */}
      <div className="sidebar__footer">
        <div
          className="sidebar__user"
          onClick={() => navigate('/admin/profile')}
          style={{ cursor: 'pointer' }}
          title={isCollapsed ? "(Admin Profile)" : "Admin Profile"}
        >
          <div className="sidebar__user-avatar">
            <span className="material-symbols-outlined">person</span>
          </div>
          {!isCollapsed && (
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{name}</span>
              <span className="sidebar__user-role">Admin</span>
            </div>
          )}
        </div>
        <button
          className="sidebar__logout"
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
        >
          <span className="material-symbols-outlined sidebar__nav-icon">logout</span>
          {!isCollapsed && <span className="sidebar__nav-text">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
