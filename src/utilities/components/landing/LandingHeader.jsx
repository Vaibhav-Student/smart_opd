// ============================================================
//  LandingHeader.jsx – Modern & Glassmorphic Landing Header Component
// ============================================================

import React, { useState, useEffect } from 'react';

export default function LandingHeader({ onOpenLogin, onOpenBooking }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Handle scroll detection for glassmorphism header height & shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Track active section for navigation highlight
      const sections = ['home', 'features', 'technology', 'ai-intelligence', 'benefits'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Features', href: '#features', id: 'features' },
    { name: 'Technology', href: '#ai-intelligence', id: 'ai-intelligence' },
    { name: 'Coming Soon', href: '#technology', id: 'technology' },
    { name: 'Benefits', href: '#benefits', id: 'benefits' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'py-3 bg-white/85 backdrop-blur-xl shadow-lg border-b border-slate-200/60'
          : 'py-5 bg-white/60 backdrop-blur-md border-b border-transparent'
        }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">

        {/* Brand Logo & Tag */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-blue-600/25 rounded-xl blur-sm group-hover:bg-blue-600/40 transition-all"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-[1.5px] shadow-md group-hover:scale-105 transition-all">
                <div className="w-full h-full bg-slate-900 rounded-[10.5px] flex items-center justify-center overflow-hidden">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L4 6v5c0 5.25 3.4 10.15 8 11.5 4.6-1.35 8-6.25 8-11.5V6l-8-4z"
                      fill="#0284c7"
                      fillOpacity="0.25"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                    />
                    <path d="M12 7v10M7 12h10" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                    <path
                      d="M9 12l2 2.2 4-4.2"
                      stroke="#38bdf8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Medi<span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Q</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                Smart OPD
              </span>
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 p-1.5 rounded-2xl bg-slate-100/70 border border-slate-200/80 shadow-inner">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${isActive
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => onOpenLogin && onOpenLogin('login')}
            className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 active:translate-y-0"
          >
            <span className="material-symbols-outlined text-base">login</span>
            Portal Login
          </button>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 px-6 pb-6 pt-4 bg-white/95 backdrop-blur-2xl border-b border-slate-200 shadow-2xl animate-fadeIn space-y-4">
          {/* Status Badge Mobile */}
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>OPD Live Queue</span>
            </div>
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
              Online
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl text-sm font-bold flex items-center justify-between ${activeSection === link.id
                    ? 'bg-blue-50 text-blue-600 font-extrabold'
                    : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <span>{link.name}</span>
                <span className="material-symbols-outlined text-base text-slate-400">chevron_right</span>
              </a>
            ))}
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking && onOpenBooking('booking');
              }}
              className="w-full py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base text-blue-600">calendar_month</span>
              Book Appointment Token
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin && onOpenLogin('login');
              }}
              className="w-full py-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">login</span>
              Portal Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
