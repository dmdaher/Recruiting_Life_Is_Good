"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { CandidateCard } from "./CandidateCard";

export type CandidateData = {
  id: string;
  firstName: string;
  lastName: string;
  reqTitle: string;
  reqNumber: string;
  source: string;
  daysInStage: number;
  ndaStatus: string;
  appliedAt: string;
};

export type ColumnData = {
  id: string;
  name: string;
  order: number;
  isTerminal: boolean;
  candidates: CandidateData[];
};

export function KanbanBoard({ columns: initialColumns }: { columns: ColumnData[] }) {
  const [columns, setColumns] = useState(initialColumns);
  const [activeCandidate, setActiveCandidate] = useState<CandidateData | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const candidate = columns
      .flatMap((col) => col.candidates)
      .find((c) => c.id === active.id);
    if (candidate) setActiveCandidate(candidate);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCandidate(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source column
    const sourceCol = columns.find((col) =>
      col.candidates.some((c) => c.id === activeId)
    );
    if (!sourceCol) return;

    // Find target column (over could be a column or another candidate)
    let targetCol = columns.find((col) => col.id === overId);
    if (!targetCol) {
      targetCol = columns.find((col) =>
        col.candidates.some((c) => c.id === overId)
      );
    }
    if (!targetCol || sourceCol.id === targetCol.id) return;

    // Move candidate between columns
    const candidate = sourceCol.candidates.find((c) => c.id === activeId);
    if (!candidate) return;

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === sourceCol.id) {
          return {
            ...col,
            candidates: col.candidates.filter((c) => c.id !== activeId),
          };
        }
        if (col.id === targetCol!.id) {
          return {
            ...col,
            candidates: [...col.candidates, { ...candidate, daysInStage: 0 }],
          };
        }
        return col;
      })
    );

    // TODO: Call API to persist stage transition
    console.log(
      `Moved ${candidate.firstName} ${candidate.lastName} from ${sourceCol.name} to ${targetCol.name}`
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onCardClick={(candidate) => setSelectedCandidate(candidate)}
          />
        ))}

        <DragOverlay>
          {activeCandidate ? (
            <CandidateCard candidate={activeCandidate} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Candidate Slide-Out */}
      {selectedCandidate && (
        <div className="fixed inset-y-0 right-0 w-96 bg-denali-gray-900 border-l border-denali-gray-800 shadow-2xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-denali-gray-100">
                {selectedCandidate.firstName} {selectedCandidate.lastName}
              </h2>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-denali-gray-500 hover:text-denali-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-denali-gray-800 rounded-lg p-4">
                <h3 className="text-xs font-medium text-denali-gray-500 uppercase tracking-wider mb-2">Position</h3>
                <p className="text-sm text-denali-gray-200">{selectedCandidate.reqTitle}</p>
                <p className="text-xs text-denali-gray-500 mt-1">{selectedCandidate.reqNumber}</p>
              </div>

              <div className="bg-denali-gray-800 rounded-lg p-4">
                <h3 className="text-xs font-medium text-denali-gray-500 uppercase tracking-wider mb-2">Source</h3>
                <p className="text-sm text-denali-gray-200">{selectedCandidate.source}</p>
              </div>

              <div className="bg-denali-gray-800 rounded-lg p-4">
                <h3 className="text-xs font-medium text-denali-gray-500 uppercase tracking-wider mb-2">NDA Status</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedCandidate.ndaStatus === "SIGNED"
                    ? "bg-green-900/30 text-green-400"
                    : selectedCandidate.ndaStatus === "PENDING"
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-denali-gray-700 text-denali-gray-400"
                }`}>
                  {selectedCandidate.ndaStatus === "SIGNED" ? "Signed" : selectedCandidate.ndaStatus === "PENDING" ? "Pending" : "Not Required"}
                </span>
              </div>

              <div className="bg-denali-gray-800 rounded-lg p-4">
                <h3 className="text-xs font-medium text-denali-gray-500 uppercase tracking-wider mb-2">Applied</h3>
                <p className="text-sm text-denali-gray-200">
                  {new Date(selectedCandidate.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>

              <div className="bg-denali-gray-800 rounded-lg p-4">
                <h3 className="text-xs font-medium text-denali-gray-500 uppercase tracking-wider mb-2">Days in Current Stage</h3>
                <p className={`text-2xl font-bold ${
                  selectedCandidate.daysInStage > 14 ? "text-denali-danger" : selectedCandidate.daysInStage > 7 ? "text-denali-warning" : "text-denali-success"
                }`}>
                  {selectedCandidate.daysInStage}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <button className="w-full py-2.5 px-4 bg-denali-cyan text-denali-black font-medium rounded-lg hover:bg-denali-cyan/90 transition-colors text-sm">
                  Schedule Interview
                </button>
                <button className="w-full py-2.5 px-4 bg-denali-gray-800 text-denali-gray-200 font-medium rounded-lg hover:bg-denali-gray-700 transition-colors text-sm">
                  Add Notes
                </button>
                <button className="w-full py-2.5 px-4 bg-denali-gray-800 text-denali-gray-200 font-medium rounded-lg hover:bg-denali-gray-700 transition-colors text-sm">
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
