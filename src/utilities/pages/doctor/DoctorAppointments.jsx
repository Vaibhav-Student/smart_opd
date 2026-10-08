// ============================================================
//  DoctorAppointments.jsx  –  Doctor Appointments Schedule (Dynamic)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import { getAuthPayload, getAuthHeaders } from '../../auth';
import '../../style/doctor/DoctorAppointments.css';

const API = 'http://localhost:8000';

export default function DoctorAppointments() {
  const payload = getAuthPayload();
  const doctorId = payload?.uid ?? payload?.id;

  const [appointments, setAppointments] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = useCallback(async () => {
    if (!doctorId) {
      setError('Doctor session is missing. Please sign in again.');
      setLoading(false);
      return;
    }

    try {
      setError('');
      const res = await fetch(`${API}/queues/board?did=${encodeURIComponent(doctorId)}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to fetch appointments (${res.status})`);
      const board = await res.json();
      const myBoard = Array.isArray(board)
        ? board.find((b) => String(b.doctor?.did) === String(doctorId))
        : null;

      if (myBoard) {
        const all = [];
        if (myBoard.serving) all.push({ ...myBoard.serving, displayStatus: 'Serving' });
        if (myBoard.called) all.push({ ...myBoard.called, displayStatus: 'Called' });
        (myBoard.waiting || []).forEach(w => all.push({
          ...w,
          displayStatus: w.priority === 'Emergency' ? 'Urgent' : 'Waiting'
        }));
        (myBoard.skipped || []).forEach(s => all.push({ ...s, displayStatus: 'Skipped' }));
        setAppointments(all);
        setCompletedCount(myBoard.completed_count || 0);
      } else {
        setAppointments([]);
        setCompletedCount(0);
      }
    } catch (err) {
      console.error('Appointments fetch error:', err);
      setError(err.message || 'Unable to load appointments.');
      setAppointments([]);
      setCompletedCount(0);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 8000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Serving': return 'bg-blue-50 text-blue-700 ring-blue-200/80';
      case 'Called': return 'bg-sky-50 text-sky-700 ring-sky-200/80';
      case 'Urgent': return 'bg-red-50 text-red-700 ring-red-200/80';
      case 'Skipped': return 'bg-slate-100 text-slate-500 ring-slate-200/80';
      default: return 'bg-amber-50 text-amber-700 ring-amber-200/80';
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    return (parts[0]?.charAt(0) || '') + (parts[1]?.charAt(0) || '');
  };

  if (loading) {
    return (
      <DoctorLayout activeTab="Appointments">
        <div className="doctor-appointments-container flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <div className="relative mx-auto h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-semibold text-slate-500">Loading appointment schedule...</p>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activeTab="Appointments">
      <div className="doctor-appointments-container bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-2xl font-bold text-slate-900">Today's Appointment Schedule</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">{appointments.length} Active</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {completedCount} Completed
            </span>
          </div>
        </div>

        {/* ---------- Error state ---------- */}
        {error && (
          <div
            role="alert"
            className="mx-6 mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="material-symbols-outlined text-[20px] leading-none text-red-600">error</span>
              <span className="truncate font-medium">{error}</span>
            </span>
            <button
              type="button"
              onClick={fetchAppointments}
              className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition-colors duration-150 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-slate-300">calendar_month</span>
            <p className="text-sm font-bold text-slate-400 mt-3">No appointments scheduled for today</p>
            <p className="text-xs text-slate-400 mt-1">Patients will show here once registered by the receptionist</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((item) => (
              <div key={item.qid} className="appointment-item-card p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-blue-600">T-{item.token}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${getStatusBadge(item.displayStatus)}`}>
                      {item.displayStatus}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{item.patient_name}</h4>
                  <p className="text-xs text-slate-500 font-bold">
                    Priority: {item.priority || 'Low'} • Score: {item.final_score} • Wait Bonus: +{item.waiting_bonus || 0}
                  </p>
                  {item.patient_contact && (
                    <p className="text-xs text-slate-500 font-bold mt-0.5">Contact: {item.patient_contact}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700">
                    Pos #{item.queue_position || '—'}
                  </span>
                  {item.estimated_wait_time > 0 && (
                    <p className="text-[11px] font-bold text-slate-400 mt-1">~{item.estimated_wait_time} min wait</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
