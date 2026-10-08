import { useState } from 'react';
import LoginModal from '../login/LoginModal';
import LandingHeader from '../../components/landing/LandingHeader';
import HeroSection from '../../components/landing/HeroSection';
import FeaturesSection from '../../components/landing/FeaturesSection';
import AIIntelligenceSection from '../../components/landing/AIIntelligenceSection';
import TechSection from '../../components/landing/TechSection';
import BenefitsSection from '../../components/landing/BenefitsSection';
import LandingFooter from '../../components/landing/LandingFooter';
import '../../style/landing_page/LandingPage.css';

export default function LandingPage({ onLogin }) {
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  return (
    <div className="bg-surface font-body-md text-on-surface transition-colors duration-300 min-h-screen">
      {/* Header / Navbar */}
      <LandingHeader onOpenLogin={openModal} onOpenBooking={openModal} />

      {/* Main Content */}
      <main className="w-full bg-surface">
        <div className="flex flex-col w-full">
          {/* Hero Section */}
          <HeroSection onOpenBooking={openModal} onOpenLogin={openModal} />

          {/* Trusted By Section */}
          <section className="py-12 bg-surface border-y border-outline-variant/20">
            <div className="max-w-container_max mx-auto px-margin">
              <p className="text-center font-label-md text-label-md text-on-surface-variant uppercase tracking-[0.2em] mb-8 font-semibold">
                Designed for Modern Healthcare Institutions
              </p>
              <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="font-display-lg text-2xl font-bold tracking-tighter text-on-surface">APOLLO</span>
                <span className="font-display-lg text-2xl font-bold tracking-tighter text-on-surface italic">AIIMS</span>
                <span className="font-display-lg text-2xl font-bold tracking-tighter text-on-surface">FORTIS</span>
                <span className="font-display-lg text-2xl font-bold tracking-tighter text-on-surface">MAX HEALTHCARE</span>
                <span className="font-display-lg text-2xl font-bold tracking-tighter text-on-surface uppercase">Civil Hospital</span>
              </div>
            </div>
          </section>

          {/* Features Grid Section */}
          <FeaturesSection onOpenFeature={openModal} />

          {/* AI Intelligence Section */}
          <AIIntelligenceSection onOpenDemo={openModal} />

          {/* Coming Soon: AI Technology Deep Dive */}
          <TechSection />

          {/* Benefits Section */}
          <BenefitsSection />
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Login Modal */}
      <LoginModal
        isOpen={modalType === 'login'}
        onClose={closeModal}
        onLogin={(role, username, password) => {
          onLogin(role, username, password);
          closeModal();
        }}
      />

      {/* Booking / Demo Modal */}
      {modalType && modalType !== 'login' && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-outline-variant relative">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {modalType === 'booking' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary-fixed rounded-2xl text-primary">
                    <span className="material-symbols-outlined text-2xl">calendar_add_on</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-on-surface">Book Smart Appointment</h3>
                    <p className="text-sm text-on-surface-variant">AI-estimated quick booking</p>
                  </div>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('Appointment Request Submitted! Check your SMS for token confirmation.');
                    closeModal();
                  }}
                  className="space-y-4 mt-6"
                >
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Patient Full Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface uppercase mb-1">
                      Department
                    </label>
                    <select className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary focus:outline-none">
                      <option>General Medicine &amp; OPD</option>
                      <option>Cardiology</option>
                      <option>Pediatrics</option>
                      <option>Orthopedics</option>
                      <option>Neurology</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all mt-4"
                  >
                    Confirm &amp; Generate AI Token
                  </button>
                </form>
              </div>
            )}

            {(modalType === 'demo' || modalType === 'feature') && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mx-auto text-primary mb-4">
                  <span className="material-symbols-outlined text-3xl">smart_toy</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-2">Request Live System Demo</h3>
                <p className="text-on-surface-variant text-sm mb-6">
                  Experience how MediQueue transforms patient waiting times with AI predictions and real-time operational analytics.
                </p>
                <button onClick={closeModal}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:bg-primary-container transition-all">
                  Schedule Demo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
