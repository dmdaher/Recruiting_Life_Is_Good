"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  candidateId: string;
  candidateName: string;
  employeeTypes: { id: string; code: string; name: string }[];
  clients: { id: string; name: string; requiresDrugScreen: boolean; requiresTBTest: boolean; requiresAdditionalBGCheck: boolean }[];
  onClose: () => void;
};

export function CreateOfferModal({ candidateId, candidateName, employeeTypes, clients, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>("");

  const client = clients.find((c) => c.id === selectedClient);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId,
        salary: form.get("salary") || null,
        payRate: form.get("payRate") || null,
        billRate: form.get("billRate") || null,
        startDate: form.get("startDate") || null,
        employeeTypeId: form.get("employeeTypeId") || null,
        exemptStatus: form.get("exemptStatus") || null,
        expiresAt: form.get("expiresAt") || null,
        clientId: selectedClient || null,
        clientRequiresDrugScreen: client?.requiresDrugScreen ?? false,
        clientRequiresTBTest: client?.requiresTBTest ?? false,
        clientRequiresAdditionalBGCheck: client?.requiresAdditionalBGCheck ?? false,
        bonusCommissionPlan: form.get("bonusCommissionPlan") || null,
        commissionAmount: form.get("commissionAmount") ? parseFloat(form.get("commissionAmount") as string) : null,
        bonusAmount: form.get("bonusAmount") ? parseFloat(form.get("bonusAmount") as string) : null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create offer");
      return;
    }

    if (data.data.minWageWarning) {
      setWarning(data.data.minWageWarning);
    }

    router.refresh();
    if (!data.data.minWageWarning) onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-denali-gray-800">
          <h2 className="text-lg font-semibold text-denali-gray-100">Create Offer</h2>
          <p className="text-sm text-denali-gray-500 mt-1">for {candidateName}</p>
          <p className="text-xs text-denali-gray-600 mt-0.5">Status: Draft (requires HM approval before extending)</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-lg text-sm text-red-300">{error}</div>}
          {warning && (
            <div className="p-3 bg-yellow-950/30 border border-yellow-900/30 rounded-lg text-sm text-yellow-300">
              {warning}
              <button type="button" onClick={onClose} className="block mt-2 text-xs text-yellow-400 underline">Close anyway (offer created)</button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Salary</label>
              <input name="salary" placeholder="85000" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Pay Rate ($/hr)</label>
              <input name="payRate" placeholder="45.00" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Bill Rate ($/hr)</label>
              <input name="billRate" placeholder="65.00" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Start Date</label>
              <input name="startDate" type="date" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Offer Expires</label>
              <input name="expiresAt" type="date" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Employee Type</label>
              <select name="employeeTypeId" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan">
                <option value="">Select type</option>
                {employeeTypes.map((t) => (
                  <option key={t.id} value={t.id}>Type {t.code}: {t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Exempt Status</label>
              <select name="exemptStatus" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan">
                <option value="">Select</option>
                <option value="exempt">Exempt</option>
                <option value="non-exempt">Non-Exempt</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Client</label>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan">
              <option value="">No client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {client && (client.requiresDrugScreen || client.requiresTBTest || client.requiresAdditionalBGCheck) && (
              <div className="mt-2 p-2 bg-denali-gray-800 rounded text-xs text-denali-warning">
                Client requirements: {[
                  client.requiresDrugScreen && "Drug Screen",
                  client.requiresTBTest && "TB Test",
                  client.requiresAdditionalBGCheck && "Additional BGC",
                ].filter(Boolean).join(", ")}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Commission Amount</label>
              <input name="commissionAmount" type="number" step="0.01" placeholder="0.00" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
            <div>
              <label className="block text-xs font-medium text-denali-gray-400 mb-1">Bonus Amount</label>
              <input name="bonusAmount" type="number" step="0.01" placeholder="0.00" className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-denali-gray-400 hover:text-denali-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-denali-cyan text-denali-black font-medium rounded-lg text-sm hover:bg-denali-cyan/90 transition-colors disabled:opacity-50">
              {loading ? "Creating..." : "Create Offer (Draft)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
