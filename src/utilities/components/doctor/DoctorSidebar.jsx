// ============================================================
//  DoctorSidebar.jsx – Reusable Doctor Sidebar Component
// ============================================================

import { logout } from '../../auth';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../style/doctor/DoctorLayout.css';

const NAV_ITEMS = [
  { name: 'Overview', icon: 'grid_view', path: '/doctor/dashboard' },
  { name: 'Live Queue', icon: 'queue', path: '/doctor/live-queue' },
  { name: 'Appointments', icon: 'calendar_month', path: '/doctor/appointments' },
  { name: 'Analytics', icon: 'bar_chart', path: '/doctor/analytics' },
];


export default function DoctorSidebar({ activeTab = 'Overview', showToast }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex min-h-screen sticky top-0 h-screen">
      <div>
        <div className="p-6 border-b border-slate-100">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/doctor/dashboard')}
          >
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
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-900 tracking-tight leading-none">
                Medi<span className="text-blue-600">Q</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-blue-600 uppercase mt-0.5">
                Doctor Portal
              </span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-blue-50/80 text-blue-600 border-l-4 border-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-xl ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
