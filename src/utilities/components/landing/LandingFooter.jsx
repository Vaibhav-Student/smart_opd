import React from 'react';

const platformLinks = [
  { label: 'Patient registration', href: '#features' },
  { label: 'Appointments and tokens', href: '#features' },
  { label: 'Live queue visibility', href: '#features' },
  { label: 'OPD analytics', href: '#features' },
];

const companyLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'ML roadmap', href: '#technology' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Contact us', href: 'mailto:support@mediqueue.io' },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-12 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr] lg:gap-16">
          <div>
            <a href="#home" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-lg shadow-blue-700/20">
                <span className="material-symbols-outlined text-xl">medical_services</span>
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                Medi<span className="text-blue-400">Q</span>
              </span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              A calmer, more connected way to manage outpatient care—from check-in to consultation.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white">Platform</h2>
            <nav className="mt-5 flex flex-col gap-3" aria-label="Platform links">
              {platformLinks.map((link) => (
                <a key={link.label} href={link.href} className="w-fit text-sm transition-colors hover:text-blue-300">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white">Explore</h2>
            <nav className="mt-5 flex flex-col gap-3" aria-label="Explore links">
              {companyLinks.map((link) => (
                <a key={link.label} href={link.href} className="w-fit text-sm transition-colors hover:text-blue-300">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white">Stay connected</h2>
            <p className="mt-5 text-sm leading-6 text-slate-400">
              Have questions about bringing MediQueue to your hospital?
            </p>
            <a
              href="mailto:support@mediqueue.io"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition-colors hover:text-blue-200"
            >
              <span className="material-symbols-outlined text-lg">mail</span>
              mediqnew@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MediQ Systems. All rights reserved.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal links">
            <a href="#privacy" className="transition-colors hover:text-slate-200">Privacy</a>
            <a href="#terms" className="transition-colors hover:text-slate-200">Terms</a>
            <a href="#accessibility" className="transition-colors hover:text-slate-200">Accessibility</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
