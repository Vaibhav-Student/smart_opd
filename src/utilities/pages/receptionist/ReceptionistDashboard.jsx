// ============================================================
//  ReceptionistDashboard.jsx  –  Receptionist Dashboard Page
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceptionistLayout from '../../components/receptionist/ReceptionistLayout';
import '../../style/receptionist/ReceptionistDashboard.css';
import { getAuthHeaders } from '../../auth';
import GlassSelect from '../../components/controls/GlassSelect';
import GlassDatePicker from '../../components/controls/GlassDatePicker';

// Display-only animated counter (no data logic changes).
function CountUp({ value, padStart = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(Number(value) || 0);
      return;
    }
    let raf;
    const target = Number(value) || 0;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 700);
      setDisplay(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const str = String(display);
  return <>{padStart > 0 ? str.padStart(padStart, '0') : str}</>;
}


const getWaitingDetails = (createdAt) => {
  if (!createdAt) return { waitingMinutes: 0, nextBonusIn: 10 };
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return { waitingMinutes: 0, nextBonusIn: 10 };

  const waitingMinutes = Math.max(0, Math.floor((Date.now() - createdTime) / 60000));
  return { waitingMinutes, nextBonusIn: 10 - (waitingMinutes % 10) };
};

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [priority, setPriority] = useState('Low');

  // Registration Form states
  const [patientName, setPatientName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState('');
  const [totalToday, setTotalToday] = useState(0);
  const [emergencyCases, setEmergencyCases] = useState(0);
  const [avgWaitTime, setAvgWaitTime] = useState(0);
  const [departmentsList, setDepartmentsList] = useState([
    'General Medicine', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology'
  ]);
  const [staffName, setStaffName] = useState('Virat Kohli');

  const [queueList, setQueueList] = useState([]);
  const dashboardRequestSequence = useRef(0);

  // Symptoms states
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [priorityScore, setPriorityScore] = useState(null);

  // Doctors & Smart Queue load balancing states
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  const fetchDashboardData = async () => {
    const requestId = ++dashboardRequestSequence.current;
    try {
      const [qRes, vRes, pRes, dRes, sRes, rRes] = await Promise.all([
        fetch("http://localhost:8000/queues"),
        fetch("http://localhost:8000/visits"),
        fetch("http://localhost:8000/patients"),
        fetch("http://localhost:8000/doctors"),
        fetch("http://localhost:8000/symptoms"),
        fetch("http://localhost:8000/receptionists")
      ]);

      const [qData, vData, pData, dData, sData, rData] = await Promise.all([
        qRes.json(),
        vRes.json(),
        pRes.json(),
        dRes.json(),
        sRes.json(),
        rRes.json()
      ]);

      if (requestId !== dashboardRequestSequence.current) return;

      const queues = Array.isArray(qData) ? qData : [];
      const visits = Array.isArray(vData) ? vData : [];
      const patients = Array.isArray(pData) ? pData : [];
      const doctors = Array.isArray(dData) ? dData : [];
      const symptomsData = Array.isArray(sData) ? sData : [];
      const receptionists = Array.isArray(rData) ? rData : [];

      setAllDoctors(doctors);

      const today = new Date();
      const localTodayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const isoTodayStr = today.toISOString().split("T")[0];

      const isToday = (value) => {
        if (!value) return false;
        const valStr = String(value).trim();
        if (valStr.startsWith(localTodayStr) || valStr.startsWith(isoTodayStr)) return true;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return false;
        return (
          (date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()) ||
          date.toISOString().split("T")[0] === isoTodayStr
        );
      };

      const visitsToday = visits.filter((v) => isToday(v.visit_date || v.create_at));

      const visitsMap = Object.fromEntries(visits.map((v) => [v.vid, v]));
      const patientsMap = Object.fromEntries(patients.map((p) => [p.pid, p]));
      const doctorsMap = Object.fromEntries(doctors.map((d) => [d.did, d]));
      const symptomsMap = Object.fromEntries(symptomsData.map((s) => [s.sid, s]));

      // Dashboard metrics are based only on today's real DB records.
      setTotalToday(visitsToday.length);

      const todayVisitIds = new Set(visitsToday.map((v) => v.vid));
      const todayQueues = queues.filter((q) => todayVisitIds.has(q.vid));

      const activeQueueStatuses = new Set(['waiting', 'called', 'serving', 'in consultation']);
      const waitValues = todayQueues
        .filter((q) => activeQueueStatuses.has(String(q.status || '').trim().toLowerCase()))
        .map((q) => Number(q.estimated_wait_time))
        .filter((value) => Number.isFinite(value) && value >= 0);

      setAvgWaitTime(
        waitValues.length
          ? Math.max(0, Math.round(waitValues.reduce((sum, value) => sum + value, 0) / waitValues.length))
          : 0
      );

      const emergencyCount = visitsToday.filter((v) => {
        const symptom = symptomsMap[v.sid];
        const priority = String(symptom?.priority || "").toLowerCase();
        return priority === "emergency";
      }).length;

      setEmergencyCases(emergencyCount);

      const doctorSpecs = doctors
        .filter((d) => String(d.status || "").toLowerCase() === "active")
        .map((d) => d.specialization)
        .filter(Boolean);
      const symptomSpecs = symptomsData
        .map((s) => s.specialization)
        .filter(Boolean);
      const specs = Array.from(new Set([...doctorSpecs, ...symptomSpecs])).sort();

      setDepartmentsList(specs);

      // Keep the selected department valid when doctors/departments change.
      setDepartment((current) => {
        if (current) return current;
        return "";
      });

      // Use the active receptionist returned by the API instead of a hardcoded name.
      const activeReceptionist =
        receptionists.find(
          (r) => String(r.status || "").toLowerCase() === "active"
        ) || receptionists[0];

      setStaffName(activeReceptionist?.name || "Receptionist");

      const rawLiveEntries = queues
        .map((q) => {
          const v = visitsMap[q.vid] || {};
          const p = patientsMap[v.pid] || {};
          const d = doctorsMap[v.did] || {};
          const s = symptomsMap[v.sid] || {};

          const rawStatus = String(q.status || v.status || "Waiting").trim().toLowerCase();
          if (
            rawStatus === "completed" ||
            rawStatus === "complete" ||
            rawStatus === "done" ||
            rawStatus === "cancelled" ||
            rawStatus === "canceled" ||
            rawStatus === "skipped"
          ) {
            return null;
          }

          const visitDate = v.visit_date || v.create_at || q.create_at;
          if (!isToday(visitDate)) return null;

          return {
            qid: q.qid,
            vid: q.vid,
            rawToken: v.token != null ? v.token : q.qid,
            token: v.token != null ? `#${v.token}` : `#${q.qid}`,
            name: p.name || "Unknown Patient",
            phone: p.contact || "",
            dept: d.specialization || s.specialization || "Unassigned",
            doctorName: d.name || "Unassigned",
            status: q.status || v.status || "Waiting",
            rawStatus,
            queuePos: q.queue_position,
            estWait: q.estimated_wait_time,
            priority: s.priority || "Low",
            priorityScore: q.priority_score ?? s.priority_score ?? 0,
            waitingBonus: q.waiting_bonus ?? 0,
            finalScore: q.final_score ?? q.priority_score ?? s.priority_score ?? 0,
            ...getWaitingDetails(q.create_at || v.create_at),
            age: p.age || 30,
            gender: p.gender || "Not specified",
            time: q.create_at || v.create_at
              ? new Date(q.create_at || v.create_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })
              : ""
          };
        })
        .filter(Boolean);

      // Order: Serving/Called first, then highest Final Score, then token/arrival
      rawLiveEntries.sort((a, b) => {
        const aActive = a.rawStatus === "serving" ? 2 : a.rawStatus === "called" ? 1 : 0;
        const bActive = b.rawStatus === "serving" ? 2 : b.rawStatus === "called" ? 1 : 0;
        if (aActive !== bActive) return bActive - aActive;
        const scoreDiff = (Number(b.finalScore) || 0) - (Number(a.finalScore) || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return (Number(a.rawToken) || 0) - (Number(b.rawToken) || 0);
      });

      // Deduplicate queue records on the dashboard
      const seenVisits = new Set();
      const seenTokens = new Set();
      const deduplicatedLive = [];

      for (const item of rawLiveEntries) {
        const vidKey = item.vid != null ? String(item.vid) : null;
        if (vidKey && seenVisits.has(vidKey)) continue;

        const tokenKey = item.token && item.doctorName ? `${item.doctorName}_${item.token}` : null;
        if (tokenKey && seenTokens.has(tokenKey)) continue;

        if (vidKey) seenVisits.add(vidKey);
        if (tokenKey) seenTokens.add(tokenKey);

        deduplicatedLive.push(item);
      }

      setQueueList(deduplicatedLive);
      setSymptoms(
        [...symptomsData].sort((a, b) =>
          String(a.symptom_name || "").localeCompare(String(b.symptom_name || ""))
        )
      );
    } catch (err) {
      if (requestId !== dashboardRequestSequence.current) return;
      console.error("Error loading receptionist dashboard:", err);
      setQueueList([]);
      setSymptoms([]);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh queue dynamically in the background every 8 seconds
    const interval = setInterval(fetchDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleDobChange = (e) => {
    const selectedDob = e.target.value;
    setDob(selectedDob);
    if (selectedDob) {
      const birthDate = new Date(selectedDob);
      const today = new Date();
      let calcAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calcAge--;
      }
      if (calcAge >= 0) {
        setAge(calcAge.toString());
      } else {
        setAge('0');
      }
    } else {
      setAge('');
    }
  };

  const handleSymptomChange = async (e) => {
    const value = e.target.value;
    setSelectedSymptom(value);

    const foundSymptom = symptoms.find((sym) => sym.symptom_name === value);

    if (!foundSymptom) {
      setPriorityScore(null);
      setDepartment('');
      setAvailableDoctors([]);
      setSelectedDoctorId('');
      return;
    }

    setPriorityScore(foundSymptom.priority_score);

    const dbPriority = String(foundSymptom.priority || '');
    const normalizedPriority =
      dbPriority.charAt(0).toUpperCase() + dbPriority.slice(1).toLowerCase();

    if (['Low', 'Medium', 'High', 'Emergency'].includes(normalizedPriority)) {
      setPriority(normalizedPriority);
    } else {
      setPriority(dbPriority);
    }

    // Department must come from the selected symptom.
    const symptomDepartment = String(foundSymptom.specialization || '').trim();
    setDepartment(symptomDepartment);

    if (!symptomDepartment) {
      setAvailableDoctors([]);
      setSelectedDoctorId('');
      return;
    }

    const matchesSpec = (docSpec, targetSpec) => {
      if (!docSpec || !targetSpec) return false;
      const s1 = String(docSpec).trim().toLowerCase();
      const s2 = String(targetSpec).trim().toLowerCase();
      if (s1 === s2 || s1.includes(s2) || s2.includes(s1)) return true;
      if (s1.slice(0, 5) === s2.slice(0, 5)) return true;
      return false;
    };

    let loadedDoctors = [];

    try {
      const response = await fetch(
        `http://localhost:8000/opd/doctors-queue/${encodeURIComponent(symptomDepartment)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          loadedDoctors = data;
        }
      }
    } catch (error) {
      console.error('Error loading doctors for department:', error);
    }

    // Fallback: If opd/doctors-queue returned empty or failed, use allDoctors from state
    if (loadedDoctors.length === 0 && allDoctors.length > 0) {
      const activeDocs = allDoctors.filter(
        (d) => String(d.status || '').toLowerCase() === 'active'
      );
      const matchedDocs = (activeDocs.length > 0 ? activeDocs : allDoctors).filter(
        (d) => matchesSpec(d.specialization, symptomDepartment)
      );
      const fallbackList =
        matchedDocs.length > 0
          ? matchedDocs
          : activeDocs.length > 0
          ? activeDocs
          : allDoctors;

      loadedDoctors = fallbackList.map((doc, idx) => ({
        did: doc.did,
        name: doc.name,
        specialization: doc.specialization,
        avg_time: doc.avg_time || 10,
        queue_count: 0,
        estimated_wait_time: 0,
        is_recommended: idx === 0,
      }));
    }

    setAvailableDoctors(loadedDoctors);

    // CRITICAL: Automatically select and display the recommended (or first) doctor
    const bestDoc = loadedDoctors.find((d) => d.is_recommended) || loadedDoctors[0];
    if (bestDoc) {
      setSelectedDoctorId(String(bestDoc.did));
    } else {
      setSelectedDoctorId('');
    }
  };

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    const name = patientName.trim();
    const phone = phoneNumber.trim();
    if (!name || !phone || !dob || !age || !address || !selectedSymptom) {
      alert("Please complete all required patient and symptom details.");
      return;
    }

    if (!department) {
      alert("No department is configured for the selected symptom.");
      return;
    }

    const patientDob = dob;
    const patientAge = parseInt(age);
    const patientAddress = address.trim();

    const foundSymptom = symptoms.find((sym) => sym.symptom_name === selectedSymptom);

    if (!foundSymptom) {
      alert("Please select a valid symptom from the database.");
      return;
    }

    const sid = foundSymptom.sid;

    try {
      const response = await fetch("http://localhost:8000/opd/register", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: name,
          dob: patientDob,
          age: patientAge,
          gender: gender,
          email: email,
          contact: phone,
          address: patientAddress,
          specialization: department,
          sid: sid,
          did: selectedDoctorId ? parseInt(selectedDoctorId) : null,
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.token) {
        if (resData.already_registered) {
          alert(resData.message || "Patient already has an active token today. Reprinting existing slip.");
        }
        if (resData.email_sent === false) {
          alert("Token created successfully, but the confirmation email could not be sent.");
        }
        const newEntry = {
          token: `#${resData.token}`,
          name: resData.patient_name || name,
          dob: patientDob,
          age: patientAge,
          gender: gender,
          phone: phone,
          email: email || 'patient@example.com',
          address: patientAddress,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: priority === 'Emergency' ? 'Token Printed' : 'Waiting',
          statusColor: priority === 'Emergency' ? 'blue' : 'green',
          dept: department.toUpperCase(),
          symptom: selectedSymptom,
          priorityScore: priorityScore,
          doctorName: resData.doctor_name,
          queuePos: resData.queue_position,
          estWait: resData.estimated_wait_time,
        };

        await fetchDashboardData();
        handleClearForm();

        // Refresh doctor queue load metrics
        fetch(`http://localhost:8000/opd/doctors-queue/${department}`)
          .then((res) => res.json())
          .then((data) => setAvailableDoctors(data))
          .catch(() => { });
      } else {
        alert(resData.message || "Failed to complete OPD registration.");
      }
    } catch (err) {
      console.error("Error during OPD registration:", err);
      alert("Error connecting to OPD registration server.");
    }
  };

  const handleClearForm = () => {
    setPatientName('');
    setDob('');
    setAge('');
    setGender('Male');
    setEmail('');
    setPhoneNumber('');
    setAddress('');
    setDepartment('');
    setPriority('Low');
    setSelectedSymptom('');
    setPriorityScore(null);
    setSelectedDoctorId('');
    setAvailableDoctors([]);
  };


  return (
    <ReceptionistLayout activeTab="Dashboard">
      <div className="receptionist-dashboard-container space-y-6 animate-fadeIn">
        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 — Registered Today */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overview-card-hover">
            <div className="relative flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Registered today
              </p>
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">person_add</span>
              </span>
            </div>
            <h4 className="text-3xl font-semibold font-black text-slate-900"><CountUp value={totalToday} /></h4>
          </div>

          {/* Card 2 — Emergency Cases */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overview-card-hover">
            <div className="relative flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Emergency cases
              </p>
              <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">e911_emergency</span>
                {emergencyCases > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white ring-2 ring-white">{emergencyCases > 9 ? '9+' : emergencyCases}</span>
                  </span>
                )}
              </span>
            </div>
            <h4 className="text-3xl font-semibold font-black text-slate-900"><CountUp value={emergencyCases} padStart={2} /></h4>
          </div>

          {/* Card 3 — Average Wait Time */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overview-card-hover">
            <div className="relative flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Avg. wait time
              </p>
              <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">pace</span>
              </span>
            </div>
            <h4 className="text-3xl font-semibold font-black text-slate-900">
              {avgWaitTime} <span className="text-lg font-semibold text-slate-500">min</span>
            </h4>
          </div>

          {/* Card 4 — Reception Station */}
          <div className="reception-station-card rounded-2xl p-6 border border-slate-200 shadow-sm relative overview-card-hover">
            <div className="relative flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-slate-400">
                Reception station
              </p>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                Open
              </span>
            </div>
            <h4 className="mt-2 text-xl font-semibold font-black text-slate-900">Main Reception</h4>
            <p className="mt-1 text-xs font-medium text-slate-500">Counter A-01 · {staffName}</p>
          </div>
        </div>

        {/* Form and Live Queue Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div id="patient-form" className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(11,28,48,0.06)]">
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-[#f3f7ff] to-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#004ac6] to-[#1d4ed8] text-white shadow-[0_8px_20px_rgba(0,74,198,0.35)]">
                    <span className="material-symbols-outlined text-2xl">how_to_reg</span>
                  </span>
                  <div>
                    <h3 className="font-headline-md text-xl font-bold tracking-tight text-slate-900">Patient Registration</h3>
                    <p className="mt-0.5 text-[13px] text-slate-500">
                      Register patient details to generate an instant OPD queue token.
                    </p>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-5 py-3 text-white sm:text-right">
                  <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-[#004ac6]"></div>
                  <div className="absolute -right-8 -top-50 h-24 w-24 rounded-full bg-[#004ac6]"></div>
                  <div className="absolute -left-8 -top-50 h-24 w-24 rounded-full bg-[#004ac6]"></div>
                  <div className="absolute -left-1 -top-50 h-24 w-24 rounded-full bg-[#004ac6]"></div>
                  <div className="absolute left-8 -top-50 h-24 w-24 rounded-full bg-[#004ac6]"></div>
                  <div className="absolute left-8 -top-10 h-24 w-24 rounded-full bg-[#004ac6]"></div>
                  <div className="absolute -left-8 -top-5 h-24 w-24 rounded-full bg-[#004ac6]"></div>
                  <span className="relative block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-200">Next OPD token</span>
                  <span className="relative font-headline-md text-2xl font-bold tracking-tight text-white">
                    {selectedDoctorId && availableDoctors.length > 0
                      ? `#${availableDoctors.find((d) => String(d.did) === String(selectedDoctorId))?.next_token ?? (totalToday + 101)}`
                      : '#000'}
                  </span>
                  <span className="relative block text-[10px] font-semibold text-slate-200">per-doctor daily sequence</span>
                </div>
              </div>

              <form onSubmit={handleGenerateToken} className="space-y-7 p-6 sm:p-7">
                {/* SECTION 1: PATIENT DEMOGRAPHICS */}
                <div className="space-y-5">
                  <h4 className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">1</span>
                    Patient demographic information
                    <span className="h-px flex-1 bg-slate-100"></span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Patient Full Name
                      </label>
                      <input
                        required
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium shadow-sm transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Mobile Number
                      </label>
                      <input
                        required
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium shadow-sm transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Date of Birth
                      </label>
                      <input type="date"
                        required
                        value={dob}
                        onChange={handleDobChange}
                        placeholder="Select birth date"
                        ariaLabel="Date of Birth"
                        className="w-full px-4 py-3 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold shadow-sm transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Age
                      </label>
                      <input
                        required
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Calculated from DOB"
                        className="w-full px-4 py-3 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold shadow-sm transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        ariaLabel="Gender"
                        className="w-full px-4 py-3 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold shadow-sm transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none"
                      >
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Email Address
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@gmail.com"
                        className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium shadow-sm transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Residential Address
                      </label>
                      <input
                        required
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House No, Area, City"
                        className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium shadow-sm transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: OPD CONSULTATION & ROUTING */}
                <div className="space-y-5 rounded-2xl border border-blue-100/70 bg-[#f8fbff] p-5 sm:p-6">
                  <h4 className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">2</span>
                    OPD consultation & doctor routing
                    <span className="h-px flex-1 bg-blue-100"></span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Select Symptom (Primary Medical Trigger)
                      </label>
                      <select
                        value={selectedSymptom}
                        onChange={handleSymptomChange}
                        ariaLabel="Select Symptom"
                        className="w-full px-4 py-3 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold shadow-sm transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none"
                      >
                        <option value="">Select Symptom</option>
                        {symptoms.map((sym) => (
                          <option key={sym.sid} value={sym.symptom_name}>
                            {sym.symptom_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase">
                          Priority Level & Score
                        </label>
                        {priorityScore !== null && (
                          <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            Score: {priorityScore}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-200/70 bg-white p-1.5 shadow-sm">
                        {['Low', 'Medium', 'High', 'Emergency'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`relative py-2.5 px-1 rounded-xl font-bold text-xs transition-all text-center ${priority === p
                              ? p === 'Emergency'
                                ? 'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_6px_16px_rgba(220,38,38,0.4)]'
                                : p === 'Medium'
                                  ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-[0_6px_16px_rgba(245,158,11,0.4)]'
                                  : p === 'Low'
                                    ? 'bg-gradient-to-b from-[#004ac6] to-[#1d4ed8] text-white shadow-[0_6px_16px_rgba(0,74,198,0.4)]'
                                    : 'bg-gradient-to-b from-yellow-500 to-yellow-600 text-white shadow-[0_6px_16px_rgba(202,138,4,0.4)]'
                              : 'text-slate-500 hover:bg-slate-100'
                              }`}
                            disabled
                          >
                            {p === 'Emergency' && priority === p && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3"> </span>
                            )}
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Specialization / Department
                      </label>
                      <GlassSelect
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        disabled
                        ariaLabel="Specialization / Department"
                      >
                        {!department && <option value="">Select symptom first</option>}
                        {department && !departmentsList.includes(department) && (
                          <option value={department}>{department}</option>
                        )}
                        {departmentsList.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </GlassSelect>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                        <span>Assigned Doctor ({department || 'Select symptom first'})</span>
                        {selectedDoctorId && availableDoctors.length > 0 && (
                          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Auto Assigned
                          </span>
                        )}
                      </label>
                      <GlassSelect
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        placeholder="Select symptom first"
                        ariaLabel="Assigned Doctor"
                        disabled={availableDoctors.length === 0}
                      >
                        {availableDoctors.length === 0 ? (
                          <option value="">
                            {selectedSymptom ? 'No doctor available for this department' : 'Select symptom first'}
                          </option>
                        ) : (
                          availableDoctors.map((doc) => (
                            <option key={doc.did} value={String(doc.did)}>
                              {doc.name} ({doc.specialization ? `${doc.specialization} • ` : ''}{doc.queue_count ?? 0} in queue • {doc.estimated_wait_time ?? 0} min wait){doc.is_recommended ? ' ⭐ Shortest Queue' : ''}
                            </option>
                          ))
                        )}
                      </GlassSelect>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <span className="material-symbols-outlined text-base text-emerald-500">verified_user</span>
                    Details are validated before token generation
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-lg">restart_alt</span>
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#004ac6] to-[#1d4ed8] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_26px_rgba(0,74,198,0.4)] transition-all hover:shadow-[0_14px_34px_rgba(0,74,198,0.5)] hover:brightness-110 active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-lg">confirmation_number</span>
                      Generate OPD Token
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(11,28,48,0.06)] lg:sticky lg:top-24">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-[#f3f7ff] to-white p-5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
                    <span className="material-symbols-outlined text-lg">live_tv</span>
                    <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"></span>
                    </span>
                  </span>
                  <div>
                    <h4 className="text-[15px] font-bold tracking-tight text-slate-900">
                      Live Queue
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">{queueList.length}</span>
                    </h4>
                    <p className="text-[11px] font-medium text-slate-400">Auto-syncs every 8s</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchDashboardData}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:rotate-90 hover:border-primary/40 hover:text-primary"
                  title="Refresh Queue"
                >
                  <span className="material-symbols-outlined text-lg">sync</span>
                </button>
              </div>
              <div className="max-h-[460px] space-y-2.5 overflow-y-auto p-4">
                {queueList.map((item, idx) => {
                  const isEmergency = item.priority === 'Emergency';
                  const isHigh = item.priority === 'High';
                  const isMedium = item.priority === 'Medium';
                  return (
                    <div
                      key={item.qid || idx}
                      className={`flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all hover:shadow-md ${
                        isEmergency
                          ? 'border-red-300 bg-gradient-to-r from-red-50 to-white shadow-[0_6px_20px_rgba(220,38,38,0.12)] ring-1 ring-red-200'
                          : isHigh
                            ? 'border-amber-200 bg-gradient-to-r from-amber-50/70 to-white'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/60'
                        }`}
                    >
                      <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white shadow-md ${
                        isEmergency ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-[#004ac6] to-[#1d4ed8]'
                      }`}>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-80">Token</span>
                        <span className="text-[15px] font-bold leading-none">{item.token}</span>
                        <span className="mt-0.5 text-[8px] font-semibold opacity-80">#{item.queuePos || idx + 1}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <h5 className="truncate text-sm font-bold text-slate-900">
                            {item.name}
                          </h5>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            isEmergency
                              ? 'bg-red-600 text-white'
                              : isHigh
                                ? 'bg-amber-500 text-white'
                                : isMedium
                                  ? 'bg-yellow-400 text-yellow-950'
                                  : 'bg-blue-100 text-blue-700'
                            }`}>
                            {item.priority || 'Low'}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{item.dept} • {item.doctorName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] font-semibold">
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {item.estWait ?? 0}m est.
                          </span>
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <span className="material-symbols-outlined text-[13px]">hourglass_top</span>
                            {item.waitingMinutes}m waiting
                          </span>
                          <span className="text-slate-400">{item.time}</span>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        item.rawStatus === 'serving' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status || 'Waiting'}
                      </span>
                    </div>
                  );
                })}
                {queueList.length === 0 && (
                  <div className="flex flex-col items-center px-4 py-10 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#e8efff] to-[#e6faf6] text-primary">
                      <span className="material-symbols-outlined text-3xl">event_available</span>
                    </span>
                    <p className="mt-4 text-sm font-bold text-slate-900">Queue is clear</p>
                    <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-slate-400">
                      No patients waiting right now. New tokens will appear here instantly.
                    </p>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100 bg-slate-50/60 p-3.5 text-center">
                <button
                  onClick={() => navigate('/receptionist/queue-board')}
                  className="group inline-flex items-center gap-1.5 text-xs font-bold text-primary transition-colors hover:text-[#003da3]"
                >
                  View real-time queue dashboard
                  <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ReceptionistLayout>
  );
}