// ============================================================
//  DoctorHeader.jsx – Reusable Doctor Top Header Component
// ============================================================

import React from 'react';
import '../../style/doctor/DoctorLayout.css';

export default function DoctorHeader({
  docName = 'Dr. Sharma',
  docSpecialty = 'Cardiology Department',
  roomNumber = 'Room 402B',
  onOpenSettings,
  onOpenProfile,
}) {
  const displayName = docName || 'Doctor';

  return (
    <header className="doctor-header bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h2 className="text-2xl font-bold font-black text-slate-900">Welcome back, {displayName}</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          {docSpecialty} • {roomNumber} • Live OPD Session
        </p>
      </div>
      <div className="flex items-center gap-4 relative">
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-90 transition-opacity text-left"
          title="Open doctor profile"
        >
          <span className="hidden lg:block">
            <span className="block text-xs font-semibold text-slate-700">{displayName}</span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Profile</span>
          </span>
          <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center border border-blue-100 text-sm">
            {displayName.split(" ")[0]?.charAt(0) || "D"}
            {displayName.split(" ")[1]?.charAt(0) || ""}
          </span>
        </button>
      </div>
    </header>
  );
}
