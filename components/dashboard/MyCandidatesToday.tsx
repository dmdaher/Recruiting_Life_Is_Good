"use client";

type CandidateAction = {
  id: string;
  name: string;
  days?: number;
  stage?: string;
  reqTitle: string;
};

export function MyCandidatesToday({
  needsFollowUp,
  interviewsToday,
  awaitingDecision,
}: {
  needsFollowUp: CandidateAction[];
  interviewsToday: CandidateAction[];
  awaitingDecision: CandidateAction[];
}) {
  return (
    <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
      <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">
        My Candidates Today
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Needs Follow-up */}
        <div>
          <h3 className="text-sm font-medium text-denali-warning mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-denali-warning" />
            Needs Follow-up ({needsFollowUp.length})
          </h3>
          <div className="space-y-2">
            {needsFollowUp.length === 0 ? (
              <p className="text-sm text-denali-gray-600">All caught up</p>
            ) : (
              needsFollowUp.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-denali-gray-800 rounded-lg hover:bg-denali-gray-700 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-medium text-denali-gray-200">
                    {c.name}
                  </p>
                  <p className="text-xs text-denali-gray-500 mt-0.5">
                    {c.reqTitle} &middot;{" "}
                    <span className="text-denali-warning">{c.days}d waiting</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Interviews Today */}
        <div>
          <h3 className="text-sm font-medium text-denali-cyan mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-denali-cyan" />
            In Interview Stage ({interviewsToday.length})
          </h3>
          <div className="space-y-2">
            {interviewsToday.length === 0 ? (
              <p className="text-sm text-denali-gray-600">No interviews</p>
            ) : (
              interviewsToday.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-denali-gray-800 rounded-lg hover:bg-denali-gray-700 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-medium text-denali-gray-200">
                    {c.name}
                  </p>
                  <p className="text-xs text-denali-gray-500 mt-0.5">
                    {c.reqTitle}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Awaiting Decision */}
        <div>
          <h3 className="text-sm font-medium text-purple-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Awaiting Decision ({awaitingDecision.length})
          </h3>
          <div className="space-y-2">
            {awaitingDecision.length === 0 ? (
              <p className="text-sm text-denali-gray-600">None pending</p>
            ) : (
              awaitingDecision.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-denali-gray-800 rounded-lg hover:bg-denali-gray-700 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-medium text-denali-gray-200">
                    {c.name}
                  </p>
                  <p className="text-xs text-denali-gray-500 mt-0.5">
                    {c.reqTitle} &middot;{" "}
                    <span className="text-purple-400">{c.stage}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
