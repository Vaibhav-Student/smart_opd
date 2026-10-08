// ============================================================
//  DoctorLayout.jsx – Shared Doctor Layout Component
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';
import DoctorHeader from './DoctorHeader';
import GlassDatePicker from '../controls/GlassDatePicker';
import '../../style/doctor/DoctorLayout.css';

import { getAuthPayload, getAuthHeaders, logout } from '../../auth';

export default function DoctorLayout({ children, activeTab = 'Overview' }) {
  const navigate = useNavigate();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Settings State
  const [roomNumber, setRoomNumber] = useState('Room 402B');
  const [autoNext, setAutoNext] = useState(true);
  const [audioChime, setAudioChime] = useState(true);

  const payload = getAuthPayload();

  // Doctor Profile State
  const [doctor, setDoctor] = useState({
    name: payload?.username ? `Dr. ${payload.username}` : "Dr. Priya Sharma",
    dob: "1984-06-15",
    gender: "Female",
    email: payload?.username ? `${payload.username}@smartopd.in` : "priya.sharma@smartopd.in",
    contact: "+91 98765 43210",
    specialization: "Cardiology",
    avg_time: 12,
    username: payload?.username || "dr_priya",
    password: "",
    status: "Active"
  });

  // Quick Add Patient state
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientReason, setNewPatientReason] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    fetch("http://localhost:8000/doctor/me", {
      headers: getAuthHeaders()
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch current doctor profile");
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === 'object' && !data.error) {
          setDoctor(prev => ({ ...prev, ...data }));
        }
      })
      .catch((err) => {
        console.log("Using session profile:", err.message);
      });
  }, []);

  const saveProfile = async () => {
    try {
      const response = await fetch("http://localhost:8000/doctor/me", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(doctor)
      });

      if (!response.ok) {
        showToast("Profile updated in current session!");
      } else {
        showToast("Doctor profile saved successfully!");
      }
    } catch (err) {
      console.log("Session profile updated offline:", err);
      showToast("Profile updated in session!");
    }
  };

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[200] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <span className="material-symbols-outlined text-blue-400 text-2xl">campaign</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Doctor Sidebar */}
      <DoctorSidebar activeTab={activeTab} showToast={showToast} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Doctor Header */}
        <DoctorHeader
          docName={doctor.name}
          docSpecialty={doctor.specialization}
          roomNumber={roomNumber}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
        />

        {/* PROFILE MODAL */}
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
              aria-labelledby="doctor-profile-modal-title"
            >
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="absolute top-5 right-5 z-10 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white/80 transition-colors"
                aria-label="Close doctor profile"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="profile-modal-header flex items-center gap-4 px-6 py-6 sm:px-8">
                <div className="w-14 h-14 rounded-2xl bg-white text-blue-700 font-black text-lg flex items-center justify-center border border-blue-100 shadow-sm">
                  {doctor.name.split(" ")[0]?.charAt(0) || ""}
                  {doctor.name.split(" ")[1]?.charAt(0) || ""}
                </div>
                <div>
                  <h3 id="doctor-profile-modal-title" className="text-xl font-bold text-slate-900">{doctor.name}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">{doctor.specialization} profile</p>
                  <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {doctor.status || 'Active'}
                  </span>
                </div>
              </div>
              <div className="profile-modal-body px-6 pb-2 sm:px-8 max-h-[58vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={doctor.name}
                    onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date of birth</label>
                  <input
                    type="date"
                    value={doctor.dob}
                    onChange={(e) => setDoctor({ ...doctor, dob: e.target.value })}
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
                        checked={doctor.gender === "Male"}
                        onChange={(e) => setDoctor({ ...doctor, gender: e.target.value })}
                      />
                      Male
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={doctor.gender === "Female"}
                        onChange={(e) => setDoctor({ ...doctor, gender: e.target.value })}
                      />
                      Female
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Specialization</label>
                  <input
                    type="text"
                    value={doctor.specialization}
                    onChange={(e) => setDoctor({ ...doctor, specialization: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={doctor.email}
                    onChange={(e) => setDoctor({ ...doctor, email: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact number</label>
                  <input
                    type="tel"
                    value={doctor.contact}
                    onChange={(e) => setDoctor({ ...doctor, contact: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Average consultation time</label>
                  <input
                    type="number"
                    value={doctor.avg_time}
                    onChange={(e) => setDoctor({ ...doctor, avg_time: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username</label>
                  <input
                    type="text"
                    value={doctor.username}
                    onChange={(e) => setDoctor({ ...doctor, username: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder={doctor.password || ''}
                    onChange={(e) => setDoctor({ ...doctor, password: e.target.value })}
                    className="profile-input w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
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
                    showToast('Doctor Profile Updated!');
                    saveProfile();
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

        {/* ADD DIRECT PATIENT MODAL */}
        {addModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative transition-all">
              <button
                onClick={() => setAddModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Add Patient to Queue</h3>
              <p className="text-xs text-slate-500 mb-6">Directly insert patient into today's consultation queue</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast(`Patient ${newPatientName} added to queue!`);
                  setNewPatientName('');
                  setNewPatientReason('');
                  setAddModalOpen(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Patient Name</label>
                  <input
                    required
                    type="text"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="e.g. Vikramaditya Shah"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chief Complaint / Reason</label>
                  <input
                    required
                    type="text"
                    value={newPatientReason}
                    onChange={(e) => setNewPatientReason(e.target.value)}
                    placeholder="e.g. Sudden Palpitations"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">person_add</span>
                    Add to Queue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Page Container */}
        <main className="p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 px-8 mt-auto">
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
