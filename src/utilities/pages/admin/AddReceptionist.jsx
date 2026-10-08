// ============================================================
//  AddReceptionist.jsx  â€“  Add New Receptionist Page Component
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import GlassSelect from '../../components/controls/GlassSelect';
import GlassDatePicker from '../../components/controls/GlassDatePicker';
import { getAuthHeaders } from '../../auth';
import '../../style/admin/AddReceptionist.css';
// import '../../style/admin/AddDoctor.css';


function AddReceptionist() {
  const navigate = useNavigate();

  // ---------- Form State ----------
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    email: "",
    contact: "",
    username: "",
    password: "",
    shift: "morning",
    status: "Active",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleReset = () => {
    setFormData({
      name: "",
      dob: "",
      gender: "",
      email: "",
      contact: "",
      username: "",
      password: "",
      shift: "morning",
      status: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/receptionist", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json().catch(() => ({}));
      console.log(data);

      if (!response.ok) {
        const detail = Array.isArray(data.detail)
          ? data.detail.map((item) => item.msg).join("\n")
          : data.detail || data.message || "Failed to add receptionist.";
        alert(detail);
        return;
      }

      if (data.email_sent === true) {
        alert(
          "Receptionist added successfully.\n\n" +
          "Login credentials have been sent to the receptionist's email."
        );
      } else {
        alert(
          "Receptionist added successfully.\n\n" +
          "However, the credential email could not be sent."
        );
      }

      navigate("/admin/receptionists");
    } catch (error) {
      console.error("Error adding receptionist:", error);
      alert(error.message || "Unable to connect to the backend. Please ensure the API server is running.");
    }
  };

  return (
    <AdminLayout>
      <div className="add-receptionist-page">

        {/* ---------- Breadcrumb ---------- */}
        <nav className="add-receptionist-breadcrumb">
          <a href="#personnel">Personnel</a>
          <span className="material-symbols-outlined">chevron_right</span>
          <a href="#receptionists" onClick={(e) => { e.preventDefault(); navigate('/admin/receptionists'); }}>Receptionists</a>
          <span className="material-symbols-outlined">chevron_right</span>
          <span className="add-receptionist-breadcrumb__active">Add Receptionist</span>
        </nav>

        {/* ---------- Header with Actions ---------- */}
        <div className="add-receptionist-header">
          <div>
            <h1 className="add-receptionist-header__title">Add New Receptionist</h1>
            <p className="add-receptionist-header__desc">
              Create a new staff profile and account access.
            </p>
          </div>
          <div className="add-receptionist-header__actions">
            <button
              type="button"
              className="add-receptionist-header__cancel-btn"
              onClick={() => navigate('/admin/receptionists')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="add-receptionist-header__reset-btn"
              onClick={handleReset}
            >
              <span className="material-symbols-outlined">restart_alt</span>
              <span>Reset</span>
            </button>
            <button
              type="submit"
              form="add-receptionist-form"
              className="add-receptionist-header__save-btn"
            >
              <span className="material-symbols-outlined">save</span>
              <span>Save Receptionist</span>
            </button>
          </div>
        </div>

        {/* ---------- Form Grid ---------- */}
        <form
          id="add-receptionist-form"
          className="add-receptionist-grid"
          onSubmit={handleSubmit}
        >

          {/* ========== LEFT COLUMN ========== */}
          <div className="add-receptionist-main-col">

            {/* --- Personal Information Card --- */}
            <div className="ar-form-card">
              <div className="ar-form-card__accent ar-form-card__accent--primary" />
              <div className="ar-form-card__header">
                <div className="ar-form-card__icon-badge ar-form-card__icon-badge--primary">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h2 className="ar-form-card__title">Personal Information</h2>
              </div>

              <div className="ar-form-fields">
                {/* Full Name */}
                <div className="ar-input-group ar-field-full">
                  <label className="ar-input-group__label">
                    Full Name <span className="ar-required">*</span>
                  </label>
                  <div className="ar-input-group__control-wrap">
                    <span className="material-symbols-outlined">badge</span>
                    <input
                      className="ar-input-group__control"
                      name="name"
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Date of Birth (Modern Custom Date Picker) */}
                <GlassDatePicker
                  label="Date of Birth"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />

                {/* Gender (Modern Custom Dropdown) */}
                <GlassSelect
                  label="Gender"
                  name="gender"
                  placeholder="Select gender"
                  value={formData.gender}
                  onChange={handleChange}
                  icon="wc"
                  options={[
                    { value: 'female', label: 'Female' },
                    { value: 'male', label: 'Male' }
                  ]}
                />

                {/* Email Address */}
                <div className="ar-input-group">
                  <label className="ar-input-group__label">
                    Email Address <span className="ar-required">*</span>
                  </label>
                  <div className="ar-input-group__control-wrap">
                    <span className="material-symbols-outlined">mail</span>
                    <input
                      className="ar-input-group__control"
                      name="email"
                      type="email"
                      placeholder="sarah.j@clinic.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div className="ar-input-group">
                  <label className="ar-input-group__label">Contact Number</label>
                  <div className="ar-input-group__control-wrap">
                    <span className="material-symbols-outlined">phone</span>
                    <input
                      className="ar-input-group__control"
                      name="contact"
                      type="tel"
                      placeholder="00000-00000"
                      value={formData.contact}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- Account Access Card --- */}
            <div className="ar-form-card">
              <div className="ar-form-card__accent ar-form-card__accent--secondary" />
              <div className="ar-form-card__header">
                <div className="ar-form-card__icon-badge ar-form-card__icon-badge--secondary">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <h2 className="ar-form-card__title">Account Access</h2>
              </div>

              <div className="ar-form-fields">
                {/* Username */}
                <div className="ar-input-group">
                  <label className="ar-input-group__label">
                    Username <span className="ar-required">*</span>
                  </label>
                  <div className="ar-input-group__control-wrap">
                    <span className="material-symbols-outlined">account_circle</span>
                    <input
                      className="ar-input-group__control"
                      name="username"
                      type="text"
                      placeholder="sarah.jenkins"
                      required
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="ar-input-group">
                  <label className="ar-input-group__label">
                    Password <span className="ar-required">*</span>
                  </label>
                  <div className="ar-input-group__control-wrap">
                    <span className="material-symbols-outlined">key</span>
                    <input
                      className="ar-input-group__control"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      style={{ paddingRight: '48px' }}
                    />
                    <button
                      type="button"
                      className="ar-input-group__toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  <span className="ar-input-group__hint">Minimum 8 characters, alphanumeric.</span>
                </div>

                {/* Account Status Toggle */}
                <div className="ar-field-full">
                  <div className="ar-status-toggle">
                    <div>
                      <p className="ar-status-toggle__label">Account Status</p>
                      <p className="ar-status-toggle__desc">Enable or disable login access for this receptionist.</p>
                    </div>
                    <div className="ar-status-toggle__right">
                      <label className="ar-switch">
                        <input
                          type="checkbox"
                          name="status"
                          checked={formData.status}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              status: e.target.checked ? "Active" : "Inactive",
                            }))
                          }
                        />
                        <span className="ar-switch__slider" />
                      </label>
                      <span className="ar-status-toggle__text">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ========== RIGHT COLUMN ========== */}
          <div className="add-receptionist-side-col">

            {/* --- Employment Details Card --- */}
            <div className="ar-form-card">
              <div className="ar-form-card__accent ar-form-card__accent--tertiary" />
              <div className="ar-form-card__header">
                <div className="ar-form-card__icon-badge ar-form-card__icon-badge--tertiary">
                  <span className="material-symbols-outlined">work</span>
                </div>
                <h2 className="ar-form-card__title">Receptionist Details</h2>
              </div>

              <div className="ar-form-fields ar-form-fields--single">
                {/* Employee ID (disabled) */}
                <div className="ar-input-group">
                  <label className="ar-input-group__label">Receptionist ID</label>
                  <div className="ar-input-group__control-wrap ar-input-group__control-wrap--disabled">
                    <span className="material-symbols-outlined">tag</span>
                    <input
                      className="ar-input-group__control ar-input-group__control--disabled"
                      type="text"
                      value="REC-54321"
                      disabled
                    />
                  </div>
                  <span className="ar-input-group__hint">Auto-generated identifier.</span>
                </div>

                {/* Assigned Shift (Modern Custom Dropdown) */}
                <GlassSelect
                  label="Assigned Shift"
                  name="shift"
                  placeholder="Select Shift"
                  value={formData.shift}
                  onChange={handleChange}
                  icon="schedule"
                  options={[
                    { value: 'morning', label: 'Morning' },
                    { value: 'afternoon', label: 'Afternoon' },
                    { value: 'evening', label: 'Evening' },
                    { value: 'night', label: 'Night' },
                  ]}
                />

                {/* Created At (disabled) */}
                <div className="ar-input-group">
                  <label className="ar-input-group__label">Created At</label>
                  <div className="ar-input-group__control-wrap ar-input-group__control-wrap--disabled">
                    <span className="material-symbols-outlined">history</span>
                    <input
                      className="ar-input-group__control ar-input-group__control--disabled"
                      type="text"
                      value={currentTime.toLocaleString()}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </form>
      </div>
    </AdminLayout>
  );
}

export default AddReceptionist;
