// ============================================================
//  ReceptionistHeader.jsx – Reusable Receptionist Header Component
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/receptionist/ReceptionistLayout.css';

export default function ReceptionistHeader({
  profileName = '',
  stationName = 'Main Reception Counter A-01',
  onOpenSettings,
  onOpenProfile,
}) {
  const navigate = useNavigate();
  const displayName = profileName || "";

  return (
    <header className="receptionist-header bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h2 className="text-2xl font-bold font-black text-slate-900">Welcome, {profileName}</h2>
        <p className="text-xs text-slate-400 mt-1">
          {stationName} • Smart OPD Registration Desk
        </p>
      </div>

      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => {
            navigate('/receptionist/dashboard');
            setTimeout(() => {
              document.getElementById('patient-form')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Register Patient
        </button>

        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-90 transition-opacity text-left"
          title="Open receptionist profile"
        >
          <span className="hidden lg:block">
            <span className="block text-xs font-semibold text-slate-700">{displayName}</span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Profile</span>
          </span>
          <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center border border-blue-100 text-sm">
            {displayName.split(" ")[0]?.charAt(0) || "R"}
            {displayName.split(" ")[1]?.charAt(0) || ""}
          </span>
        </button>
      </div>
    </header>
  );
}
