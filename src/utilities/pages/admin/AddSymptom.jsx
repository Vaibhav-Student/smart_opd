// ============================================================
//  AddSymptom.jsx  –  Add New Symptom Master Page Component
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import GlassSelect from '../../components/controls/GlassSelect';
import '../../style/admin/AddDoctor.css';

export default function AddSymptom() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    symptom_name: '',
    specialization: 'General Medicine',
    priority: 'Low',
    priority_score: 40,
    description: '',
    estimated_time: 0
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrioritySelect = (prioLevel) => {
    let defaultScore = 40;
    if (prioLevel === 'Emergency') defaultScore = 100;
    else if (prioLevel === 'High') defaultScore = 80;
    else if (prioLevel === 'Medium') defaultScore = 60;
    else defaultScore = 40;

    setFormData((prev) => ({
      ...prev,
      priority: prioLevel,
      priority_score: defaultScore
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.symptom_name.trim()) {
      alert("Please enter a valid symptom name.");
      return;
    }

    setLoading(true);

    const payload = {
      symptom_name: formData.symptom_name.trim(),
      specialization: formData.specialization,
      priority: formData.priority,
      priority_score: Number(formData.priority_score),
      is_active: "Active"
    };

    fetch("http://localhost:8000/symptoms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Symptom Master Added Successfully!");
        navigate('/admin/symptoms');
      })
      .catch((err) => {
        console.error("Error adding symptom:", err);
        alert(`Failed to add symptom: ${err.message}`);
      })
      .finally(() => setLoading(false));
  };

  const isEmerg = formData.priority === 'Emergency';
  const isHigh = formData.priority === 'High';

  return (
    <AdminLayout>
      <div className="add-doctor-page animate-fadeIn">
        {/* Breadcrumb */}
        <div className="add-doctor-breadcrumb">
          <span>Clinical Master</span>
          <span className="material-symbols-outlined">chevron_right</span>
          <span onClick={() => navigate('/admin/symptoms')} style={{ cursor: 'pointer' }}>Symptoms</span>
          <span className="material-symbols-outlined">chevron_right</span>
          <span className="add-doctor-breadcrumb__active">Add Symptom</span>
        </div>

        {/* Header */}
        <div className="add-doctor-header">
          <h1 className="add-doctor-header__title">Add New Symptom Master</h1>
          {/* <p className="add-doctor-header__desc">
            Define OPD clinical symptoms, associate department specialization auto-routing, and configure triage priority scoring.
          </p> */}
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSubmit} className="add-doctor-grid">

          {/* LEFT COLUMN: Main Form Inputs */}
          <div className="add-doctor-main-col space-y-6">

            {/* --- Basic Information Card --- */}
            <div className="form-card">
              <div className="form-card__accent" />
              <div className="form-card__header">
                <div className="form-card__icon-badge">
                  <span className="material-symbols-outlined">coronavirus</span>
                </div>
                <div>
                  <h2 className="form-card__title">Symptom &amp; Specialization Details</h2>
                  <p className="form-card__subtitle">Primary clinical symptom identification and specialization mapping</p>
                </div>
              </div>

              <div className="form-grid-2">
                {/* Symptom Name */}
                <div className="form-input-group form-col-full">
                  <label className="form-input-group__label">
                    Symptom Name <span className="required-star">*</span>
                  </label>
                  <input
                    className="form-input-group__control text-sm font-bold"
                    name="symptom_name"
                    type="text"
                    placeholder="e.g. Chest Pain &amp; Cardiac Distress"
                    required
                    value={formData.symptom_name}
                    onChange={handleChange}
                  />
                  <span className="material-symbols-outlined form-input-group__icon">healing</span>
                </div>

                {/* Department / Specialization Dropdown */}
                <div className="form-input-group form-col-full w-full pt-8">
                  <label className="form-input-group__label">
                    Specialization <span className="required-star">*</span>
                  </label>
                  <GlassSelect
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    ariaLabel="Specialization"
                    className="form-input-group__controltext-sm font-bold"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                  </GlassSelect>
                  {/* <span className="material-symbols-outlined form-input-group__icon">medical_services</span> */}
                </div>
              </div>
            </div>

            {/* --- Priority & Triage Scoring Card --- */}
            <div className="form-card">
              <div className="form-card__accent" />
              <div className="form-card__header">
                <div className="form-card__icon-badge" style={{ background: '#fef2f2', color: '#dc2626' }}>
                  <span className="material-symbols-outlined">network_intelligence_update</span>
                </div>
                <div>
                  <h2 className="form-card__title">Priority Level &amp; Algorithm Weight</h2>
                  <p className="form-card__subtitle">Configure priority tier and numerical scoring weight for shortest queue engine</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Priority Selector Pills */}
                <div>
                  <label className="form-input-group__label block mb-2">
                    Priority Tier Level <span className="required-star">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Emergency', 'High', 'Medium', 'Low'].map((prio) => {
                      const isSelected = formData.priority === prio;
                      return (
                        <button
                          key={prio}
                          type="button"
                          onClick={() => handlePrioritySelect(prio)}
                          className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 ${isSelected
                            ? prio === 'Emergency'
                              ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-400/30'
                              : prio === 'High'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-400/30'
                                : prio === 'Medium'
                                  ? 'bg-yellow-500 text-white border-yellow-500 shadow-md'
                                  : 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          {prio === 'Emergency' && '🚨'} {prio}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Score Slider */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Priority Score Weight (1 to 100)
                    </label>
                    <span className={`px-3 py-1 rounded-xl text-sm font-black ${isEmerg ? 'bg-red-100 text-red-700' : isHigh ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      Score: {formData.priority_score}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    name="priority_score"
                    value={formData.priority_score}
                    onChange={handleChange}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    Higher priority scores automatically boost queue ranking for critical emergency patients.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Card Preview & Actions */}
          <div className="add-doctor-side-col space-y-6">

            {/* Action Buttons */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {loading ? 'Saving...' : 'Save Symptom Master'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/symptoms')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors"
              >
                Cancel
              </button>
            </div>

          </div>

        </form>
      </div>
    </AdminLayout>
  );
}
