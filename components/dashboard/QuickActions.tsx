"use client";

import { useState } from "react";
import { AddCandidateModal } from "@/components/forms/AddCandidateModal";

type Props = {
  requisitions: { id: string; reqNumber: string; title: string }[];
  sources: { id: string; name: string }[];
  userId: string;
};

const actions = [
  {
    key: "add-candidate",
    label: "Submit Candidate",
    icon: "👤",
    description: "Add a new candidate to a requisition",
    color: "bg-denali-cyan/10 text-denali-cyan hover:bg-denali-cyan/20",
  },
  {
    key: "schedule-interview",
    label: "Schedule Interview",
    icon: "📅",
    description: "Schedule an interview for a candidate",
    color: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
  },
  {
    key: "log-notes",
    label: "Log Screen Notes",
    icon: "📝",
    description: "Record notes from a phone screen",
    color: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
  },
  {
    key: "extend-offer",
    label: "Extend Offer",
    icon: "📨",
    description: "Create and extend an offer to a candidate",
    color: "bg-denali-success/10 text-denali-success hover:bg-denali-success/20",
  },
];

export function QuickActions({ requisitions, sources, userId }: Props) {
  const [openModal, setOpenModal] = useState<string | null>(null);

  return (
    <>
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
        <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={() => setOpenModal(action.key)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${action.color}`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {openModal === "add-candidate" && (
        <AddCandidateModal
          requisitions={requisitions}
          sources={sources}
          userId={userId}
          onClose={() => setOpenModal(null)}
        />
      )}
    </>
  );
}
