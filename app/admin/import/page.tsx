"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PreviewData = {
  template: string;
  totalRows: number;
  validRows: number;
  issues: { row: number; field: string; message: string; severity: "error" | "warning" }[];
  data: Record<string, unknown>[];
};

type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

export default function ImportPage() {
  const router = useRouter();
  const [template, setTemplate] = useState<string>("open-reqs");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePreview() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("template", template);

    const res = await fetch("/api/import", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Preview failed");
      return;
    }
    setPreview(data.data);
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("template", template);
    formData.append("confirm", "true");

    const res = await fetch("/api/import", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Import failed");
      return;
    }
    setResult(data.data);
    setPreview(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">Import Data</h1>
        <p className="text-sm text-denali-gray-500 mt-1">Upload Excel files to import recruiting data</p>
      </div>

      {/* Upload Form */}
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Template</label>
            <select
              value={template}
              onChange={(e) => { setTemplate(e.target.value); setPreview(null); setResult(null); }}
              className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200"
            >
              <option value="open-reqs">Open Requisition Report</option>
              <option value="filled-positions">Filled Positions</option>
              <option value="ytd-report">YTD Report</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-denali-gray-400 mb-1">Excel File (.xlsx)</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null); setResult(null); }}
              className="w-full bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 file:mr-3 file:bg-denali-gray-700 file:text-denali-gray-300 file:border-0 file:rounded file:px-3 file:py-1 file:text-xs"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handlePreview}
              disabled={!file || loading}
              className="w-full py-2 bg-denali-cyan text-denali-black font-medium rounded-lg text-sm hover:bg-denali-cyan/90 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Preview Import"}
            </button>
          </div>
        </div>

        {error && <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-lg text-sm text-red-300">{error}</div>}
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-denali-gray-100">Import Preview</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-denali-gray-400">{preview.totalRows} total rows</span>
              <span className="text-denali-success">{preview.validRows} valid</span>
              {preview.issues.length > 0 && (
                <span className="text-denali-warning">{preview.issues.length} issues</span>
              )}
            </div>
          </div>

          {/* Issues */}
          {preview.issues.length > 0 && (
            <div className="mb-4 space-y-1 max-h-48 overflow-y-auto">
              {preview.issues.map((issue, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded ${
                  issue.severity === "error" ? "bg-red-950/30 text-red-300" : "bg-yellow-950/30 text-yellow-300"
                }`}>
                  <span>{issue.severity === "error" ? "🔴" : "🟡"}</span>
                  <span>Row {issue.row}: {issue.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Data Preview Table */}
          <div className="overflow-x-auto mb-4 max-h-64">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-denali-gray-800">
                  {preview.data.length > 0 &&
                    Object.keys(preview.data[0])
                      .filter((k) => k !== "_rowNumber")
                      .slice(0, 8)
                      .map((key) => (
                        <th key={key} className="text-left px-2 py-1 text-denali-gray-500 uppercase">{key}</th>
                      ))}
                </tr>
              </thead>
              <tbody>
                {preview.data.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-b border-denali-gray-800/50">
                    {Object.entries(row)
                      .filter(([k]) => k !== "_rowNumber")
                      .slice(0, 8)
                      .map(([key, value]) => (
                        <td key={key} className="px-2 py-1 text-denali-gray-400 truncate max-w-32">
                          {String(value ?? "")}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.data.length > 20 && (
              <p className="text-xs text-denali-gray-600 mt-2">...and {preview.data.length - 20} more rows</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setPreview(null)} className="px-4 py-2 text-sm text-denali-gray-400">Cancel</button>
            <button
              onClick={handleImport}
              disabled={loading || preview.issues.some((i) => i.severity === "error")}
              className="px-4 py-2 bg-denali-success text-white font-medium rounded-lg text-sm hover:bg-denali-success/90 disabled:opacity-50"
            >
              {loading ? "Importing..." : `Import ${preview.validRows} Records`}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-6">
          <h2 className="text-lg font-semibold text-denali-success mb-4">Import Complete</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-denali-gray-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-denali-success">{result.imported}</p>
              <p className="text-xs text-denali-gray-500">Imported</p>
            </div>
            <div className="bg-denali-gray-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-denali-gray-400">{result.skipped}</p>
              <p className="text-xs text-denali-gray-500">Skipped</p>
            </div>
            <div className="bg-denali-gray-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-denali-danger">{result.errors.length}</p>
              <p className="text-xs text-denali-gray-500">Errors</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-4 space-y-1">
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-red-400">{err}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
