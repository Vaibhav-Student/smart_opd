// ============================================================
//  DoctorLiveQueue.jsx  –  Doctor Live Queue Board Page (Dynamic)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import { getAuthPayload, getAuthHeaders } from '../../auth';
import '../../style/doctor/DoctorLiveQueue.css';

const API = 'http://localhost:8000';

export default function DoctorLiveQueue() {
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

  const fetchQueueData = useCallback(async () => {
    if (!doctorId) return;
    try {
      // Single-lane fetch: avoids full-hospital recompute every 6s (real-world scale fix).
      const res = await fetch(`${API}/queues/board?did=${doctorId}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch queue');
      const board = await res.json();

      const myBoard = board.find(b => b.doctor?.did === doctorId) || board[0];
      if (myBoard) {
        setDoctorData(myBoard.doctor);
        setServingPatient(myBoard.serving || null);
        setCalledPatient(myBoard.called || null);
        setWaitingList(myBoard.waiting || []);
        setCompletedCount(myBoard.completed_count || 0);
        setSkippedList(myBoard.skipped || []);
      } else {
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

  const handleCallNext = async () => {
    if (!doctorId || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/queue/call-next/${doctorId}`, {
        method: 'POST', headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.status === 'busy') alert(data.message);
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
      await fetch(`${API}/queue/serve/${qid}`, { method: 'POST', headers: getAuthHeaders() });
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
      await fetch(`${API}/queue/complete/${qid}`, { method: 'POST', headers: getAuthHeaders() });
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
      await fetch(`${API}/queue/skip/${qid}`, { method: 'POST', headers: getAuthHeaders() });
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
      await fetch(`${API}/queue/recall/${qid}`, { method: 'POST', headers: getAuthHeaders() });
      await fetchQueueData();
    } catch (err) {
      console.error('Recall error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    return (parts[0]?.charAt(0) || '') + (parts[1]?.charAt(0) || '');
  };

  // Build all cards
  const allCards = [
    ...(servingPatient ? [{ ...servingPatient, displayStatus: 'SERVING', cardType: 'serving' }] : []),
    ...(calledPatient ? [{ ...calledPatient, displayStatus: 'CALLED', cardType: 'called' }] : []),
    ...waitingList.map(w => ({
      ...w,
      displayStatus: w.priority === 'Emergency' ? 'URGENT' : 'WAITING',
      cardType: w.priority === 'Emergency' ? 'urgent' : 'waiting'
    })),
    ...skippedList.map(s => ({ ...s, displayStatus: 'SKIPPED', cardType: 'skipped' }))
  ];

  const getCardClasses = (cardType) => {
    switch (cardType) {
      case 'serving': return 'queue-card-consulting bg-blue-50/80 border-blue-300';
      case 'called': return 'bg-sky-50/70 border-sky-300';
      case 'urgent': return 'queue-card-urgent border-red-300';
      case 'skipped': return 'bg-slate-100/60 border-slate-300 opacity-60';
      default: return 'bg-slate-50/50 border-slate-200';
    }
  };

  const getStatusBadgeClasses = (cardType) => {
    switch (cardType) {
      case 'serving': return 'bg-blue-600 text-white';
      case 'called': return 'bg-sky-500 text-white';
      case 'urgent': return 'bg-red-600 text-white';
      case 'skipped': return 'bg-slate-400 text-white';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  if (loading) {
    return (
      <DoctorLayout activeTab="Live Queue">
        <div className="doctor-live-queue-container flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-slate-500">Loading queue...</p>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activeTab="Live Queue">
      <div className="doctor-live-queue-container bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Live OPD Queue Board</h3>
            <p className="text-sm text-slate-500 font-semibold font-bold mt-0.5">
              Real-time queue • {doctorData?.specialization || 'General'} • {allCards.length} total entries
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              {completedCount} Completed
            </span>
            <button
              onClick={handleCallNext}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">play_arrow</span>
              Call Next Patient
            </button>
          </div>
        </div>

        {allCards.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-slate-300">queue</span>
            <p className="text-sm font-bold text-slate-400 mt-3">No patients in queue</p>
            <p className="text-xs text-slate-400 mt-1">Patients will appear here when assigned by receptionist</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allCards.map((item) => (
              <div
                key={item.qid}
                className={`p-5 rounded-2xl border transition-all ${getCardClasses(item.cardType)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black text-blue-600">T-{item.token}</span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${getStatusBadgeClasses(item.cardType)}`}>
                    {item.displayStatus}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">{item.patient_name}</h4>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Priority: {item.priority || 'Low'} • Score: {item.final_score} • Bonus: +{item.waiting_bonus || 0}
                </p>
                {item.patient_contact && (
                  <p className="text-xs text-slate-600 font-bold mt-1">Mobile: {item.patient_contact}</p>
                )}
                {item.estimated_wait_time > 0 && item.cardType === 'waiting' && (
                  <p className="text-xs text-slate-500 font-bold mt-1">Est. wait: ~{item.estimated_wait_time} min</p>
                )}
                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    Pos: #{item.queue_position || '—'}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.cardType === 'serving' && (
                      <button
                        onClick={() => handleComplete(item.qid)}
                        disabled={actionLoading}
                        className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Mark Complete
                      </button>
                    )}
                    {item.cardType === 'called' && (
                      <>
                        <button
                          onClick={() => handleServe(item.qid)}
                          disabled={actionLoading}
                          className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          Start Serving
                        </button>
                        <button
                          onClick={() => handleSkip(item.qid)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-amber-50 text-amber-600 font-bold text-xs rounded-lg border border-amber-200 hover:bg-amber-600 hover:text-white disabled:opacity-50"
                        >
                          Skip
                        </button>
                      </>
                    )}
                    {(item.cardType === 'waiting' || item.cardType === 'urgent') && (
                      <button
                        onClick={() => handleSkip(item.qid)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-slate-50 text-slate-500 font-bold text-xs rounded-lg border border-slate-200 hover:bg-slate-200 disabled:opacity-50"
                      >
                        Skip
                      </button>
                    )}
                    {item.cardType === 'skipped' && (
                      <button
                        onClick={() => handleRecall(item.qid)}
                        disabled={actionLoading}
                        className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        Recall
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
