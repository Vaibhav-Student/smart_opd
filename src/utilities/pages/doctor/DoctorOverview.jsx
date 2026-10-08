// ============================================================
//  DoctorOverview.jsx  –  Doctor Dashboard Overview Page (Dynamic)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import { getAuthPayload, getAuthHeaders } from '../../auth';
import '../../style/doctor/DoctorOverview.css';

const API = 'http://localhost:8000';

export default function DoctorOverview() {
  const payload = getAuthPayload();
  const doctorId = payload?.uid;

  const [doctorData, setDoctorData] = useState(null);
  const [servingPatient, setServingPatient] = useState(null);
  const [calledPatient, setCalledPatient] = useState(null);
  const [waitingList, setWaitingList] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [skippedList, setSkippedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Prescription state
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxMedicines, setRxMedicines] = useState('');
  const [rxInstructions, setRxInstructions] = useState('');

  // Build a unified appointments list from live queue data
  const allAppointments = [
    ...(servingPatient ? [{ ...servingPatient, displayStatus: 'SERVING', statusColor: 'blue' }] : []),
    ...(calledPatient ? [{ ...calledPatient, displayStatus: 'CALLED', statusColor: 'sky' }] : []),
    ...waitingList.map(w => ({
      ...w,
      displayStatus: w.priority === 'Emergency' ? 'URGENT' : 'WAITING',
      statusColor: w.priority === 'Emergency' ? 'red' : 'orange'
    })),
  ];

  const pendingCount = allAppointments.length;
  const totalToday = pendingCount + completedCount;

  const fetchQueueData = useCallback(async () => {
    if (!doctorId) return;
    try {
      const res = await fetch(`${API}/queues/board`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch queue');
      const board = await res.json();

      // Find this doctor's board entry
      const myBoard = board.find(b => b.doctor?.did === doctorId);
      if (myBoard) {
        setDoctorData(myBoard.doctor);
        setServingPatient(myBoard.serving || null);
        setCalledPatient(myBoard.called || null);
        setWaitingList(myBoard.waiting || []);
        setCompletedCount(myBoard.completed_count || 0);
        setSkippedList(myBoard.skipped || []);
      } else {
        // Doctor has no queue entries yet
        setServingPatient(null);
        setCalledPatient(null);
        setWaitingList([]);
        setCompletedCount(0);
        setSkippedList([]);
      }
    } catch (err) {
      console.error('Queue fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 6000);
    return () => clearInterval(interval);
  }, [fetchQueueData]);

  // Queue action helpers
  const handleCallNext = async () => {
    if (!doctorId || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/queue/call-next/${doctorId}`, {
        method: 'POST', headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.status === 'busy') {
        alert(data.message);
      }
      await fetchQueueData();
    } catch (err) {
      console.error('Call next error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleServe = async (qid) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await fetch(`${API}/queue/serve/${qid}`, {
        method: 'POST', headers: getAuthHeaders()
      });
      await fetchQueueData();
    } catch (err) {
      console.error('Serve error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (qid) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await fetch(`${API}/queue/complete/${qid}`, {
        method: 'POST', headers: getAuthHeaders()
      });
      setRxDiagnosis('');
      setRxMedicines('');
      setRxInstructions('');
      await fetchQueueData();
    } catch (err) {
      console.error('Complete error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async (qid) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await fetch(`${API}/queue/skip/${qid}`, {
        method: 'POST', headers: getAuthHeaders()
      });
      await fetchQueueData();
    } catch (err) {
      console.error('Skip error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecall = async (qid) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await fetch(`${API}/queue/recall/${qid}`, {
        method: 'POST', headers: getAuthHeaders()
      });
      await fetchQueueData();
    } catch (err) {
      console.error('Recall error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePrescription = (e) => {
    e.preventDefault();
    const patientName = servingPatient?.patient_name || calledPatient?.patient_name || 'Patient';
    alert(`E-Prescription generated & sent via SMS to ${patientName}`);
    setRxDiagnosis('');
    setRxMedicines('');
    setRxInstructions('');
  };

  const getStatusBadgeClass = (statusColor) => {
    switch (statusColor) {
      case 'blue': return 'bg-blue-100 text-blue-700';
      case 'sky': return 'bg-sky-100 text-sky-700';
      case 'red': return 'bg-red-100 text-red-700';
      case 'emerald': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    return (parts[0]?.charAt(0) || '') + (parts[1]?.charAt(0) || '');
  };

  const currentPatient = servingPatient || calledPatient;
  const nextWaiting = waitingList.length > 0 ? waitingList[0] : null;
  const avgTime = doctorData?.avg_time || 12;

  if (loading) {
    return (
      <DoctorLayout activeTab="Overview">
        <div className="doctor-overview-container flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-slate-500">Loading dashboard...</p>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activeTab="Overview">
      <div className="doctor-overview-container space-y-6">
        {/* 4 Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overview-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">calendar_today</span>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 mb-1">Today's Visits</p>
            <h3 className="text-3xl font-semibold font-black text-slate-900">{totalToday}</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overview-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">hourglass_empty</span>
              </div>
              {waitingList.some(w => w.priority === 'Emergency') && (
                <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  {waitingList.filter(w => w.priority === 'Emergency').length} Emergency
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-400 mb-1">Pending Queue</p>
            <h3 className="text-3xl font-semibold font-black text-slate-900">{pendingCount}</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overview-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 mb-1">Completed Cases</p>
            <h3 className="text-3xl font-semibold font-black text-slate-900">{completedCount}</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overview-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">timer</span>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 mb-1">Avg. Consultation</p>
            <h3 className="text-3xl font-semibold font-black text-slate-900">
              {avgTime} <span className="text-lg font-semibold text-slate-500">min</span>
            </h3>
          </div>
        </div>

        {/* Grid: Table & E-Prescription */}
        <div className="grid grid-cols-1 gap-8">
          {/* Patient Appointment List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Patient Queue</h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Active consultation queue • {doctorData?.specialization || 'General'}
                </p>
              </div>
              {skippedList.length > 0 && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                  {skippedList.length} Skipped
                </span>
              )}
            </div>

            {allAppointments.length === 0 && skippedList.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-slate-300">how_to_reg</span>
                <p className="text-sm font-bold text-slate-400 mt-3">No patients in queue right now</p>
                <p className="text-xs text-slate-400 mt-1">Patients will appear here when registered by receptionist</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <th className="py-3 px-4">TOKEN</th>
                      <th className="py-3 px-4">PATIENT</th>
                      <th className="py-3 px-4">PRIORITY</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4">EST. WAIT</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {allAppointments.map((row) => (
                      <tr key={row.qid} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 font-black">
                          <span className={row.statusColor === 'red' ? 'text-red-600' : 'text-blue-600'}>
                            T-{row.token}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-blue-100 text-blue-700">
                              {getInitials(row.patient_name)}
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-900 leading-tight">{row.patient_name}</h5>
                              <p className="text-[11px] text-slate-400 font-bold">
                                Score: {row.final_score} • Bonus: +{row.waiting_bonus}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${row.priority === 'Emergency' ? 'bg-red-100 text-red-700' :
                              row.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                row.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-600'
                            }`}>
                            {row.priority || 'Low'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase ${getStatusBadgeClass(row.statusColor)}`}>
                            {row.displayStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-600">
                          {row.estimated_wait_time > 0 ? `~${row.estimated_wait_time} min` : '—'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {row.displayStatus === 'CALLED' && (
                              <>
                                <button
                                  onClick={() => handleServe(row.qid)}
                                  disabled={actionLoading}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                                >
                                  <span className="material-symbols-outlined text-sm">person</span>
                                  Start
                                </button>
                                <button
                                  onClick={() => handleSkip(row.qid)}
                                  disabled={actionLoading}
                                  className="px-3 py-1 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white font-bold text-xs rounded-lg transition-all border border-amber-200 disabled:opacity-50"
                                >
                                  Skip
                                </button>
                              </>
                            )}
                            {row.displayStatus === 'SERVING' && (
                              <button
                                onClick={() => handleComplete(row.qid)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-sm">check</span>
                                Complete
                              </button>
                            )}
                            {(row.displayStatus === 'WAITING' || row.displayStatus === 'URGENT') && (
                              <button
                                onClick={() => handleSkip(row.qid)}
                                disabled={actionLoading}
                                className="px-3 py-1 bg-slate-50 text-slate-500 hover:bg-slate-200 font-bold text-xs rounded-lg transition-all border border-slate-200 disabled:opacity-50"
                              >
                                Skip
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Skipped patients */}
                    {skippedList.map((row) => (
                      <tr key={row.qid} className="hover:bg-slate-50/70 transition-colors opacity-60">
                        <td className="py-4 px-4 font-black text-slate-400">T-{row.token}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-slate-100 text-slate-500">
                              {getInitials(row.patient_name)}
                            </div>
                            <h5 className="font-bold text-slate-500 leading-tight">{row.patient_name}</h5>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider bg-slate-100 text-slate-500">
                            {row.priority || 'Low'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase bg-slate-200 text-slate-600">
                            SKIPPED
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-400">—</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleRecall(row.qid)}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-xs rounded-lg transition-all border border-blue-200 disabled:opacity-50"
                          >
                            Recall
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* E-Prescription Form — only when serving */}
          {servingPatient && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-xl">edit_note</span>
                  <h4 className="text-lg font-bold text-slate-900">
                    Active Consultation Notes for {servingPatient.patient_name} (T-{servingPatient.token})
                  </h4>
                </div>
                <span className="text-xs font-bold text-slate-500">QID: {servingPatient.qid}</span>
              </div>
              <form onSubmit={handleSavePrescription} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Diagnosis &amp; Symptoms
                    </label>
                    <textarea
                      rows={2}
                      value={rxDiagnosis}
                      onChange={(e) => setRxDiagnosis(e.target.value)}
                      placeholder="e.g. Mild Angina, Elevated Blood Pressure (140/90)"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Prescribed Medicines &amp; Dosage
                    </label>
                    <textarea
                      rows={2}
                      value={rxMedicines}
                      onChange={(e) => setRxMedicines(e.target.value)}
                      placeholder="e.g. Tab. Amlodipine 5mg 1-0-1 (7 days)"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <input
                    type="text"
                    value={rxInstructions}
                    onChange={(e) => setRxInstructions(e.target.value)}
                    placeholder="Special Advice: Rest for 3 days"
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">print</span>
                    Save &amp; Send E-Prescription
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
