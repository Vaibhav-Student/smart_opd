// ============================================================
//  Doctors.js  –  Doctors Page Component
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import GlassSelect from '../../components/controls/GlassSelect';
import '../../style/admin/Doctors.css';


// ---------- Helper: Status badge color class ----------

function getStatusClass(status) {
  const normalizedStatus = String(status || '').toLowerCase();

  switch (normalizedStatus) {
    case 'active': return 'green';
    case 'available': return 'green';
    case 'break': return 'gray';
    case 'inactive': return 'gray';
    case 'surgery': return 'red';
    case 'busy': return 'red';
    default: return 'gray';
  }
}

function getInitials(name) {
  if (!name) return 'DR';

  const initials = name
    .replace('Dr.', '')
    .replace('Dr', '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'DR';
}

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTime(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatStatus(status) {
  if (!status) return 'Unknown';
  return String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase();
}


// ---------- Component ----------

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [modalType, setModalType] = useState(null); // "view" | "edit"
  const [editForm, setEditForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError('');

    fetch(`${API_BASE_URL}/doctors`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Unable to fetch doctors list.');
        }

        return res.json();
      })
      .then((data) => {
        setDoctors(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Something went wrong while loading doctors.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [API_BASE_URL]);

  const specialties = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor.specialization)
      .filter(Boolean);

    return ['All', ...Array.from(new Set(values))];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch = !query || [doctor.name, doctor.did, doctor.specialization, doctor.email, doctor.username]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

      const matchesSpecialty = selectedSpecialty === 'All' || String(doctor.specialization || '').toLowerCase() === selectedSpecialty.toLowerCase();

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchTerm, selectedSpecialty]);

  const activeDoctorsCount = doctors.filter((doctor) => String(doctor.status || '').toLowerCase() === 'active').length;

  const handleStatusToggle = async (id, currentStatus) => {
    const normalizedCurrent = String(currentStatus || "").toLowerCase();
    const newStatus = normalizedCurrent === "active" ? "inactive" : "active";

    if (newStatus === "inactive") {
      alert("Doctor account has been set to inactive.");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/doctor/${id}/${newStatus}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        setDoctors(prev =>
          prev.map(doc =>
            doc.did === id
              ? { ...doc, status: newStatus }
              : doc
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openViewModal = (doctor) => {
    setSelectedDoctor(doctor);
    setModalType('view');
    setSaveError('');
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setEditForm({
      name: doctor.name || '',
      dob: doctor.dob ? String(doctor.dob).slice(0, 10) : '',
      gender: doctor.gender || '',
      email: doctor.email || '',
      contact: doctor.contact || '',
      specialization: doctor.specialization || '',
      avg_time: doctor.avg_time ?? '',
      status: doctor.status || 'Active',
      // Keep these existing credentials unchanged. They are not exposed
      // as editable fields in the modal.
      username: doctor.username || '',
      password: doctor.password || '',
    });
    setSaveError('');
    setModalType('edit');
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalType(null);
    setSelectedDoctor(null);
    setEditForm(null);
    setSaveError('');
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateDoctor = async (event) => {
    event.preventDefault();

    if (!selectedDoctor || !editForm) return;

    const requiredFields = [
      ['name', 'Doctor name'],
      ['dob', 'Date of birth'],
      ['gender', 'Gender'],
      ['email', 'Email'],
      ['contact', 'Contact'],
      ['specialization', 'Specialization'],
      ['avg_time', 'Average consultation time'],
    ];

    const missing = requiredFields.find(([key]) => !String(editForm[key] ?? '').trim());

    if (missing) {
      setSaveError(`${missing[1]} is required.`);
      return;
    }

    const payload = {
      name: editForm.name.trim(),
      dob: editForm.dob,
      gender: editForm.gender,
      email: editForm.email.trim(),
      contact: editForm.contact.trim(),
      specialization: editForm.specialization.trim(),
      avg_time: Number(editForm.avg_time),
      username: editForm.username,
      password: editForm.password,
      status: editForm.status,
    };

    if (!Number.isFinite(payload.avg_time) || payload.avg_time <= 0) {
      setSaveError('Average consultation time must be greater than 0.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError('');

      const response = await fetch(`${API_BASE_URL}/doctor/${selectedDoctor.did}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        // Keep the HTTP status as the source of truth if the API returns no JSON.
      }

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Unable to update doctor.');
      }

      const updatedDoctor = {
        ...selectedDoctor,
        ...payload,
        avg_time: payload.avg_time,
      };

      setDoctors((prev) =>
        prev.map((doctor) =>
          doctor.did === selectedDoctor.did ? updatedDoctor : doctor
        )
      );

      setSelectedDoctor(updatedDoctor);
      setEditForm({
        ...payload,
        avg_time: String(payload.avg_time),
      });
      setModalType('view');
    } catch (err) {
      console.error('Doctor update error:', err);
      setSaveError(err.message || 'Something went wrong while updating the doctor.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const modalOpen = Boolean(modalType);
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalType]);

  return (
    <AdminLayout>
      <div className="doctors-page">

        {/* Decorative background blobs */}
        <div className="doctors-page__blob-1" />
        <div className="doctors-page__blob-2" />

        {/* ============ HEADER ============ */}
        <div className="doctors-header">
          <div>
            {/* Title */}
            <h1 className="doctors-header__title" style={{ fontSize: '28px', fontWeight: 600, color: '#0f172a' }}>
              Doctors
            </h1>
            <div>
              <span className="doctors-header__subtitle">
                Manage your hospital's doctors and their availability.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="doctors-header__actions">
            <button className="doctors-header__filter-btn">
              <span className="material-symbols-outlined">tune</span>
              <span>Filters</span>
            </button>
            <button className="doctors-header__add-btn" onClick={() => navigate('/admin/add-doctor')}>
              <span className="material-symbols-outlined">person_add</span>
              <span>Add Doctor</span>
            </button>
          </div>
        </div>

        {/* ============ SEARCH & FILTER BAR ============ */}
        <div className="doctors-search-bar">
          <div className="doctors-search-bar__input-wrap">
            <span className="material-symbols-outlined doctors-search-bar__icon">search</span>
            <input
              className="doctors-search-bar__input"
              type="text"
              placeholder="Search by name, ID, or specialty..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="doctors-search-bar__dropdown">
            <div className="doctors-search-bar__dropdown-labels">
              <span className="doctors-search-bar__dropdown-caption">Specialty</span>
              <GlassSelect
                variant="bare"
                value={selectedSpecialty}
                onChange={(event) => setSelectedSpecialty(event.target.value)}
                ariaLabel="Filter doctors by specialty"
              >
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty === 'All' ? 'All Specialization' : specialty}
                  </option>
                ))}
              </GlassSelect>
            </div>
          </div>
        </div>

        {/* ============ KEY METRICS ============ */}
        <div className="doctors-metrics">

          {/* Total Staff */}
          <div className="metric-card metric-card--white">
            <div className="metric-card__blob metric-card__blob--blue" />
            <div className="metric-card__top">
              <span className="metric-card__label">Total Staff</span>
              <div className="metric-card__icon-circle metric-card__icon-circle--blue">
                <span className="material-symbols-outlined">groups</span>
              </div>
            </div>
            <div className="metric-card__bottom">
              <span className="metric-card__value">{doctors.length}</span>
              <span className="metric-card__change">Live directory</span>
            </div>
          </div>

          {/* Active Shift */}
          <div className="metric-card metric-card--white">
            <div className="metric-card__blob metric-card__blob--teal" />
            <div className="metric-card__top">
              <span className="metric-card__label">Active Shift</span>
              <div className="metric-card__icon-circle metric-card__icon-circle--teal">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  pulse_alert
                </span>
              </div>
            </div>
            <div className="metric-card__bottom">
              <span className="metric-card__value">{activeDoctorsCount}</span>
              <span className="metric-card__sub">/ {doctors.length || 0} available</span>
            </div>
          </div>

          {/* Avg Patient Load (primary) */}
          <div className="metric-card metric-card--primary">
            {/* SVG background */}
            <svg className="metric-card__svg-bg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,100 C30,90 70,110 100,50 L100,100 Z" fill="currentColor" />
              <path d="M0,100 C40,80 60,120 100,30 L100,100 Z" fill="currentColor" opacity="0.5" />
            </svg>
            <div className="metric-card__top">
              <span className="metric-card__label">Avg Patient Load</span>
            </div>
            <div className="metric-card__bottom" style={{ flexDirection: 'column', gap: 0 }}>
              <span className="metric-card__value">
                {doctors.length
                  ? (doctors.reduce((sum, doctor) => sum + (Number(doctor.avg_time) || 0), 0) / doctors.length).toFixed(1)
                  : '0.0'}
              </span>
              <div className="metric-card__progress-row">
                <div className="metric-card__progress-bar">
                  <div className="metric-card__progress-fill">
                    <div className="metric-card__progress-glow" />
                  </div>
                </div>
                <span className="metric-card__progress-label">mins / patient</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============ DATA TABLE ============ */}
        <div className="doctors-table">
          <div className="doctors-table__scroll">
            <table className="doctors-table__table">
              <thead className="doctors-table__head">
                <tr className="doctors-table__header-row">
                  <th className="doctors-table__header-cell">
                    <span>Name</span>
                    <span className="material-symbols-outlined doctors-table__sort-icon">unfold_more</span>
                  </th>
                  <th className="doctors-table__header-cell">Specialization</th>
                  <th className="doctors-table__header-cell">Avg Time</th>
                  <th className="doctors-table__header-cell">Status</th>
                  <th className="doctors-table__header-cell doctors-table__header-cell--right">Actions</th>
                </tr>
              </thead>
              <tbody className="doctors-table__body">
                {isLoading && (
                  <tr>
                    <td colSpan="6" className="doctors-table__empty">Loading doctors...</td>
                  </tr>
                )}

                {!isLoading && error && (
                  <tr>
                    <td colSpan="6" className="doctors-table__empty doctors-table__empty--error">{error}</td>
                  </tr>
                )}

                {!isLoading && !error && filteredDoctors.length === 0 && (
                  <tr>
                    <td colSpan="6" className="doctors-table__empty">No doctors found.</td>
                  </tr>
                )}

                {!isLoading && !error && filteredDoctors.map((doctor) => {
                  const color = getStatusClass(doctor.status);

                  return (
                    <tr className="doctors-table__row" key={doctor.did}>
                      <td className="doctors-table__cell doctors-table__profile-cell">
                        <div className="doctors-table__profile">
                          <div className="doctors-table__avatar-wrap">
                            <div className="doctors-table__avatar--initials">
                              {getInitials(doctor.name)}
                            </div>
                            <div className="doctors-table__indicator">
                              <div className={`doctors-table__indicator-dot doctors-table__indicator-dot--${color}`} />
                            </div>
                          </div>
                          <div className="doctors-table__profile-info">
                            <span className="doctors-table__name">{doctor.name}</span>
                            <span className="doctors-table__id">ID: {doctor.did}</span>
                          </div>
                        </div>
                      </td>
                      <td className="doctors-table__cell">
                        <div className="doctors-table__department">
                          <div className="doctors-table__dept-badge">
                            <span className="doctors-table__dept-name">{doctor.specialization || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="doctors-table__cell">
                        <span className="doctors-table__text">{doctor.avg_time ? `${doctor.avg_time} min` : '-'}</span>
                      </td>
                      <td className="doctors-table__cell">
                        <div className="doctors-table__status">
                          <div className={`doctors-table__status-badge doctors-table__status-badge--${color}`}>
                            <div className="doctors-table__status-badge-dot" />
                            <span className="doctors-table__status-badge-text">{formatStatus(doctor.status)}</span>
                            {/* Toggle Switch */}
                            <label className="doctor-status-switch">
                              <input
                                type="checkbox"
                                checked={String(doctor.status || "").toLowerCase() === "active"}
                                onChange={() => handleStatusToggle(doctor.did, doctor.status)}
                              />
                              <span className="doctor-status-slider"></span>
                            </label>
                          </div>
                        </div>
                      </td>
                      <td className="doctors-table__cell doctors-table__cell--actions">
                        <div className="doctors-table__actions">
                          <button
                            type="button"
                            className="doctors-table__action-btn"
                            title="View Details"
                            onClick={() => openViewModal(doctor)}
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button
                            type="button"
                            className="doctors-table__action-btn"
                            title="Edit Doctor"
                            onClick={() => openEditModal(doctor)}
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>


        {/* ============ DOCTOR MODAL ============ */}
        {modalType && selectedDoctor && (
          <div
            className="doctor-modal-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(4px)',
              overflowY: 'auto',
            }}
          >
            <div
              className="doctor-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="doctor-modal-title"
              onMouseDown={(event) => event.stopPropagation()}
              style={{
                width: 'min(680px, 100%)',
                maxHeight: 'calc(100vh - 48px)',
                overflowY: 'auto',
                background: '#ffffff',
                borderRadius: '18px',
                boxShadow: '0 24px 70px rgba(15, 23, 42, 0.25)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '20px 24px',
                  background: '#fff',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {modalType === 'edit' ? 'Edit Doctor' : 'Doctor Details'}
                  </div>
                  <h2
                    id="doctor-modal-title"
                    style={{
                      margin: '4px 0 0',
                      fontSize: '22px',
                      lineHeight: 1.25,
                      color: '#0f172a',
                    }}
                  >
                    {selectedDoctor.name || 'Doctor'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  aria-label="Close"
                  style={{
                    width: '38px',
                    height: '38px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    background: '#fff',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#475569',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {modalType === 'view' && (
                <div style={{ padding: '24px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      background: '#f8fafc',
                      marginBottom: '20px',
                    }}
                  >
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        background: '#e0e7ff',
                        color: '#3730a3',
                        fontWeight: 800,
                        fontSize: '18px',
                      }}
                    >
                      {getInitials(selectedDoctor.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {selectedDoctor.name || '-'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '13px', marginTop: '3px' }}>
                        Doctor ID: {selectedDoctor.did ?? '-'} · {selectedDoctor.specialization || '-'}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: String(selectedDoctor.status).toLowerCase() === 'active' ? '#dcfce7' : '#f1f5f9',
                          color: String(selectedDoctor.status).toLowerCase() === 'active' ? '#166534' : '#475569',
                        }}
                      >
                        {formatStatus(selectedDoctor.status)}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '14px',
                    }}
                  >
                    {[
                      ['Specialization', selectedDoctor.specialization],
                      ['Gender', selectedDoctor.gender],
                      ['Date of Birth', formatDate(selectedDoctor.dob)],
                      ['Email', selectedDoctor.email],
                      ['Contact', selectedDoctor.contact],
                      ['Average Time', selectedDoctor.avg_time ? `${selectedDoctor.avg_time} min` : '-'],
                      ['Username', selectedDoctor.username],
                      ['Created', formatDateTime(selectedDoctor.create_at || selectedDoctor.created_at)],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        style={{
                          padding: '13px 14px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '5px',
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            color: '#0f172a',
                            fontSize: '14px',
                            fontWeight: 600,
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {value || '-'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '10px',
                      marginTop: '22px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => openEditModal(selectedDoctor)}
                      style={{
                        border: 0,
                        borderRadius: '10px',
                        padding: '10px 16px',
                        background: '#4f46e5',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Edit Doctor
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'edit' && editForm && (
                <form onSubmit={handleUpdateDoctor} style={{ padding: '24px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '16px',
                    }}
                  >
                    {[
                      { name: 'name', label: 'Doctor Name', type: 'text' },
                      { name: 'dob', label: 'Date of Birth', type: 'date' },
                      { name: 'email', label: 'Email', type: 'email' },
                      { name: 'contact', label: 'Contact', type: 'text' },
                      { name: 'specialization', label: 'Specialization', type: 'text' },
                      { name: 'avg_time', label: 'Average Time (minutes)', type: 'number', min: 1 },
                    ].map((field) => (
                      <label
                        key={field.name}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '7px',
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#334155',
                          }}
                        >
                          {field.label}
                        </span>
                        <input
                          name={field.name}
                          type={field.type}
                          min={field.min}
                          value={editForm[field.name]}
                          onChange={handleEditChange}
                          required
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            height: '42px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            padding: '0 12px',
                            outline: 'none',
                            color: '#0f172a',
                            background: '#fff',
                          }}
                        />
                      </label>
                    ))}

                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '7px',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                        Gender
                      </span>
                      <GlassSelect
                        name="gender"
                        value={editForm.gender}
                        onChange={handleEditChange}
                        required
                        ariaLabel="Gender"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </GlassSelect>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '7px',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                        Status
                      </span>
                      <GlassSelect
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange}
                        required
                        ariaLabel="Status"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </GlassSelect>
                    </label>
                  </div>

                  {saveError && (
                    <div
                      role="alert"
                      style={{
                        marginTop: '16px',
                        padding: '11px 13px',
                        borderRadius: '10px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        fontSize: '13px',
                      }}
                    >
                      {saveError}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '10px',
                      marginTop: '22px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={isSaving}
                      style={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '10px 16px',
                        background: '#fff',
                        color: '#334155',
                        fontWeight: 700,
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      style={{
                        border: 0,
                        borderRadius: '10px',
                        padding: '10px 18px',
                        background: isSaving ? '#94a3b8' : '#4f46e5',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ============ PAGINATION ============ */}
        {/* <div className="doctors-pagination">
          <span className="doctors-pagination__info">Showing 1-3 of 142 doctors</span>
          <div className="doctors-pagination__pages">
            <button className="doctors-pagination__btn doctors-pagination__btn--disabled">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="doctors-pagination__btn doctors-pagination__btn--active">1</button>
            <button className="doctors-pagination__btn">2</button>
            <button className="doctors-pagination__btn">3</button>
            <span className="doctors-pagination__ellipsis">...</span>
            <button className="doctors-pagination__btn">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div> */}
      </div>
    </AdminLayout>
  );
}

export default Doctors;
