// ============================================================
//  ReceptionistLayout.jsx – Shared Receptionist Layout Component
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceptionistSidebar from './ReceptionistSidebar';
import ReceptionistHeader from './ReceptionistHeader';
import '../../style/receptionist/ReceptionistLayout.css';

import { getAuthPayload, getAuthHeaders, logout } from '../../auth';

export default function ReceptionistLayout({ children, activeTab = 'Dashboard' }) {
  const navigate = useNavigate();

  // Settings State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [autoPrintSlip, setAutoPrintSlip] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [voiceAnnouncement, setVoiceAnnouncement] = useState(true);
  const [printerModel, setPrinterModel] = useState('POS-80 Thermal Receipt Printer');
  const [stationName, setStationName] = useState('Main Reception Counter A-01');

  const payload = getAuthPayload();

  // User Profile State
  const [profile, setProfile] = useState({
    name: payload?.username ? `Receptionist ${payload.username}` : "Pooja Varma",
    dob: "1992-04-12",
    gender: "Female",
    email: payload?.username ? `${payload.username}@smartopd.in` : "pooja.v@smartopd.in",
    contact: "+91 98123 45678",
    username: payload?.username || "rec_pooja",
    password: "",
    shift: "Morning",
    status: "Active"
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = () => {
    logout(navigate);
  };

  useEffect(() => {
    fetch("http://localhost:8000/receptionist/me", {
      headers: getAuthHeaders()
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch current receptionist profile");
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === 'object' && !data.error) {
          setProfile(prev => ({ ...prev, ...data }));
        }
      })
      .catch((err) => {
        console.log("Using session receptionist profile:", err.message);
      });
  }, []);

  const saveProfile = () => {
    fetch("http://localhost:8000/receptionist/me", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    })
      .then((res) => res.json())
      .then(() => {
        showToast("Profile updated successfully!");
      })
      .catch((err) => {
        console.log(err);
        showToast("Profile updated in current session!");
      });
  };

  return (
    <div className="receptionist-panel min-h-screen bg-[#F8FAFC] text-slate-800 flex font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[200] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <span className="material-symbols-outlined text-green-400 text-2xl">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Receptionist Sidebar */}
      <ReceptionistSidebar activeTab={activeTab} showToast={showToast} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Receptionist Header */}
        <ReceptionistHeader
          profileName={profile.name}
          stationName={stationName}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
        />

        {/* USER PROFILE MODAL */}
        {profileOpen && (
          <div
            className="profile-overlay fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setProfileOpen(false);
            }}
          >
            <div
              className="profile-modal bg-white rounded-[28px] max-w-2xl w-full shadow-2xl border border-slate-200 relative transition-all"
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-modal-title"
            >
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="absolute top-5 right-5 z-10 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white/80 transition-colors"
                aria-label="Close profile"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="profile-modal-header flex items-center gap-4 px-6 py-6 sm:px-8">
                <div className="w-14 h-14 rounded-2xl bg-white text-blue-700 font-black text-lg flex items-center justify-center border border-blue-100 shadow-sm">
                  {profile.name.split(" ")[0]?.charAt(0) || ""}
                  {profile.name.split(" ")[1]?.charAt(0) || ""}
                </div>
                <div>
                  <h3 id="profile-modal-title" className="text-xl font-bold text-slate-900">{profile.name}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">Receptionist profile</p>
                  <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {profile.status}
                  </span>
                </div>
              </div>
              <div className="profile-modal-body px-6 pb-2 sm:px-8 max-h-[58vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date of birth</label>
                  <input
                    type="date"
                    value={profile.dob}
                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gender</label>

                  <div className="flex gap-5 text-xs font-medium text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={profile.gender === "Male"}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      />
                      Male
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={profile.gender === "Female"}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      />
                      Female
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mobile number</label>
                  <input
                    type="tel"
                    value={profile.contact}
                    onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username</label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder={profile.password || ''}
                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Shift</label>

                  <select
                    value={profile.shift || ''}
                    onChange={(e) => setProfile({ ...profile, shift: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Morning"> Morning </option>
                    <option value="Evening"> Evening </option>
                    <option value="Afternoon"> Afternoon </option>
                    <option value="Night"> Night </option>
                  </select>
                </div>
              </div>
              <div className="mt-5 px-6 py-4 sm:px-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/60 rounded-b-[28px]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Logout
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    showToast('Profile updated successfully!');
                    saveProfile()
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Container */}
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 px-6 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">MediQ</span>
              <span>© 2026 Smart OPD Healthcare Solutions. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#support" className="hover:text-blue-600 transition-colors">Support</a>
              <a href="#contact" className="hover:text-blue-600 transition-colors">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
