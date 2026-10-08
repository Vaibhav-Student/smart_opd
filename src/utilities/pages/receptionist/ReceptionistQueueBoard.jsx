import React, { useEffect, useMemo, useRef, useState } from "react";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";
import GlassSelect from "../../components/controls/GlassSelect";
import "../../style/receptionist/ReceptionistQueueBoard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const getPriorityClasses = (priority) => {
  const value = String(priority || "").toLowerCase();

  if (value === "emergency") {
    return "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-400/20";
  }
  if (value === "high") {
    return "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-400/20";
  }
  if (value === "medium") {
    return "bg-yellow-50 text-yellow-800 border-yellow-200 ring-1 ring-yellow-400/20";
  }
  return "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-400/20";
};

const getElapsedWaitMinutes = (createdAt, currentTime) => {
  if (!createdAt) return 0;
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return 0;
  return Math.max(0, Math.floor((currentTime - createdTime) / 60000));
};

export default function ReceptionistQueueBoard() {
  const [boardData, setBoardData] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [departments, setDepartments] = useState(["All"]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showSkippedFor, setShowSkippedFor] = useState({});
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [editingPatient, setEditingPatient] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const boardRequestSequence = useRef(0);

  const notify = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const fetchBoard = async () => {
    const requestId = ++boardRequestSequence.current;
    try {
      setError("");
      const deptParam = selectedDepartment && selectedDepartment !== "All"
        ? `?department=${encodeURIComponent(selectedDepartment)}`
        : "";
      
      const res = await fetch(`${API_BASE_URL}/queues/board${deptParam}`);
      if (!res.ok) {
        throw new Error(`Failed to load queue board (${res.status})`);
      }

      const data = await res.json();
      if (requestId !== boardRequestSequence.current) return;
      const list = Array.isArray(data) ? data : [];
      setBoardData(list);

      // Extract unique departments from doctors
      const deptSet = new Set();
      list.forEach((lane) => {
        if (lane.doctor && lane.doctor.specialization) {
          deptSet.add(lane.doctor.specialization.trim());
        }
      });
      setDepartments(["All", ...Array.from(deptSet).sort()]);

      setLastUpdated(new Date());
    } catch (err) {
      if (requestId !== boardRequestSequence.current) return;
      console.error("Queue board fetch error:", err);
      setError(err.message || "Failed to load live queue board.");
    } finally {
      if (requestId === boardRequestSequence.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/symptoms`);
        if (!response.ok) throw new Error("Failed to load symptoms");
        const data = await response.json();
        setSymptoms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Symptoms fetch error:", err);
      }
    };

    fetchSymptoms();
  }, []);

  useEffect(() => {
    fetchBoard();

    // Auto-refresh every 6 seconds without page reload
    const interval = setInterval(fetchBoard, 6000);
    return () => clearInterval(interval);
  }, [selectedDepartment]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Actions
  const handleCallNext = async (did) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/queue/call-next/${did}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        notify(data.message, "success");
      } else if (data.status === "busy") {
        notify(data.message, "warning");
      } else if (data.status === "empty") {
        notify(data.message, "info");
      } else {
        notify(data.message || "Could not call next patient", "error");
      }
      await fetchBoard();
    } catch (err) {
      console.error("Call next error:", err);
      notify("Network error while calling next patient", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async (qid) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/queue/skip/${qid}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        notify(data.message, "warning");
      } else {
        notify(data.message || "Could not skip patient", "error");
      }
      await fetchBoard();
    } catch (err) {
      console.error("Skip error:", err);
      notify("Network error skipping patient", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecall = async (qid) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/queue/recall/${qid}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        notify(data.message, "success");
      } else {
        notify(data.message || "Could not recall patient", "error");
      }
      await fetchBoard();
    } catch (err) {
      console.error("Recall error:", err);
      notify("Network error recalling patient", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // const handleCancel = async (qid) => {
  //   if (!window.confirm("Cancel this token? Patient left / wrong entry. This frees the lane.")) return;
  //   try {
  //     setActionLoading(true);
  //     const res = await fetch(`${API_BASE_URL}/queue/cancel/${qid}`, {
  //       method: "POST",
  //     });
  //     const data = await res.json();
  //     if (res.ok && data.status === "success") {
  //       notify(data.message, "info");
  //     } else {
  //       notify(data.message || "Could not cancel token", "error");
  //     }
  //     await fetchBoard();
  //   } catch (err) {
  //     console.error("Cancel error:", err);
  //     notify("Network error cancelling token", "error");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const toggleSkippedList = (did) => {
    setShowSkippedFor((prev) => ({
      ...prev,
      [did]: !prev[did],
    }));
  };

  const openPatientEditor = (patient) => {
    setEditingPatient(patient);
    setEditForm({
      name: patient.patient_name || "",
      dob: patient.dob ? String(patient.dob).slice(0, 10) : "",
      age: patient.age ?? "",
      gender: patient.gender || "",
      email: patient.email || "",
      contact: patient.patient_contact || "",
      address: patient.address || "",
      symptom_sid: patient.symptom_sid ? String(patient.symptom_sid) : "",
    });
  };

  const closePatientEditor = () => {
    setEditingPatient(null);
    setEditForm(null);
  };

  const handlePatientEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingPatient || !editForm) return;

    try {
      setEditSaving(true);
      const patientForm = { ...editForm };
      delete patientForm.symptom_sid;
      const response = await fetch(`${API_BASE_URL}/patient/${editingPatient.patient_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...patientForm,
          age: Number(patientForm.age),
        }),
      });
      const data = await response.json();
      if (!response.ok || data.message === "something wrong..") {
        throw new Error(data.detail || data.message || "Could not update patient");
      }

      const symptomResponse = await fetch(`${API_BASE_URL}/visit/${editingPatient.vid}/symptom`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid: Number(editForm.symptom_sid) }),
      });
      const symptomData = await symptomResponse.json();
      if (!symptomResponse.ok || symptomData.message === "something wrong..") {
        throw new Error(symptomData.detail || symptomData.message || "Could not update symptom");
      }

      notify("Patient details updated successfully", "success");
      closePatientEditor();
      await fetchBoard();
    } catch (err) {
      notify(err.message || "Could not update patient", "error");
    } finally {
      setEditSaving(false);
    }
  };

  // Metrics summary
  const summary = useMemo(() => {
    let totalWaiting = 0;
    let totalServing = 0;
    let totalCalled = 0;
    let totalEmergency = 0;
    let allWaits = [];

    boardData.forEach((lane) => {
      if (lane.serving) {
        totalServing += 1;
        if (String(lane.serving.priority).toLowerCase() === "emergency") {
          totalEmergency += 1;
        }
      }
      if (lane.called) {
        totalCalled += 1;
        if (String(lane.called.priority).toLowerCase() === "emergency") {
          totalEmergency += 1;
        }
      }
      (lane.waiting || []).forEach((w) => {
        totalWaiting += 1;
        allWaits.push(Number(w.estimated_wait_time || 0));
        if (String(w.priority).toLowerCase() === "emergency") {
          totalEmergency += 1;
        }
      });
    });

    const avgWait = allWaits.length
      ? Math.round(allWaits.reduce((acc, v) => acc + v, 0) / allWaits.length)
      : 0;

    return {
      totalWaiting,
      totalServing,
      totalCalled,
      totalEmergency,
      avgWait,
    };
  }, [boardData]);

  return (
    <ReceptionistLayout activeTab="Queue Board">
      <div className="receptionist-queueboard-container space-y-6 animate-fadeIn pb-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-bold font-black text-slate-900 tracking-tight">
                OPD Live Queue Board
              </h1>
              <span
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"
                title="Live background auto-sync active (every 6s)"
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Dynamic Aging Priority • Auto-Call Next • Real-Time Doctor Lanes
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-slate-400 font-medium">
                Synced at{" "}
                {lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            )}

            <button
              type="button"
              onClick={fetchBoard}
              disabled={loading || actionLoading}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 shadow-sm disabled:opacity-60 flex items-center gap-1.5 transition-all"
            >
              <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>
                sync
              </span>
              Refresh
            </button>
          </div>
        </div>

        {/* Global Notifications / Alerts */}
        {notification && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between shadow-sm animate-fadeIn ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : notification.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : notification.type === "info"
                ? "bg-blue-50 border-blue-200 text-blue-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">
                {notification.type === "success"
                  ? "check_circle"
                  : notification.type === "warning"
                  ? "warning"
                  : notification.type === "info"
                  ? "info"
                  : "error"}
              </span>
              <span>{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="p-1 hover:opacity-70"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Top 5 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Waiting in Queue
            </p>
            <p className="text-3xl font-bold font-black text-slate-900 mt-1">
              {summary.totalWaiting}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm bg-emerald-50/20">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Now Serving
            </p>
            <p className="text-3xl font-bold font-black text-emerald-600 mt-1">
              {summary.totalServing}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm bg-red-50/20">
            <p className="text-xs font-bold uppercase tracking-wider text-red-500">
              Emergency Cases
            </p>
            <p className="text-3xl font-bold font-black text-red-600 mt-1">
              {summary.totalEmergency}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm col-span-2 lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Est. Avg Wait
            </p>
            <p className="text-3xl font-bold font-black text-slate-900 mt-1">
              {summary.avgWait}
              <span className="text-sm font-semibold text-slate-400 ml-1">min</span>
            </p>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-base">filter_alt</span>
              Department
            </span>

            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedDepartment === dept
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && boardData.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-blue-600 animate-spin">
              progress_activity
            </span>
            <p className="text-sm font-semibold text-slate-500 mt-4">
              Synchronizing real-time OPD queues...
            </p>
          </div>
        )}

        {/* Doctor Lanes */}
        {!loading && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {boardData.map((lane) => {
              const doc = lane.doctor;
              const serving = lane.serving;
              const called = lane.called;
              const waitingList = lane.waiting || [];
              const skippedList = lane.skipped || [];
              const isDoctorBusy = Boolean(serving || called);
              const hasWaiting = waitingList.length > 0;

              return (
                <div
                  key={doc.did}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  {/* Doctor Lane Header */}
                  <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                        <span className="material-symbols-outlined text-2xl">
                          medical_services
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-lg truncate">
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-blue-600 truncate">
                            {doc.specialization}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400 font-medium">
                            ~{doc.avg_time}m/pt
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                        {lane.queue_count} Active
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCallNext(doc.did)}
                        disabled={isDoctorBusy || !hasWaiting || actionLoading}
                        title={
                          isDoctorBusy
                            ? "Doctor currently has a Called or Serving patient"
                            : !hasWaiting
                            ? "No patients waiting in queue"
                            : "Call next patient (highest final score)"
                        }
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md flex items-center gap-1.5 transition-all ${
                          isDoctorBusy || !hasWaiting
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 active:scale-95"
                        }`}
                      >
                        Call Next
                      </button>
                    </div>
                  </div>

                  {/* Lane Body */}
                  <div className="p-5 space-y-5 flex-1">
                    {/* SECTION 1: NOW SERVING */}
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-xs font-bold font-black uppercase tracking-wider text-emerald-800">
                            Now Serving
                          </span>
                        </div>

                        {serving && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            In Consultation
                          </span>
                        )}
                      </div>

                      {serving ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-black text-emerald-700">
                                #{serving.token}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${getPriorityClasses(
                                  serving.priority
                                )}`}
                              >
                                {serving.priority}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-base">
                              {serving.patient_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Final Score: <strong className="text-slate-800">{serving.final_score}</strong> (Priority {serving.priority_score} + Bonus {serving.waiting_bonus})
                            </p>
                          </div>

                        </div>
                      ) : (
                        <div className="py-3 text-center text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5">
                          <span className="material-symbols-outlined text-lg">medical_information</span>
                          No patient currently consulting inside the cabin
                        </div>
                      )}
                    </div>

                    {/* SECTION 2: CALLED PATIENT */}
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-blue-600 text-sm">
                            notifications_active
                          </span>
                          <span className="text-xs font-bold font-black uppercase tracking-wider text-blue-800">
                            Called to Room
                          </span>
                        </div>

                        {called && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            Awaiting Entry
                          </span>
                        )}
                      </div>

                      {called ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-black text-blue-700">
                                #{called.token}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${getPriorityClasses(
                                  called.priority
                                )}`}
                              >
                                {called.priority}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-base">
                              {called.patient_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Final Score: <strong className="text-slate-800">{called.final_score}</strong> (Priority {called.priority_score} + Bonus {called.waiting_bonus})
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSkip(called.qid)}
                              disabled={actionLoading}
                              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm flex items-center gap-1 transition-all"
                              title="Skip patient if no-show"
                            >
                              <span className="material-symbols-outlined text-base">skip_next</span>
                              Skip
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2.5 text-center text-slate-400 text-xs font-medium">
                          No patient currently called to the room
                        </div>
                      )}
                    </div>

                    {/* SECTION 3: WAITING QUEUE (DYNAMIC AGING ORDER) */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold font-black uppercase tracking-wider text-slate-700">
                            Waiting Queue
                          </h4>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {waitingList.length}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          Sorted by: Final Score (Priority + Aging Bonus)
                        </span>
                      </div>

                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {waitingList.map((item, idx) => (
                          <div
                            key={item.qid || `${item.vid}_${item.token}`}
                            className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                              String(item.priority).toLowerCase() === "emergency"
                                ? "bg-red-50/40 border-red-200 ring-1 ring-red-400/20"
                                : "bg-slate-50/80 border-slate-200 hover:bg-white"
                            }`}
                          >
                            <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1">
                              <div className="shrink-0 flex flex-col items-center">
                                <span className="text-[10px] font-bold font-black uppercase tracking-wider text-slate-400">
                                  Pos #{idx + 1}
                                </span>
                                <span className="px-2.5 py-1 font-bold rounded-xl bg-white border border-slate-200 text-sm font-black text-slate-900 shadow-sm mt-0.5">
                                  #{item.token}
                                </span>
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold text-sm text-slate-900 truncate">
                                  {item.patient_name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span
                                    className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${getPriorityClasses(
                                      item.priority
                                    )}`}
                                  > 
                                    {item.priority}
                                  </span>
                                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                    Score: {item.final_score}
                                  </span>
                                  {item.waiting_bonus > 0 && (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title="Aging bonus awarded for waiting time">
                                      +{item.waiting_bonus} aging
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="col-span-3 flex shrink-0 items-center justify-end gap-3 sm:col-span-1">
                              <div className="text-right">
                                <span className="text-xs font-extrabold text-emerald-700 block">
                                  {getElapsedWaitMinutes(item.created_at, currentTime)}m waiting
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600 block">
                                  +5 bonus in {10 - (getElapsedWaitMinutes(item.created_at, currentTime) % 10)}m
                                </span>
                                <span className="text-xs font-extrabold text-slate-800 block">
                                  ~{item.estimated_wait_time} min
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold block">
                                  est. wait
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openPatientEditor(item)}
                                  disabled={actionLoading || editSaving}
                                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                                  title="Edit waiting patient details"
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSkip(item.qid)}
                                  disabled={actionLoading}
                                  className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-400 hover:text-slate-700 transition"
                                  title="Skip this patient"
                                >
                                  <span className="material-symbols-outlined text-base">close</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {waitingList.length === 0 && (
                          <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl">
                            <span className="material-symbols-outlined text-3xl text-slate-300">
                              hourglass_empty
                            </span>
                            <p className="text-xs font-semibold text-slate-400 mt-1">
                              No waiting patients in this doctor's queue
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 4: SKIPPED PATIENTS / RECALL */}
                    {skippedList.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => toggleSkippedList(doc.did)}
                          className="flex items-center justify-between w-full text-xs font-bold text-slate-500 hover:text-slate-800 py-1"
                        >
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">history</span>
                            Skipped Patients ({skippedList.length})
                          </span>
                          <span className="material-symbols-outlined text-sm">
                            {showSkippedFor[doc.did] ? "expand_less" : "expand_more"}
                          </span>
                        </button>

                        {showSkippedFor[doc.did] && (
                          <div className="space-y-1.5 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            {skippedList.map((sk) => (
                              <div
                                key={sk.qid}
                                className="flex items-center justify-between text-xs p-1.5 bg-white rounded-lg border border-slate-200"
                              >
                                <span className="font-bold text-slate-800">
                                  #{sk.token} • {sk.patient_name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRecall(sk.qid)}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md text-[11px] font-bold border border-blue-200 transition-all flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-xs">restart_alt</span>
                                  Recall
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {boardData.length === 0 && (
              <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
                <span className="material-symbols-outlined text-5xl text-slate-300">
                  person_off
                </span>
                <h3 className="font-bold text-slate-700 text-lg mt-3">
                  No active doctors in {selectedDepartment === "All" ? "any department" : selectedDepartment}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Activate doctors or choose another department filter.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {editingPatient && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form
            onSubmit={handlePatientEditSubmit}
            className="w-full max-w-lg space-y-4 rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Edit Patient</h2>
                <p className="text-xs text-slate-500">Update details while the patient is waiting.</p>
              </div>
              <button type="button" onClick={closePatientEditor} disabled={editSaving} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["name", "Name", "text"],
                ["contact", "Contact", "text"],
                ["email", "Email", "email"],
                ["address", "Address", "text"],
                ["dob", "Date of Birth", "date"],
                ["age", "Age", "number"],
              ].map(([field, label, type]) => (
                <label key={field} className="text-xs font-bold text-slate-600">
                  {label}
                  <input
                    required
                    type={type}
                    value={editForm[field]}
                    onChange={(event) => setEditForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              ))}
                <label className="text-xs font-bold text-slate-600 sm:col-span-2">
                  Symptom
                  <GlassSelect
                    required
                    value={editForm.symptom_sid}
                    onChange={(event) => setEditForm((current) => ({ ...current, symptom_sid: event.target.value }))}
                    placeholder="Select symptom"
                    ariaLabel="Symptom"
                  >
                    <option value="">Select symptom</option>
                    {symptoms.map((symptom) => (
                      <option key={symptom.sid} value={symptom.sid}>
                        {symptom.symptom_name}
                      </option>
                    ))}
                  </GlassSelect>
                </label>
              <label className="text-xs font-bold text-slate-600">
                Gender
                <GlassSelect
                  required
                  value={editForm.gender}
                  onChange={(event) => setEditForm((current) => ({ ...current, gender: event.target.value }))}
                  placeholder="Select gender"
                  ariaLabel="Gender"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </GlassSelect>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={closePatientEditor} disabled={editSaving} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">
                Cancel
              </button>
              <button type="submit" disabled={editSaving} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </ReceptionistLayout>
  );
}
