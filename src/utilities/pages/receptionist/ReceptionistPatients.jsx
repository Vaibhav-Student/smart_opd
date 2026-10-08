// ============================================================
//  ReceptionistPatients.jsx  –  Professional Patient DataTable Page
// ============================================================

import React, { useState, useEffect } from 'react';
import ReceptionistLayout from '../../components/receptionist/ReceptionistLayout';
import GlassSelect from '../../components/controls/GlassSelect';
import '../../style/receptionist/ReceptionistPatients.css';
import { getAuthHeaders } from '../../auth';

export default function ReceptionistPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // DataTable State Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('pid');
  const [sortOrder, setSortOrder] = useState('desc');

  // Detail Modal & Print Slip States
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [printingSlipPatient, setPrintingSlipPatient] = useState(null);

  const fetchPatients = () => {
    setLoading(true);
    fetch("http://localhost:8000/patients", { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPatients(data);
        }
      })
      .catch((err) => console.error("Error fetching patients:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Helper: Extract Patient Initials
  const getInitials = (name) => {
    if (!name) return 'PT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Sort Toggle Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const listToExport = filteredPatients.length > 0 ? filteredPatients : patients;
    if (listToExport.length === 0) {
      alert("No patient data available to export.");
      return;
    } 

    const headers = ["Patient ID", "Name", "Gender", "Age", "DOB", "Contact", "Email", "Address", "Registered By"];
    const csvRows = [
      headers.join(","),
      ...listToExport.map((p) => [
        p.pid,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        p.gender || '',
        p.age || '',
        p.dob || '',
        `"${p.contact || ''}"`,
        `"${p.email || ''}"`,
        `"${(p.address || '').replace(/"/g, '""')}"`,
        `"${(p.receptionist_name || 'Not recorded').replace(/"/g, '""')}"`
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `OPD_Patients_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Table Handler
  const handlePrintTable = () => {
    window.print();
  };

  // 1. Filter Patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.contact && p.contact.includes(searchQuery)) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.pid && p.pid.toString().includes(searchQuery));

    const matchesGender =
      genderFilter === 'All' ||
      (p.gender && p.gender.toLowerCase() === genderFilter.toLowerCase());

    return matchesSearch && matchesGender;
  });

  // 2. Sort Patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 3. Paginate Patients
  const totalEntries = sortedPatients.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const paginatedPatients = sortedPatients.slice(startIndex, endIndex);

  // Reset to Page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, genderFilter, entriesPerPage]);

  return (
    <ReceptionistLayout activeTab="Patients">
      <div className="receptionist-patients-container space-y-6 animate-fadeIn">

        {/* Print-Only Header for Full Table Printing */}
        <div className="opd-print-header">
          <h1 className="text-2xl font-black text-slate-900">SMART OPD MEDICAL CENTER</h1>
          <p className="text-sm font-bold text-slate-600">Master Patient Registry Report</p>
          <p className="text-xs text-slate-500">Generated on: {new Date().toLocaleString()} | Total Records: {patients.length}</p>
        </div>

        {/* Top Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 print:hidden">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">TOTAL REGISTERED</p>
              <h4 className="text-3xl font-black font-semibold text-slate-900">{patients.length}</h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">MALE PATIENTS</p>
              <h4 className="text-3xl font-black font-semibold text-slate-900">
                {patients.filter((p) => p.gender && p.gender.toLowerCase() === 'male').length}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">male</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">FEMALE PATIENTS</p>
              <h4 className="text-3xl font-black font-semibold text-slate-900">
                {patients.filter((p) => p.gender && p.gender.toLowerCase() === 'female').length}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">female</span>
            </div>
          </div>
        </div>

        {/* Main DataTables Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">

          {/* Header & Controls Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 print:hidden">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Patient Directory</h3>
              <p className="text-sm text-slate-500 mt-0.5">Real-time OPD master patient records &amp; demographic registry.</p>
            </div>

            {/* Toolbar Right Controls */}
            <div className="flex flex-wrap xl:flex-nowrap items-center gap-2">
              {/* CSV Export Button */}
              <button
                onClick={handleExportCSV}
                title="Export Entire Patient Data as CSV"
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Export CSV
              </button>

              {/* Print Table Button */}
              <button
                onClick={handlePrintTable}
                title="Print Entire Patient Directory Table"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print Table
              </button>

              {/* Gender Filter Pills */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-0.5 border border-slate-200/60 whitespace-nowrap">
                {['All', 'Male', 'Female'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenderFilter(g)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${genderFilter === g
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-48 lg:w-56">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, phone, ID..."
                  className="w-full pl-9 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-base">search</span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchPatients}
                title="Refresh Table"
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors flex items-center justify-center shrink-0"
              >
                <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>sync</span>
              </button>
            </div>
          </div>

          {/* DataTables Controls Row: Show Entries */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium print:hidden">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <GlassSelect
                inline
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                ariaLabel="Entries per page"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </GlassSelect>
              <span>entries per page</span>
            </div>

            <div className="hidden sm:block text-slate-400">
              Showing <span className="font-bold text-slate-700">{totalEntries > 0 ? startIndex + 1 : 0}</span> to{' '}
              <span className="font-bold text-slate-700">{endIndex}</span> of{' '}
              <span className="font-bold text-slate-700">{totalEntries}</span> records
            </div>
          </div>

          {/* Interactive DataTable */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl print:border-none">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th
                    onClick={() => handleSort('pid')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Patient ID</span>
                      <span className="material-symbols-outlined text-sm font-bold text-slate-400 print:hidden">
                        {sortField === 'pid' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Patient Base Details </span>
                      <span className="material-symbols-outlined text-sm text-slate-400 print:hidden">
                        {sortField === 'name' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('contact')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Mobile</span>
                      <span className="material-symbols-outlined text-sm text-slate-400 print:hidden">
                        {sortField === 'contact' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    className="py-4 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>Email</span>
                      <span className="material-symbols-outlined text-sm text-slate-400 print:hidden">
                        {sortField === 'email' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'swap_vert'}
                      </span>
                    </div>
                  </th>
                  <th className="py-4 px-4">Address</th>
                  <th className="py-4 px-4">Registered By</th>
                  <th className="py-4 px-4 text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedPatients.map((item) => {
                  const isFemale = item.gender && item.gender.toLowerCase() === 'female';
                  return (
                    <tr key={item.pid} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-4">
                        <span className="font-black font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/80 text-xs">
                          #PID-{item.pid}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm print:hidden ${isFemale ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                              }`}
                          >
                            {getInitials(item.name)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">
                              {item.name}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {item.age} yrs • 
                              {item.gender} • 
                              DOB: {item.dob}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-semibold text-xs">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-slate-400 text-sm print:hidden">call</span>
                          {item.contact}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-500 max-w-[160px] truncate">{item.email}</td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-500 max-w-[200px] truncate">{item.address}</td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-600 max-w-[180px] truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-slate-400 text-sm">badge</span>
                          {item.receptionist_name || 'Not recorded'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right print:hidden">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedPatient(item)}
                            className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                            title="View Full Profile"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            View
                          </button>
                          <button
                            onClick={() => setPrintingSlipPatient(item)}
                            className="px-2.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                            title="Print OPD Slip"
                          >
                            <span className="material-symbols-outlined text-sm">print</span>
                            Print Slip
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {paginatedPatients.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="material-symbols-outlined text-4xl text-slate-300">folder_open</span>
                        <p className="text-sm font-semibold">No matching patient records found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* DataTables Footer & Page Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 print:hidden">
            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-800">{totalEntries > 0 ? startIndex + 1 : 0}</span> to{' '}
              <span className="font-bold text-slate-800">{endIndex}</span> of{' '}
              <span className="font-bold text-slate-800">{totalEntries}</span> entries
              {searchQuery && ` (filtered from ${patients.length} total entries)`}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentPage === page
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        {/* PATIENT DETAIL MODAL DRAWER */}
        {selectedPatient && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn print:hidden">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6 relative animate-scaleUp">
              <button
                onClick={() => setSelectedPatient(null)}
                className="absolute right-6 top-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-md ${selectedPatient.gender && selectedPatient.gender.toLowerCase() === 'female'
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    }`}
                >
                  {getInitials(selectedPatient.name)}
                </div>
                <div>
                  <span className="text-xs font-black text-blue-600 uppercase tracking-wider">PATIENT PROFILE</span>
                  <h3 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h3>
                  <span className="text-xs text-slate-500 font-semibold">ID: #PID-{selectedPatient.pid}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase block">Mobile</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedPatient.contact}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase block">Gender &amp; Age</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedPatient.gender} • {selectedPatient.age} yrs
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase block">Date of Birth</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedPatient.dob}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase block">Email Address</span>
                  <span className="font-bold text-slate-800 text-sm truncate block">{selectedPatient.email}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase block">Residential Address</span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{selectedPatient.address}</p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const p = selectedPatient;
                    setSelectedPatient(null);
                    setPrintingSlipPatient(p);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Print Token Slip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRINTABLE OPD TOKEN SLIP MODAL */}
        {printingSlipPatient && (
          <div className="printable-slip-overlay fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn print:p-0 print:bg-white print:static">
            <div className="printable-slip-card bg-white rounded-3xl p-8 max-w-md w-full border-2 border-dashed border-slate-300 shadow-2xl space-y-5 relative print:shadow-none print:w-full print:border-2 print:border-dashed print:border-slate-800">
              <button
                onClick={() => setPrintingSlipPatient(null)}
                className="absolute right-6 top-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center print:hidden"
              >
                ✕
              </button>

              <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl mb-1 print:bg-black">
                  OPD
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">SMART OPD MEDICAL CENTER</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Outpatient Registration Ticket</p>
              </div>

              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-center space-y-1 print:bg-white print:border-slate-800">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">OPD TOKEN NUMBER</span>
                <div className="text-4xl font-black text-blue-600 print:text-black">#{printingSlipPatient.token || printingSlipPatient.pid + 100}</div>
                <span className="text-xs font-bold text-slate-600 block pt-1">Status: Enqueued for Consultation</span>
              </div>

              <div className="space-y-2.5 text-xs font-medium">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-bold uppercase">Patient Name:</span>
                  <span className="font-extrabold text-slate-900">{printingSlipPatient.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-bold uppercase">Patient ID:</span>
                  <span className="font-extrabold text-slate-900">#PID-{printingSlipPatient.pid}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-bold uppercase">Age / Gender:</span>
                  <span className="font-extrabold text-slate-900">{printingSlipPatient.age} yrs / {printingSlipPatient.gender}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-bold uppercase">Mobile Contact:</span>
                  <span className="font-extrabold text-slate-900">{printingSlipPatient.contact}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-bold uppercase">Registration Date:</span>
                  <span className="font-extrabold text-slate-900">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-bold uppercase">Issued By:</span>
                  <span className="font-extrabold text-slate-900">Main Reception Desk</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-slate-400 font-semibold border-t border-slate-200">
                *** Please retain this slip ticket until your token is called ***
              </div>

              <div className="pt-2 flex justify-end gap-3 print:hidden">
                <button
                  onClick={() => setPrintingSlipPatient(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Print Slip Ticket
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ReceptionistLayout>
  );
}
