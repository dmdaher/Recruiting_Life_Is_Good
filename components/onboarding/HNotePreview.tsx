"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  onboardingId: string;
  subject: string;
  fields: { label: string; value: string }[];
  bgCleared: boolean;
  alreadySent: boolean;
  sentAt: string | null;
};

export function HNotePreview({ onboardingId, subject, fields, bgCleared, alreadySent, sentAt }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    const res = await fetch(`/api/onboarding/${onboardingId}/h-note`, { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Failed to send H-Note");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {!bgCleared && !alreadySent && (
        <div className="p-4 bg-yellow-950/30 border border-yellow-900/30 rounded-xl">
          <p className="text-sm text-yellow-300 font-medium">Background Check Not Yet Cleared</p>
          <p className="text-xs text-yellow-400 mt-1">H-Note cannot be sent until the background check clears (SOP requirement). You can preview it below.</p>
        </div>
      )}

      {alreadySent && (
        <div className="p-4 bg-green-950/30 border border-green-900/30 rounded-xl flex items-center gap-2">
          <span className="text-lg">✅</span>
          <div>
            <p className="text-sm text-green-300 font-medium">H-Note Sent</p>
            <p className="text-xs text-green-400">{sentAt ? new Date(sentAt).toLocaleDateString() : ""} — IT and Billing have been notified</p>
          </div>
        </div>
      )}

      {/* H-Note Preview */}
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 overflow-hidden">
        {/* Email Header */}
        <div className="p-4 border-b border-denali-gray-800 bg-denali-gray-800/50">
          <div className="space-y-1.5">
            <div className="flex gap-2 text-xs">
              <span className="text-denali-gray-500 w-12">From:</span>
              <span className="text-denali-gray-300">HumanResources@denaliai.com</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-denali-gray-500 w-12">To:</span>
              <span className="text-denali-gray-300">H-Notes@denaliai.com</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-denali-gray-500 w-12">CC:</span>
              <span className="text-denali-gray-300">Hiring Manager</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-denali-gray-500 w-12">Subject:</span>
              <span className="text-denali-cyan font-medium">{subject}</span>
            </div>
          </div>
        </div>

        {/* H-Note Body */}
        <div className="p-6">
          <table className="w-full">
            <tbody>
              {fields.map((field) => (
                <tr key={field.label} className="border-b border-denali-gray-800/50 last:border-0">
                  <td className="py-2.5 pr-4 text-sm text-denali-gray-500 w-56">{field.label}</td>
                  <td className="py-2.5 text-sm text-denali-gray-200">{field.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Button */}
      {!alreadySent && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2.5 text-sm text-denali-gray-400 hover:text-denali-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSend}
            disabled={!bgCleared || loading}
            className="px-6 py-2.5 bg-denali-cyan text-denali-black font-medium rounded-lg text-sm hover:bg-denali-cyan/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : bgCleared ? "Send H-Note" : "Waiting for BG Check"}
          </button>
        </div>
      )}
    </div>
  );
}
