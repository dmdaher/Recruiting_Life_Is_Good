"use client";

export function AlertsPanel({
  alerts,
}: {
  alerts: { type: "warning" | "danger"; message: string }[];
}) {
  return (
    <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
      <h2 className="text-lg font-semibold text-denali-gray-100 mb-4">
        Alerts
        {alerts.length > 0 && (
          <span className="ml-2 text-sm font-normal text-denali-danger">
            ({alerts.length})
          </span>
        )}
      </h2>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-denali-success">No alerts — looking good</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                alert.type === "danger"
                  ? "bg-red-950/30 border border-red-900/30"
                  : "bg-yellow-950/30 border border-yellow-900/30"
              }`}
            >
              <span
                className={`mt-0.5 text-sm ${
                  alert.type === "danger"
                    ? "text-denali-danger"
                    : "text-denali-warning"
                }`}
              >
                {alert.type === "danger" ? "🔴" : "🟡"}
              </span>
              <p
                className={`text-sm ${
                  alert.type === "danger"
                    ? "text-red-300"
                    : "text-yellow-300"
                }`}
              >
                {alert.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
