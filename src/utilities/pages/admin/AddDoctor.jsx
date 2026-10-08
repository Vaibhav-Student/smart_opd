// ============================================================
//  AddDoctor.jsx  â€“  Add New Doctor Page Component
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import GlassSelect from '../../components/controls/GlassSelect';
import GlassDatePicker from '../../components/controls/GlassDatePicker';
import '../../style/admin/AddDoctor.css';


function AddDoctor() {
  const navigate = useNavigate();

  // ---------- Form State ----------
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    email: "",
    contact: "",
    specialization: "",
    avg_time: "",
    username: "",
    password: "",
    status: "active",
  });

  const specializations = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Dermatology",
    "General Medicine",
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filtered = specializations.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

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
      specialization: "",
      avg_time: "",
      username: "",
      password: "",
      status: "",
    });
  };


  const handleSubmit = async (e) => {

    e.preventDefault();


    // Validate specialization
    if (!formData.specialization.trim()) {

      alert("Please select or enter a specialization.");

      return;
    }


    try {

      console.log("Sending doctor data:", formData);


      const response = await fetch(
        "http://localhost:8000/doctor",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(formData)
        }
      );


      const data = await response.json();


      console.log("API Response:", data);


      // ==========================================
      // ERROR
      // ==========================================

      if (!response.ok) {

        let message = "Failed to add doctor.";

        if (typeof data.detail === "string") {

          message = data.detail;

        } else if (typeof data.message === "string") {

          message = data.message;

        } else if (data.detail?.message) {

          message = data.detail.message;

        } else if (data.detail) {

          message = JSON.stringify(data.detail);

        }

        alert(message);

        return;
      }


      // ==========================================
      // SUCCESS
      // ==========================================

      console.log("Doctor Added:", data);


      if (data.email_sent === true) {

        alert(
          "Doctor added successfully.\n\n" +
          "Login credentials have been sent to the doctor's email."
        );

      } else {

        alert(
          "Doctor added successfully.\n\n" +
          "However, the credential email could not be sent."
        );

      }


      navigate("/admin/doctors");


    } catch (error) {

      console.error(
        "Error adding doctor:",
        error
      );

      alert(
        error.message ||
        "Something went wrong while adding the doctor."
      );

    }
  };



  return (
    <AdminLayout>
      <div className="add-doctor-page">
        {/* ---------- Breadcrumb ---------- */}
        <div className="add-doctor-breadcrumb">
          <span>Personnel</span>
          <span className="material-symbols-outlined">chevron_right</span>
          <span>Doctors</span>
          <span className="material-symbols-outlined">chevron_right</span>
          <span className="add-doctor-breadcrumb__active">Add Doctor</span>
        </div>

        {/* ---------- Header ---------- */}
        <div className="add-doctor-header">
          <h1 className="add-doctor-header__title">Add New Doctor</h1>
          <p className="add-doctor-header__desc">
            Enter the details below to register a new medical professional into the system.
            Ensure all mandatory fields are completed before saving.
          </p>
        </div>

        {/* ---------- Form Grid ---------- */}
        <form onSubmit={handleSubmit} className="add-doctor-grid">

          {/* LEFT COLUMN (Personal & Professional Info) */}
          <div className="add-doctor-main-col">

            {/* --- Personal Information Card --- */}
            <div className="form-card">
              <div className="form-card__accent" />
              <div className="form-card__header">
                <div className="form-card__icon-badge">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <h2 className="form-card__title">Personal Information</h2>
                  <p className="form-card__subtitle">Basic demographic details</p>
                </div>
              </div>

              <div className="form-grid-2">
                {/* Full Name */}
                <div className="form-input-group form-col-full">
                  <label className="form-input-group__label" htmlFor="fullName">
                    Full Name <span className="required-star">*</span>
                  </label>
                  <input
                    className="form-input-group__control"
                    id="fullName"
                    name="name"
                    type="text"
                    placeholder="Dr. Jane Smith"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <span className="material-symbols-outlined form-input-group__icon">badge</span>
                </div>

                {/* Date of Birth (Modern Custom Date Picker) */}
                <GlassDatePicker
                  label="Date of Birth"
                  required
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />

                {/* Gender (Modern Custom Dropdown) */}
                <GlassSelect
                  label="Gender"
                  required
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
                <div className="form-input-group">
                  <label className="form-input-group__label" htmlFor="email">
                    Email Address <span className="required-star">*</span>
                  </label>
                  <input
                    className="form-input-group__control"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="doctor@hospital.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <span className="material-symbols-outlined form-input-group__icon">mail</span>
                </div>

                {/* Contact Number */}
                <div className="form-input-group">
                  <label className="form-input-group__label" htmlFor="phone">
                    Contact Number <span className="required-star">*</span>
                  </label>
                  <input
                    className="form-input-group__control"
                    id="phone"
                    name="contact"
                    type="tel"
                    placeholder="00000-00000"
                    required
                    value={formData.contact}
                    onChange={handleChange}
                  />
                  <span className="material-symbols-outlined form-input-group__icon">call</span>
                </div>
              </div>
            </div>

            {/* --- Professional Information Card --- */}
            <div className="form-card">
              <div className="form-card__accent" />
              <div className="form-card__header">
                <div className="form-card__icon-badge">
                  <span className="material-symbols-outlined">medical_services</span>
                </div>
                <div>
                  <h2 className="form-card__title">Professional Information</h2>
                  <p className="form-card__subtitle">Clinical assignment details</p>
                </div>
              </div>

              <div className="form-input-group form-col-full">
                <label className="form-input-group__label">
                  Specialization
                  <span className="required-star">*</span>
                </label>
                <input type="text" className="form-input-group__control" placeholder="Search specialization..."
                  value={search} required
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    setFormData((prev) => ({ ...prev, specialization: value }));
                    setShowDropdown(true);
                  }} onFocus={() => setShowDropdown(true)} />
                <span className="material-symbols-outlined form-input-group__icon"> search </span>
                {showDropdown && filtered.length > 0 && (
                  <div className="dropdown"> {filtered.map((item) => (
                    <div key={item} className="dropdown-item" onClick={() => {
                      setSearch(item); setFormData((prev) => ({ ...prev, specialization: item }));
                      setShowDropdown(false);
                    }} > {item}
                    </div>
                  ))}
                  </div>
                )}

                {/* Avg Consultation Time */}
                <div className="form-input-group form-col-full mt-5">
                  <label className="form-input-group__label" htmlFor="consultTime">
                    Avg. Consultation Time (Mins) <span className="required-star">*</span>
                  </label>
                  <input
                    className="form-input-group__control"
                    id="consultTime"
                    name="avg_time"
                    type="number"
                    min="5"
                    max="120"
                    step="5"
                    required
                    value={formData.avg_time}
                    onChange={handleChange}
                  />
                  <span className="material-symbols-outlined form-input-group__icon">timer</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (System Record, Account Access, Actions) */}
          <div className="add-doctor-side-col">

            {/* --- System Record Card --- */}
            <div className="system-record-card">
              <div className="system-record-card__title">
                <span className="material-symbols-outlined">info</span>
                <span>System Record</span>
              </div>
              <div className="system-record-card__row">
                <span className="system-record-card__key">Doctor ID</span>
                <span className="system-record-card__val system-record-card__val--primary">DOC-12345</span>
              </div>
              <div className="system-record-card__row">
                <span className="system-record-card__key">Created At</span>
                <span className="system-record-card__val">{currentTime.toLocaleString()}</span>
              </div>
            </div>

            {/* --- Account Access Card --- */}
            <div className="form-card">
              <div className="form-card__accent form-card__accent--secondary" />
              <div className="form-card__header">
                <div className="form-card__icon-badge form-card__icon-badge--secondary">
                  <span className="material-symbols-outlined">manage_accounts</span>
                </div>
                <div>
                  <h2 className="form-card__title">Account Access</h2>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Username */}
                <div className="form-input-group">
                  <label className="form-input-group__label" htmlFor="username">
                    Username <span className="required-star">*</span>
                  </label>
                  <input
                    className="form-input-group__control"
                    id="username"
                    name="username"
                    type="text"
                    placeholder="janesmith"
                    required
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <span className="material-symbols-outlined form-input-group__icon">account_circle</span>
                </div>

                {/* Password */}
                <div className="form-input-group">
                  <label className="form-input-group__label" htmlFor="password">
                    Password <span className="required-star">*</span>
                  </label>
                  <input
                    className="form-input-group__control"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="form-input-group__icon-button"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Account Status Switch */}
                <div className="status-toggle-row">
                  <div>
                    <p className="status-toggle-title">Account Status</p>
                    <p className="status-toggle-sub">Active users can login</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status}
                      onChange={handleChange}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            </div>

            {/* --- Action Buttons --- */}
            <div className="form-actions-stack pb-8">
              <button type="submit" className="btn-save">
                <span className="material-symbols-outlined">save</span>
                <span>Save Doctor Profile</span>
              </button>
              <div className="form-actions-row">
                <button type="button" className="btn-reset" onClick={handleReset}>
                  <span className="material-symbols-outlined">restart_alt</span>
                  <span>Reset</span>
                </button>
                <button type="button" className="btn-cancel" onClick={() => navigate('/admin/doctors')}>
                  <span className="material-symbols-outlined">close</span>
                  <span>Cancel</span>
                </button>
              </div>
            </div>

          </div>

        </form>
      </div>
    </AdminLayout>
  );
}

export default AddDoctor;
