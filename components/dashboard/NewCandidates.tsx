"use client";

export function NewCandidates({
  candidates,
}: {
  candidates: {
    id: string;
    name: string;
    reqTitle: string;
    source: string;
    appliedAt: string;
  }[];
}) {
  return (
    <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
      <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">
        New Candidates
        {candidates.length > 0 && (
          <span className="ml-2 text-sm font-normal text-denali-cyan">
            ({candidates.length} today)
          </span>
        )}
      </h2>

      {candidates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-denali-gray-500">
            No new applications in the last 24 hours
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 bg-denali-gray-800 rounded-lg hover:bg-denali-gray-700 transition-colors cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-denali-gray-200">
                  {c.name}
                </p>
                <p className="text-xs text-denali-gray-500 mt-0.5">
                  {c.reqTitle}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-denali-gray-700 text-denali-gray-400">
                {c.source}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
