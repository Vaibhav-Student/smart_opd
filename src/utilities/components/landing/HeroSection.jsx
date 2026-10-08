import React, { useState } from 'react';

const TABS = [
  { id: 'queue', label: 'Live queue' },
  { id: 'doctors', label: 'Doctors' },
];

const QUEUE = [
  { token: 'T-105', name: 'Manish Verma', reason: 'General consultation', status: 'Waiting' },
  { token: 'T-106', name: 'Priya Patel', reason: 'Follow-up visit', status: 'In Room' },
];

const DOCTORS = [
  { name: 'Dr. Sharma', department: 'Cardiology', status: 'Seeing patients' },
  { name: 'Dr. Mehta', department: 'Orthopedics', status: 'Seeing patients' },
];

export default function HeroSection({ onOpenLogin, onOpenBooking }) {
  const [activeTab, setActiveTab] = useState('queue');

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-slate-50 pb-16 pt-28 sm:pb-20 lg:min-h-[calc(100vh-80px)] lg:pt-32"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[1300px] px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-2xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-5.5xl">
              Make every OPD visit feel{' '}
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
                effortless.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base font-medium leading-7 text-slate-600 sm:text-md">
              MediQ brings registration, appointments, tokens, and live patient flow into one
              calm, connected workspace for your entire hospital team.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onOpenLogin?.('login')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition-all hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl hover:shadow-blue-700/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Open staff portal
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-slate-200 pt-6">
              <div>
                <p className="text-2xl font-bold text-slate-900">40%</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Less waiting</p>
              </div>
              <div className="h-9 w-px bg-slate-200" />
              <div>
                <p className="text-2xl font-bold text-slate-900">24/7</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Live visibility</p>
              </div>
              <div className="h-9 w-px bg-slate-200" />
              <div>
                <p className="text-2xl font-bold text-slate-900">1 view</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Connected teams</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div aria-hidden="true" className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-teal-400/15 blur-2xl" />
            <div className="relative rounded-[1.75rem] border border-slate-200/90 bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                    <span className="material-symbols-outlined">monitor_heart</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Today’s OPD overview</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Cardiology · Room 402B</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>

              <div role="tablist" aria-label="OPD overview" className="mt-5 flex gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`${tab.id}-tab`}
                      aria-controls={`${tab.id}-panel`}
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 rounded-lg py-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {activeTab === 'queue' && (
                <div id="queue-panel" role="tabpanel" aria-labelledby="queue-tab" className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-700 p-5 text-white shadow-lg shadow-blue-700/20">
                    <div>
                      <p className="text-xs font-medium text-blue-100">Now consulting</p>
                      <p className="mt-1 text-3xl font-bold tracking-tight">T-104</p>
                    </div>
                    <div className="rounded-xl bg-white/15 px-3 py-2 text-right backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-wider text-blue-100">Avg. wait</p>
                      <p className="mt-0.5 text-sm font-bold">12 min</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Up next</p>
                    <p className="text-xs font-semibold text-slate-400">2 patients</p>
                  </div>

                  <ul className="divide-y divide-slate-100">
                    {QUEUE.map((p) => (
                      <li key={p.token} className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                            {p.token.slice(2)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.reason}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${p.status === 'In Room' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {p.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'doctors' && (
                <ul id="doctors-panel" role="tabpanel" aria-labelledby="doctors-tab" className="mt-5 divide-y divide-slate-100">
                  {DOCTORS.map((d) => (
                    <li key={d.name} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <span className="material-symbols-outlined text-lg">stethoscope</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{d.name}</p>
                          <p className="text-xs text-slate-500">{d.department}</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {d.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
