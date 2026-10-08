// ============================================================
//  Receptionists.jsx  –  Receptionists Page Component
// ============================================================

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import GlassSelect from '../../components/controls/GlassSelect';
import GlassDatePicker from '../../components/controls/GlassDatePicker';
import '../../style/admin/Receptionists.css';

function getInitials(name) {
  if (!name) return 'RP';

  const initials = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'RP';
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

  const normalizedStatus = String(status).trim();
  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1).toLowerCase();
}

function getStatusClass(status) {
  const normalizedStatus = String(status || '').trim().toLowerCase();

  switch (normalizedStatus) {
    case 'active':
      return 'green';
    case 'break':
      return 'gray';
    case 'off':
    case 'inactive':
      return 'red';
    default:
      return 'gray';
  }
}

// ---------- Component ----------

function Receptionists() {
  const [receptionist, setRecetionist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState("All");
  const [selectedReceptionist, setSelectedReceptionist] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const shifts = ["All", "Morning", "Afternoon", "Evening", "Night"];
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/receptionists")
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setRecetionist(data);
      })
      .catch((err) => {
        console.log(err);
      })
  }, [])

  const filteredReceptionists = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return receptionist.filter((rec) => {
      const matchesSearch =
        !query ||
        [
          rec.name,
          rec.rid,
          rec.gender,
          rec.email,
          rec.contact,
          rec.username,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesShift =
        selectedShift === "All" || rec.shift === selectedShift;

      return matchesSearch && matchesShift;
    });
  }, [receptionist, searchTerm, selectedShift]);

  const totalReceptionists = receptionist.length;
  const activeReceptionists = receptionist.filter((rec) => String(rec.status || '').trim().toLowerCase() === 'active').length;
  const morningShiftReceptionists = receptionist.filter((rec) => String(rec.shift || '').toLowerCase() === 'morning').length;

  const handleStatusToggle = async (id, currentStatus) => {
    const normalizedCurrent = String(currentStatus || "").trim().toLowerCase();
    const newStatus = normalizedCurrent === "active" ? "inactive" : "active";

    setRecetionist(prev =>
      prev.map(rec =>
        (String(rec.rid) === String(id))
          ? { ...rec, status: newStatus }
          : rec
      )
    );

    if (newStatus === "inactive") {
      alert("Receptionist account has been set to inactive.");
    }

    try {
      const response = await fetch(`http://localhost:8000/receptionist/${id}/${newStatus}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        setRecetionist(prev =>
          prev.map(rec =>
            (String(rec.rid) === String(id))
              ? { ...rec, status: currentStatus }
              : rec
          )
        );
        console.error("Failed to update status. API returned:", response.status);
      }
    } catch (err) {
      // Revert on network error
      setRecetionist(prev =>
        prev.map(rec =>
          (String(rec.rid) === String(id))
            ? { ...rec, status: currentStatus }
            : rec
        )
      );
      console.error("Network error:", err);
    }
  };

  const openView = (rec) => {
    setSelectedReceptionist(rec);
    setModalMode('view');
    setModalError('');
  };

  const openEdit = (rec) => {
    setSelectedReceptionist(rec);
    setEditForm({
      name: rec.name || '',
      dob: rec.dob ? String(rec.dob).slice(0, 10) : '',
      gender: rec.gender || '',
      email: rec.email || '',
      contact: rec.contact || '',
      shift: rec.shift || '',
      status: rec.status || 'Active',
      username: rec.username || '',
      password: rec.password || ''
    });
    setModalMode('edit');
    setModalError('');
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalMode(null);
    setSelectedReceptionist(null);
    setEditForm(null);
    setModalError('');
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!selectedReceptionist || !editForm) return;

    const required = ['name', 'dob', 'gender', 'email', 'contact', 'shift'];
    const missing = required.some((field) => !String(editForm[field] || '').trim());

    if (missing) {
      setModalError('Please fill all required fields.');
      return;
    }

    setIsSaving(true);
    setModalError('');

    try {
      const response = await fetch(
        `http://localhost:8000/receptionist/${selectedReceptionist.rid}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm)
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Failed to update receptionist.');
      }

      const updated = {
        ...selectedReceptionist,
        ...editForm,
        rid: selectedReceptionist.rid
      };

      setRecetionist((prev) =>
        prev.map((rec) =>
          String(rec.rid) === String(selectedReceptionist.rid) ? updated : rec
        )
      );

      setSelectedReceptionist(updated);
      setModalMode('view');
    } catch (err) {
      setModalError(err.message || 'Failed to update receptionist.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="receptionists-page">

        {/* ============ HEADER ============ */}
        <div className="receptionists-header">
          <div>
            <h1 className="receptionists-header__title">Receptionists</h1>
            <p className="receptionists-header__description">
              Manage and monitor front-desk staff, shifts, and assignment status.
            </p>
          </div>
          <button className="receptionists-header__add-btn" onClick={() => navigate('/admin/add-receptionist')}>
            <span className="material-symbols-outlined">add</span>
            <span>Add Receptionist</span>
          </button>
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
              <span className="doctors-search-bar__dropdown-caption">Shift</span>
              <GlassSelect
                variant="bare"
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                ariaLabel="Filter receptionists by shift"
              >
                {shifts.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift === "All" ? "All Shifts" : shift}
                  </option>
                ))}
              </GlassSelect>
            </div>
          </div>
        </div>

        {/* ============ STATISTICS CARDS ============ */}
        <div className="receptionists-stats">

          {/* Card 1 – Total Receptionists */}
          <div className="stat-card">
            <div className="stat-card__blob stat-card__blob--blue" />
            <div className="stat-card__top">
              <div className="stat-card__icon stat-card__icon--blue">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <div className="stat-card__trend">
                <span className="material-symbols-outlined">trending_up</span>
                <span className="stat-card__trend-text">Live directory</span>
              </div>
            </div>
            <div className="stat-card__bottom">
              <h3 className="stat-card__label">Total Receptionists</h3>
              <p className="stat-card__value">{totalReceptionists}</p>
            </div>
          </div>

          {/* Card 2 – On Shift */}
          <div className="stat-card">
            <div className="stat-card__blob stat-card__blob--slate" />
            <div className="stat-card__top">
              <div className="stat-card__icon stat-card__icon--slate">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div className="stat-card__badge">
                <span className="stat-card__badge-text">{activeReceptionists} active</span>
              </div>
            </div>
            <div className="stat-card__bottom">
              <h3 className="stat-card__label">On Shift</h3>
              <p className="stat-card__value">
                {activeReceptionists}
                <span className="stat-card__value-sub">/ {totalReceptionists || 0}</span>
              </p>
            </div>
          </div>

          {/* Card 3 – Avg Response Time */}
          <div className="stat-card">
            <div className="stat-card__blob stat-card__blob--gray" />
            <div className="stat-card__top">
              <div className="stat-card__icon stat-card__icon--gray">
                <span className="material-symbols-outlined">timer</span>
              </div>
              <div className="stat-card__badge">
                <span className="stat-card__badge-text">{morningShiftReceptionists} morning</span>
              </div>
            </div>
            <div className="stat-card__bottom">
              <h3 className="stat-card__label">Morning Shift</h3>
              <p className="stat-card__value">
                {morningShiftReceptionists}
                <span className="stat-card__value-unit">staff</span>
              </p>
            </div>
          </div>
        </div>

        {/* ============ DIRECTORY TABLE ============ */}
        <div className="receptionists-table">
          <div className="receptionists-table__scroll">
            <table className="receptionists-table__table">
              <thead className="receptionists-table__head">
                <tr className="receptionists-table__header-row">
                  <th className="receptionists-table__header-cell">
                    <span>Name</span>
                    <span className="material-symbols-outlined receptionists-table__sort-icon">unfold_more</span>
                  </th>
                  <th className="receptionists-table__header-cell">Gender</th>
                  <th className="receptionists-table__header-cell">Contact</th>
                  <th className="receptionists-table__header-cell">Shift</th>
                  <th className="receptionists-table__header-cell">Status</th>
                  <th className="receptionists-table__header-cell receptionists-table__header-cell--right">Actions</th>
                </tr>
              </thead>
              <tbody className="receptionists-table__body">
                {!filteredReceptionists.length && (
                  <tr>
                    <td colSpan="7" className="receptionists-table__empty">No receptionists found.</td>
                  </tr>
                )}

                {filteredReceptionists.map((rec) => {
                  const color = getStatusClass(rec.status);

                  return (
                    <tr className="receptionists-table__row" key={rec.rid}>
                      <td className="receptionists-table__cell receptionists-table__profile-cell">
                        <div className="receptionists-table__profile">
                          <div className="receptionists-table__avatar-wrap">
                            <div className="receptionists-table__avatar--initials">{getInitials(rec.name)}</div>
                            <div className="receptionists-table__indicator">
                              <div className={`receptionists-table__indicator-dot receptionists-table__indicator-dot--${color}`} />
                            </div>
                          </div>
                          <div className="receptionists-table__profile-info">
                            <span className="receptionists-table__name">{rec.name}</span>
                            <span className="receptionists-table__id">ID: {rec.rid}</span>
                          </div>
                        </div>
                      </td>
                      <td className="receptionists-table__cell">
                        <span className="receptionists-table__text">{rec.gender || '-'}</span>
                      </td>
                      <td className="receptionists-table__cell">
                        <span className="receptionists-table__text">{rec.contact || '-'}</span>
                      </td>
                      <td className="receptionists-table__cell">
                        <div className="receptionists-table__dept-badge">
                          <span className="receptionists-table__dept-name">{rec.shift || '-'}</span>
                        </div>
                      </td>
                      <td className="receptionists-table__cell">
                        <div className="receptionists-status-control">
                          <span className={`receptionists-status-pill receptionists-status-pill--${color}`}>
                            <span className="receptionists-status-pill__dot" />
                            {formatStatus(rec.status)}
                          </span>
                          <label
                            className="receptionists-switch"
                            title={`Set ${rec.name} ${String(rec.status || '').trim().toLowerCase() === 'active' ? 'inactive' : 'active'}`}
                          >
                            <input
                              type="checkbox"
                              checked={String(rec.status || "").trim().toLowerCase() === "active"}
                              onChange={() => handleStatusToggle(rec.rid, rec.status)}
                              aria-label={`Set ${rec.name} ${String(rec.status || '').trim().toLowerCase() === 'active' ? 'inactive' : 'active'}`}
                            />
                            <span className="receptionists-switch__slider" />
                          </label>
                        </div>
                      </td>
                      <td className="receptionists-table__cell receptionists-table__cell--actions">
                        <div className="receptionists-table__actions">
                          <button
                            className="receptionists-table__action-btn"
                            title="View Details"
                            onClick={() => openView(rec)}
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button
                            className="receptionists-table__action-btn"
                            title="Edit Receptionist"
                            onClick={() => openEdit(rec)}
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
      </div>

      {modalMode && selectedReceptionist && (
        <div className="receptionist-modal-overlay" onMouseDown={closeModal}>
          <div className="receptionist-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="receptionist-modal__header">
              <div>
                <h2>{modalMode === 'view' ? 'Receptionist Details' : 'Edit Receptionist'}</h2>
                <p>ID: {selectedReceptionist.rid}</p>
              </div>
              <button type="button" className="receptionist-modal__close" onClick={closeModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {modalMode === 'view' ? (
              <div className="receptionist-modal__body">
                <div className="receptionist-modal__profile">
                  <div className="receptionist-modal__avatar">{getInitials(selectedReceptionist.name)}</div>
                  <div>
                    <h3>{selectedReceptionist.name || '-'}</h3>
                    <span>{formatStatus(selectedReceptionist.status)}</span>
                  </div>
                </div>

                <div className="receptionist-modal__grid">
                  <div><small>Name</small><strong>{selectedReceptionist.name || '-'}</strong></div>
                  <div><small>Receptionist ID</small><strong>{selectedReceptionist.rid || '-'}</strong></div>
                  <div><small>Date of Birth</small><strong>{selectedReceptionist.dob ? String(selectedReceptionist.dob).slice(0, 10) : '-'}</strong></div>
                  <div><small>Gender</small><strong>{selectedReceptionist.gender || '-'}</strong></div>
                  <div><small>Email</small><strong>{selectedReceptionist.email || '-'}</strong></div>
                  <div><small>Contact</small><strong>{selectedReceptionist.contact || '-'}</strong></div>
                  <div><small>Username</small><strong>{selectedReceptionist.username || '-'}</strong></div>
                  <div><small>Shift</small><strong>{selectedReceptionist.shift || '-'}</strong></div>
                  <div><small>Status</small><strong>{formatStatus(selectedReceptionist.status)}</strong></div>
                  <div><small>Created</small><strong>{formatDateTime(selectedReceptionist.create_at || selectedReceptionist.created_at)}</strong></div>
                </div>
              </div>
            ) : (
              <form className="receptionist-modal__body" onSubmit={handleEditSubmit}>
                {modalError && <div className="receptionist-modal__error">{modalError}</div>}

                <div className="receptionist-modal__form-grid">
                  <label>Name<input required value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} /></label>
                  <label>Date of Birth<GlassDatePicker required value={editForm.dob} onChange={(e) => setEditForm({...editForm, dob: e.target.value})} placeholder="Select birth date" ariaLabel="Date of Birth" /></label>
                  <label>Gender
                    <GlassSelect required value={editForm.gender} onChange={(e) => setEditForm({...editForm, gender: e.target.value})} placeholder="Select gender" ariaLabel="Gender">
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </GlassSelect>
                  </label>
                  <label>Email<input required type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} /></label>
                  <label>Contact<input required value={editForm.contact} onChange={(e) => setEditForm({...editForm, contact: e.target.value})} /></label>
                  <label>Shift
                    <GlassSelect required value={editForm.shift} onChange={(e) => setEditForm({...editForm, shift: e.target.value})} placeholder="Select shift" ariaLabel="Shift">
                      <option value="">Select shift</option>
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                    </GlassSelect>
                  </label>
                  <label>Status
                    <GlassSelect value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})} ariaLabel="Status">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </GlassSelect>
                  </label>
                </div>

                <div className="receptionist-modal__actions">
                  <button type="button" onClick={closeModal}>Cancel</button>
                  <button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Receptionists;