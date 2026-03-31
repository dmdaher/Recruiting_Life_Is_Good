"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  requisitions: { id: string; reqNumber: string; title: string }[];
  sources: { id: string; name: string }[];
  userId: string;
  onClose: () => void;
};

export function AddCandidateModal({ requisitions, sources, userId, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        email: form.get("email"),
        phone: form.get("phone") || null,
        requisitionId: form.get("requisitionId"),
        sourceId: form.get("sourceId") || null,
        sourceDetail: form.get("sourceDetail") || null,
        jurisdiction: form.get("jurisdiction") || "WA",
        notes: form.get("notes") || null,
        movedById: userId,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create candidate");
      return;
    }

    if (data.data.duplicateWarning) {
      setDuplicateWarning(data.data.duplicateWarning.message);
    }

    router.refresh();
    if (!data.data.duplicateWarning) onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-denali-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-denali-gray-100">Add Candidate</h2>
          <button onClick={onClose} className="text-denali-gray-500 hover:text-denali-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-lg text-sm text-red-300">{error}</div>
          )}
          {duplicateWarning && (
            <div className="p-3 bg-yellow-950/30 border border-yellow-900/30 rounded-lg text-sm text-yellow-300">
              {duplicateWarning}
              <button type="button" onClick={onClose} className="block mt-2 text-xs text-yellow-400 underline">Close anyway</button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">First Name *</label>
              <input name="firstName" required className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Last Name *</label>
              <input name="lastName" required className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Email *</label>
            <input name="email" type="email" required className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Phone</label>
            <input name="phone" type="tel" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Requisition *</label>
            <select name="requisitionId" required className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan">
              <option value="">Select a requisition</option>
              {requisitions.map((r) => (
                <option key={r.id} value={r.id}>{r.reqNumber} — {r.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Source</label>
            <select name="sourceId" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan">
              <option value="">Select source</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Source Detail (agency name, referrer, etc.)</label>
            <input name="sourceDetail" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Jurisdiction</label>
            <select name="jurisdiction" defaultValue="WA" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan">
              <option value="WA">Washington (US)</option>
              <option value="US">Other US State</option>
              <option value="UK">United Kingdom</option>
              <option value="Ireland">Ireland</option>
              <option value="India">India</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Notes</label>
            <textarea name="notes" rows={3} className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-denali-gray-400 hover:text-denali-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-denali-cyan text-denali-black font-medium rounded-lg text-sm hover:bg-denali-cyan/90 transition-colors disabled:opacity-50">
              {loading ? "Adding..." : "Add Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
