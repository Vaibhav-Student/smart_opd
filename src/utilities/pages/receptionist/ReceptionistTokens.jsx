import React, { useEffect, useState } from "react";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";

const API_BASE_URL = "http://localhost:8000";

const getPriorityClasses = (priority) => {
  const value = String(priority || "").toLowerCase();
  if (value === "emergency") return "bg-red-50 text-red-700 border-red-200";
  if (value === "high") return "bg-amber-50 text-amber-700 border-amber-200";
  if (value === "medium") return "bg-yellow-50 text-yellow-800 border-yellow-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
};

const getQueuePatients = (lanes) => lanes.flatMap((lane) => {
  const activePatients = [lane.serving, lane.called, ...(lane.waiting || [])].filter(Boolean);
  return activePatients.map((patient) => ({
    ...patient,
    doctorName: lane.doctor?.name || "Unassigned",
    specialization: lane.doctor?.specialization || "General Medicine",
    queueStatus: String(patient.status || "waiting").toLowerCase(),
  }));
});

export default function ReceptionistTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedToken, setSelectedToken] = useState(null);

  const fetchTokens = async () => {
    try {
      setError("");
      const response = await fetch(`${API_BASE_URL}/queues/board`);
      if (!response.ok) throw new Error(`Failed to load tokens (${response.status})`);
      const data = await response.json();
      setTokens(getQueuePatients(Array.isArray(data) ? data : []));
    } catch (requestError) {
      console.error("Token page fetch error:", requestError);
      setError(requestError.message || "Unable to load queue tokens.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ReceptionistLayout activeTab="Tokens">
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-black text-slate-900">Queue Tokens</h1>
            <p className="mt-1 text-sm text-slate-500">
              Print tokens only for patients currently in the queue.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchTokens}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>sync</span>
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
            <span>{error}</span>
            <button type="button" onClick={fetchTokens} className="font-bold underline underline-offset-2">Retry</button>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold font-black text-slate-900">Active Queue Tokens</h2>
              <p className="mt-1 text-xs font-medium text-slate-400">{tokens.length} patient{tokens.length === 1 ? "" : "s"} currently in queue</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Live</span>
          </div>

          {loading && tokens.length === 0 ? (
            <div className="py-16 text-center text-sm font-semibold text-slate-400">
              Loading active queue tokens...
            </div>
          ) : tokens.length === 0 ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">confirmation_number</span>
              <p className="mt-3 text-sm font-semibold text-slate-500">No patients are currently in the queue.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {tokens.map((token) => (
                <div key={token.qid || `${token.vid}-${token.token}`} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-blue-600">#{token.token}</span>
                      <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase ${getPriorityClasses(token.priority)}`}>
                        {token.priority || "Low"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-bold text-slate-900">{token.patient_name}</p>
                    <p className="truncate text-xs font-medium text-slate-500">{token.doctorName} • {token.specialization}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase text-slate-400">{token.queueStatus}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedToken(token)}
                    title="Print token slip"
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                  >
                    <span className="material-symbols-outlined text-base">print</span>
                    Print
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedToken && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 print:bg-white print:p-0">
            <div className="w-full max-w-md space-y-5 rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 shadow-2xl print:w-full print:border-slate-800 print:shadow-none">
              <button
                type="button"
                onClick={() => setSelectedToken(null)}
                className="float-right flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 print:hidden"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>

              <div className="clear-both space-y-1 border-b-2 border-slate-800 pb-4 text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white print:bg-black">OPD</div>
                <h2 className="text-xl font-black text-slate-900">SMART OPD MEDICAL CENTER</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Outpatient Registration Ticket</p>
              </div>

              <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-center print:bg-white print:border-slate-800">
                <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">OPD Token Number</span>
                <div className="text-4xl font-black text-blue-600 print:text-black">#{selectedToken.token}</div>
                <span className="block pt-1 text-xs font-bold text-slate-600">{selectedToken.queueStatus} • Est. wait: {selectedToken.estimated_wait_time || 0} min</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between gap-4 border-b border-slate-200 py-1"><span className="font-bold uppercase text-slate-500">Patient Name:</span><span className="font-extrabold text-slate-900">{selectedToken.patient_name}</span></div>
                <div className="flex justify-between gap-4 border-b border-slate-200 py-1"><span className="font-bold uppercase text-slate-500">Assigned Doctor:</span><span className="font-extrabold text-blue-600">{selectedToken.doctorName}</span></div>
                <div className="flex justify-between gap-4 border-b border-slate-200 py-1"><span className="font-bold uppercase text-slate-500">Specialization:</span><span className="font-extrabold text-slate-900">{selectedToken.specialization}</span></div>
                <div className="flex justify-between gap-4 border-b border-slate-200 py-1"><span className="font-bold uppercase text-slate-500">Priority:</span><span className="font-extrabold text-slate-900">{selectedToken.priority || "Low"}</span></div>
                <div className="flex justify-between gap-4 border-b border-slate-200 py-1"><span className="font-bold uppercase text-slate-500">Age / Gender:</span><span className="font-extrabold text-slate-900">{selectedToken.age || "-"} / {selectedToken.gender || "-"}</span></div>
                <div className="flex justify-between gap-4 border-b border-slate-200 py-1"><span className="font-bold uppercase text-slate-500">Contact:</span><span className="font-extrabold text-slate-900">{selectedToken.patient_contact || "-"}</span></div>
              </div>

              <p className="border-t border-slate-200 pt-2 text-center text-[10px] font-semibold text-slate-400">Please retain this slip until your token is called.</p>
              <div className="flex justify-end gap-3 print:hidden">
                <button type="button" onClick={() => setSelectedToken(null)} className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700">Close</button>
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md"><span className="material-symbols-outlined text-sm">print</span>Print Token</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ReceptionistLayout>
  );
}
