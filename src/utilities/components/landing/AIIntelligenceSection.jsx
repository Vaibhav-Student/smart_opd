import React, { useState } from 'react';

const AI_STEPS = [
  {
    id: 'check-in',
    icon: 'how_to_reg',
    label: 'Check-in',
    title: 'A simpler start for every patient',
    description: 'Registration details are captured once, so patients and reception teams spend less time repeating information.',
    color: 'blue',
  },
  {
    id: 'queue',
    icon: 'alt_route',
    label: 'Queue flow',
    title: 'A queue that responds to the day',
    description: 'MediQ reads live queue activity and doctor availability to help teams spot delays before they grow.',
    color: 'teal',
  },
  {
    id: 'wait-time',
    icon: 'schedule',
    label: 'Wait times',
    title: 'Clearer expectations while waiting',
    description: 'Patients see a more useful estimate of their wait, helping them plan their time and feel more informed.',
    color: 'indigo',
  },
];

const COLOR_STYLES = {
  blue: {
    icon: 'bg-blue-600 text-white',
    active: 'border-blue-200 bg-blue-50/70',
    dot: 'bg-blue-600',
  },
  teal: {
    icon: 'bg-teal-600 text-white',
    active: 'border-teal-200 bg-teal-50/70',
    dot: 'bg-teal-600',
  },
  indigo: {
    icon: 'bg-indigo-600 text-white',
    active: 'border-indigo-200 bg-indigo-50/70',
    dot: 'bg-indigo-600',
  },
};

export default function AIIntelligenceSection({ onOpenDemo }) {
  const [activeStep, setActiveStep] = useState(AI_STEPS[0].id);
  const selectedStep = AI_STEPS.find((step) => step.id === activeStep) || AI_STEPS[0];
  const selectedStyles = COLOR_STYLES[selectedStep.color];

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 lg:py-28" id="ai-intelligence">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <span className="material-symbols-outlined">psychology</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">MediQ intelligence</p>
                    <p className="mt-0.5 text-xs text-slate-500">Quietly working in the background</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              <div className="relative mt-7 space-y-3">
                <div aria-hidden="true" className="absolute bottom-8 left-5 top-8 w-px bg-slate-200" />
                {AI_STEPS.map((step, index) => {
                  const styles = COLOR_STYLES[step.color];
                  const isActive = activeStep === step.id;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      aria-pressed={isActive}
                      className={`relative flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all ${
                        isActive ? styles.active : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isActive ? styles.icon : 'bg-slate-100 text-slate-500'}`}>
                        <span className="material-symbols-outlined text-xl">{step.icon}</span>
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                          {step.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{step.title}</span>
                      </span>
                      <span className={`material-symbols-outlined ml-auto text-lg ${isActive ? 'text-slate-600' : 'text-slate-300'}`}>
                        arrow_forward
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className={`mt-5 rounded-2xl border p-4 ${selectedStyles.active}`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">What this means for your team</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-700">{selectedStep.description}</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Helpful intelligence, not more complexity
            </div>

            <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Let your team focus on care. We&apos;ll help with the flow.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              MediQ uses the information your OPD already creates to make the next step clearer.
              No complicated dashboards for patients, and no extra work for staff—just timely
              insights where they are useful.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-2xl font-bold text-slate-900">Less uncertainty</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Patients know what to expect instead of waiting without an update.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-2xl font-bold text-slate-900">Better visibility</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Teams can see where attention is needed and act before queues build up.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
