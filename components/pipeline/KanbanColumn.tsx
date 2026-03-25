"use client";

import { useDroppable } from "@dnd-kit/core";
import { CandidateCard } from "./CandidateCard";
import type { ColumnData, CandidateData } from "./KanbanBoard";

export function KanbanColumn({
  column,
  onCardClick,
}: {
  column: ColumnData;
  onCardClick: (candidate: CandidateData) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 flex flex-col bg-denali-gray-900 rounded-xl border transition-colors ${
        isOver
          ? "border-denali-cyan/50 bg-denali-cyan/5"
          : "border-denali-gray-800"
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-denali-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-denali-gray-200">
            {column.name}
          </h3>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-denali-gray-800 text-xs font-medium text-denali-gray-400">
            {column.candidates.length}
          </span>
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        {column.candidates.length === 0 ? (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-denali-gray-800 rounded-lg">
            <p className="text-xs text-denali-gray-600">Drop here</p>
          </div>
        ) : (
          column.candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onClick={() => onCardClick(candidate)}
            />
          ))
        )}
      </div>
    </div>
  );
}
