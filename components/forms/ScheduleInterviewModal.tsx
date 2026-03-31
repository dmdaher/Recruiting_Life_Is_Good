"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  candidateId: string;
  candidateName: string;
  ndaStatus: string;
  users: { id: string; name: string }[];
  onClose: () => void;
};

export function ScheduleInterviewModal({ candidateId, candidateName, ndaStatus, users, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ndaBlocked = ndaStatus !== "SIGNED";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const interviewerIds = Array.from(form.getAll("interviewerIds")).filter(Boolean) as string[];

    const res = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId,
        scheduledAt: form.get("scheduledAt"),
        type: form.get("type"),
        interviewerIds,
        ndaRequired: true,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to schedule interview");
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 w-full max-w-md">
        <div className="p-6 border-b border-denali-gray-800">
          <h2 className="text-lg font-semibold text-denali-gray-100">Schedule Interview</h2>
          <p className="text-sm text-denali-gray-500 mt-1">for {candidateName}</p>
        </div>

        {ndaBlocked && (
          <div className="mx-6 mt-4 p-3 bg-yellow-950/30 border border-yellow-900/30 rounded-lg">
            <p className="text-sm text-yellow-300 font-medium">NDA Required</p>
            <p className="text-xs text-yellow-400 mt-1">
              {ndaStatus === "PENDING"
                ? "NDA has been sent but not yet signed. Interview cannot be scheduled until the NDA is completed."
                : "NDA must be signed before scheduling an interview. Send NDA via DocuSign first."}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-lg text-sm text-red-300">{error}</div>
          )}

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Date & Time *</label>
            <input name="scheduledAt" type="datetime-local" required disabled={ndaBlocked} className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan disabled:opacity-50" />
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Type</label>
            <select name="type" disabled={ndaBlocked} className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan disabled:opacity-50">
              <option value="SCREEN">Phone Screen</option>
              <option value="VIDEO">Video Interview</option>
              <option value="ONSITE">Onsite</option>
              <option value="PANEL">Panel</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Interviewer(s)</label>
            <select name="interviewerIds" multiple disabled={ndaBlocked} className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan h-24 disabled:opacity-50">
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <p className="text-[10px] text-denali-gray-600 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-denali-gray-400 hover:text-denali-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading || ndaBlocked} className="px-4 py-2 bg-denali-cyan text-denali-black font-medium rounded-lg text-sm hover:bg-denali-cyan/90 transition-colors disabled:opacity-50">
              {loading ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
