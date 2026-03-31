"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  departments: { id: string; code: string; name: string }[];
  locations: { id: string; name: string; country: string }[];
  users: { id: string; name: string; role: string }[];
  onClose: () => void;
};

export function CreateReqModal({ departments, locations, users, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hiringManagers = users.filter((u) => u.role === "HIRING_MANAGER" || u.role === "RECRUITING_MANAGER");
  const recruiters = users.filter((u) => u.role === "RECRUITER" || u.role === "RECRUITING_MANAGER");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const recruiterIds = Array.from(form.getAll("recruiterIds")).filter(Boolean) as string[];

    const res = await fetch("/api/reqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reqNumber: form.get("reqNumber"),
        title: form.get("title"),
        departmentId: form.get("departmentId"),
        locationId: form.get("locationId"),
        hiringManagerId: form.get("hiringManagerId"),
        payRangeMin: parseFloat(form.get("payRangeMin") as string) || null,
        payRangeMax: parseFloat(form.get("payRangeMax") as string) || null,
        positionsTotal: parseInt(form.get("positionsTotal") as string) || 1,
        billable: form.get("billable") === "true",
        targetDate: form.get("targetDate") || null,
        evergreen: form.get("evergreen") === "on",
        reasonForHire: form.get("reasonForHire") || null,
        recruiterIds,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create requisition");
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-denali-gray-800">
          <h2 className="text-lg font-semibold text-denali-gray-100">New Requisition</h2>
          <p className="text-xs text-denali-gray-500 mt-1">Pay range is required per Washington Equal Pay Act (RCW 49.58)</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-lg text-sm text-red-300">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Req Number *</label>
              <input name="reqNumber" required placeholder="REQ-3507" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Positions</label>
              <input name="positionsTotal" type="number" min="1" defaultValue="1" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Title *</label>
            <input name="title" required className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Department *</label>
              <select name="departmentId" required className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan">
                <option value="">Select</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.code} — {d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Location *</label>
              <select name="locationId" required className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan">
                <option value="">Select</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}, {l.country}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Hiring Manager *</label>
            <select name="hiringManagerId" required className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan">
              <option value="">Select</option>
              {hiringManagers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-denali-danger mb-1">Pay Range Min * (WA law)</label>
              <input name="payRangeMin" type="number" required placeholder="55000" className="w-full bg-denali-gray-800 border border-red-900/50 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
            <div>
              <label className="block text-xs font-medium text-denali-danger mb-1">Pay Range Max * (WA law)</label>
              <input name="payRangeMax" type="number" required placeholder="85000" className="w-full bg-denali-gray-800 border border-red-900/50 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Billable</label>
              <select name="billable" defaultValue="true" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan">
                <option value="true">Yes — Billable</option>
                <option value="false">No — Non-Billable</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Target Date</label>
              <input name="targetDate" type="date" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Assigned Recruiter(s)</label>
            <select name="recruiterIds" multiple className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan h-20">
              {recruiters.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input name="evergreen" type="checkbox" className="rounded border-denali-gray-700 bg-denali-gray-800 text-denali-cyan focus:ring-denali-cyan" />
            <label className="text-xs text-denali-gray-400">Evergreen position (continuously hiring)</label>
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Reason for Hire</label>
            <textarea name="reasonForHire" rows={2} placeholder="Non-billable positions require business justification" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-denali-gray-400 hover:text-denali-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-denali-cyan text-denali-black font-medium rounded-lg text-sm hover:bg-denali-cyan/90 transition-colors disabled:opacity-50">
              {loading ? "Creating..." : "Create Requisition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
