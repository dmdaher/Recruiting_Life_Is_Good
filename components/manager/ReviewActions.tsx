"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdvanceButton({ candidateId, toStageId, userId }: { candidateId: string; toStageId: string; userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAdvance() {
    setLoading(true);
    await fetch("/api/transitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, toStageId, movedById: userId, notes: "Advanced by Hiring Manager" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleAdvance}
      disabled={loading}
      className="px-3 py-1.5 bg-denali-success/10 text-denali-success text-xs font-medium rounded-lg hover:bg-denali-success/20 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Advance"}
    </button>
  );
}

export function PassButton({ candidateId, userId }: { candidateId: string; userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePass() {
    setLoading(true);
    await fetch(`/api/candidates/${candidateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rejectionReason: "Passed by Hiring Manager",
        rejectionReasonCode: "HM_PASS",
      }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handlePass}
      disabled={loading}
      className="px-3 py-1.5 bg-denali-danger/10 text-denali-danger text-xs font-medium rounded-lg hover:bg-denali-danger/20 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Pass"}
    </button>
  );
}
