// ============================================================
//  DoctorAnalytics.jsx  –  Doctor Productivity & Analytics (Dynamic)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import { getAuthPayload, getAuthHeaders } from '../../auth';
import '../../style/doctor/DoctorAnalytics.css';

const API = 'http://localhost:8000';

export default function DoctorAnalytics() {
  const payload = getAuthPayload();
  const doctorId = payload?.uid;

  const [stats, setStats] = useState({
    avgTime: 0,
    completedCount: 0,
    waitingCount: 0,
    skippedCount: 0,
    totalToday: 0,
    queueEfficiency: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!doctorId) return;
    try {
      const res = await fetch(`${API}/queues/board`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch');
      const board = await res.json();
      const myBoard = board.find(b => b.doctor?.did === doctorId);

      if (myBoard) {
        const waitingCount = (myBoard.waiting || []).length;
        const servingCount = myBoard.serving ? 1 : 0;
        const calledCount = myBoard.called ? 1 : 0;
        const completedCount = myBoard.completed_count || 0;
        const skippedCount = (myBoard.skipped || []).length;
        const totalToday = waitingCount + servingCount + calledCount + completedCount + skippedCount;
        const efficiency = totalToday > 0 ? Math.round((completedCount / totalToday) * 100) : 0;

        setStats({
          avgTime: myBoard.doctor?.avg_time || 12,
          completedCount,
          waitingCount,
          skippedCount,
          totalToday,
          queueEfficiency: efficiency,
        });
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <DoctorLayout activeTab="Analytics">
        <div className="doctor-analytics-container flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-slate-500">Loading analytics...</p>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activeTab="Analytics">
      <div className="doctor-analytics-container bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
        <h3 className="text-2xl font-bold text-slate-900">Doctor Productivity &amp; OPD Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="analytics-stat-card p-6 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
            <span className="text-xs font-bold font-black text-blue-600 uppercase">AVG CONSULTATION TIME</span>
            <div className="text-3xl font-bold font-black text-slate-900">{stats.avgTime} <span className="text-lg font-bold text-slate-500">min</span></div>
            <p className="text-xs text-slate-500 font-semibold">Based on doctor profile setting</p>
          </div>
          <div className="analytics-stat-card p-6 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <span className="text-xs font-bold font-black text-emerald-600 uppercase">COMPLETED TODAY</span>
            <div className="text-3xl font-bold font-black text-slate-900">{stats.completedCount} <span className="text-lg font-bold text-slate-500">/ {stats.totalToday}</span></div>
            <p className="text-xs text-slate-500 font-semibold">{stats.waitingCount} still waiting • {stats.skippedCount} skipped</p>
          </div>
          <div className="analytics-stat-card p-6 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
            <span className="text-xs font-bold font-black text-amber-600 uppercase">QUEUE EFFICIENCY</span>
            <div className="text-3xl font-bold font-black text-slate-900">{stats.queueEfficiency}<span className="text-lg font-bold text-slate-500">%</span></div>
            <p className="text-xs text-slate-500 font-semibold">Completion rate for today's queue</p>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
