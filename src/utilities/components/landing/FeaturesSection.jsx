import React from 'react';

export default function FeaturesSection({ onOpenFeature }) {
  const features = [
    {
      id: 'registration',
      icon: 'qr_code_scanner',
      iconBg: 'bg-blue-50 text-blue-700',
      audience: 'For front desk teams',
      title: 'Register patients in minutes',
      description: 'Create a patient profile, capture the visit details, and issue a token without repeating the same information.',
      outcome: 'Less paperwork at reception',
    },
    {
      id: 'appointment',
      icon: 'calendar_month',
      iconBg: 'bg-teal-50 text-teal-700',
      audience: 'For coordinators',
      title: 'Keep every schedule on track',
      description: 'See doctor availability, manage appointments, and handle changes from one shared calendar.',
      outcome: 'Fewer clashes and callbacks',
    },
    {
      id: 'ai_prediction',
      icon: 'psychology',
      iconBg: 'bg-indigo-50 text-indigo-700',
      audience: 'For patients and staff',
      title: 'Make waiting feel predictable',
      description: 'Use live queue activity to share realistic wait times and help patients plan their visit with confidence.',
      outcome: 'Calmer waiting rooms',
    },
    {
      id: 'monitoring',
      icon: 'monitoring',
      iconBg: 'bg-amber-50 text-amber-700',
      audience: 'For hospital leaders',
      title: 'Know what needs attention',
      description: 'Track patient flow, busy departments, and bottlenecks in one simple view before small delays become bigger problems.',
      outcome: 'Better decisions, every day',
    },
  ];

  return (
    <section className="border-y border-slate-200 bg-white py-20 lg:py-28" id="features">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="mb-12 max-w-2xl justify-center text-center lg:mx-auto lg:mb-16 lg:max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            One connected OPD workflow
          </div>

          <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Everything your team needs to keep care moving
          </h2>

          <div className="flex justify-center mt-5">
            <p className="text-sm text-slate-500">
              From the first check-in to the final consultation, MediQ gives every team member a
              clear next step and gives every patient a smoother visit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-slate-900/5"
            >
              <div className={`mb-7 flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg}`}>
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.audience}</p>
              <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>

              <div className="mt-auto border-t border-slate-200 pt-5">
                <p className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                  {item.outcome}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-slate-900 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="text-sm font-bold text-white">A smoother OPD starts with one shared view.</p>
            <p className="mt-1 text-sm text-slate-300">Give your team the clarity to focus on patients, not paperwork.</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenFeature?.('feature')}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            See how it works
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  );
}
