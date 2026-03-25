"use client";

import { useDraggable } from "@dnd-kit/core";
import type { CandidateData } from "./KanbanBoard";

export function CandidateCard({
  candidate,
  isDragging,
  onClick,
}: {
  candidate: CandidateData;
  isDragging?: boolean;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: candidate.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const ageColor =
    candidate.daysInStage > 14
      ? "border-l-denali-danger"
      : candidate.daysInStage > 7
      ? "border-l-denali-warning"
      : "border-l-denali-success";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`border-l-4 ${ageColor} bg-denali-gray-800 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-denali-gray-700 transition-colors ${
        isDragging ? "opacity-90 shadow-xl ring-2 ring-denali-cyan/30 rotate-2" : ""
      }`}
    >
      {/* Name */}
      <p className="text-sm font-medium text-denali-gray-200">
        {candidate.firstName} {candidate.lastName}
      </p>

      {/* Req */}
      <p className="text-xs text-denali-gray-500 mt-1">
        {candidate.reqNumber} &middot; {candidate.reqTitle}
      </p>

      {/* Footer: Source + Days */}
      <div className="flex items-center justify-between mt-2.5">
        <span className="text-xs px-2 py-0.5 rounded-full bg-denali-gray-700 text-denali-gray-400">
          {candidate.source}
        </span>
        <span
          className={`text-xs font-mono ${
            candidate.daysInStage > 14
              ? "text-denali-danger"
              : candidate.daysInStage > 7
              ? "text-denali-warning"
              : "text-denali-gray-500"
          }`}
        >
          {candidate.daysInStage}d
        </span>
      </div>

      {/* NDA indicator */}
      {candidate.ndaStatus === "PENDING" && (
        <div className="mt-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-denali-warning" />
          <span className="text-[10px] text-denali-warning">NDA pending</span>
        </div>
      )}
    </div>
  );
}
