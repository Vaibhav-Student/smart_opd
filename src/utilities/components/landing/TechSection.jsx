import React from 'react';

const ROADMAP = [
  {
    phase: '01',
    label: 'Baseline model',
    icon: 'database',
    title: 'Linear Regression',
    model: 'A simple first estimate',
    description:
      'Linear Regression estimates waiting time by learning how each input—such as queue length, consultation duration, and number of available doctors—affects the final result.',
    outcome: 'Easy to understand and use as a benchmark',
    accent: 'border-blue-400/40 bg-blue-400/10 text-blue-300',
  },
  {
    phase: '02',
    label: 'Pattern model',
    icon: 'model_training',
    title: 'Decision Tree',
    model: 'Clear if–then decisions',
    description:
      'A Decision Tree follows a sequence of simple questions—for example, whether the queue is long or a doctor is available—to estimate the likely patient wait.',
    outcome: 'Simple logic that staff can easily follow',
    accent: 'border-teal-400/40 bg-teal-400/10 text-teal-300',
  },
  {
    phase: '03',
    label: 'Recommended model',
    icon: 'insights',
    title: 'Random Forest',
    model: 'Combine many decision trees',
    description:
      'Random Forest combines the results of many Decision Trees trained on OPD data. This makes it better suited to different departments, queue patterns, consultation times, and doctor availability.',
    outcome: 'Our recommended balance of accuracy and reliability',
    accent: 'border-indigo-400/40 bg-indigo-400/10 text-indigo-300',
  },
];

export default function TechSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-white lg:py-28" id="technology">
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 -top-48 h-[32rem] w-[32rem] rounded-full bg-blue-600/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-40 h-[28rem] w-[28rem] rounded-full bg-indigo-600/15 blur-3xl" />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="grid grid-cols-1 items-end gap-8 border-b border-white/10 pb-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Future ML roadmap
            </div>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Choosing the right model for smarter OPD flow.
            </h2>
          </div>
          <p className="text-base leading-7 text-slate-300">
            We can compare simple and advanced approaches using real OPD data. For MediQ, Random
            Forest is the recommended model because it can handle several patient-flow factors
            together while remaining practical to validate and review.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {ROADMAP.map((item, index) => (
            <article
              key={item.phase}
              className={`relative rounded-2xl border p-6 transition-transform duration-300 hover:-translate-y-1 ${
                index === 2
                  ? 'border-blue-400/50 bg-white/[0.09] shadow-2xl shadow-blue-950/40'
                  : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]'
              }`}
            >
              {index === 2 && (
                <span className="absolute -top-3 left-6 rounded-full bg-blue-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Recommended model
                </span>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${item.accent}`}>
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <span className="font-mono text-3xl font-bold text-white/20">{item.phase}</span>
              </div>

              <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
              <h3 className="mt-2 text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-1 text-sm font-semibold text-blue-300">{item.model}</p>
              <p className="mt-4 text-sm leading-6 text-slate-300">{item.description}</p>

              <div className="mt-6 flex items-start gap-2 border-t border-white/10 pt-5">
                <span className="material-symbols-outlined mt-0.5 text-base text-emerald-400">check_circle</span>
                <p className="text-xs font-semibold leading-5 text-slate-200">{item.outcome}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-3 sm:p-8">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-blue-300">fact_check</span>
            <div>
              <p className="text-sm font-bold text-white">Check prediction quality</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">Compare predicted waiting time with actual consultation flow.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-teal-300">lock</span>
            <div>
              <p className="text-sm font-bold text-white">Use the right inputs</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">Keep queue, doctor, department, and timing data accurate and current.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-indigo-300">groups</span>
            <div>
              <p className="text-sm font-bold text-white">Keep staff in control</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">Treat every prediction as guidance that staff can review or override.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
