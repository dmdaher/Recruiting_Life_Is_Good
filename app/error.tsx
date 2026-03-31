"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-denali-black flex items-center justify-center p-4">
      <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-denali-gray-100 mb-2">Something went wrong</h1>
        <p className="text-sm text-denali-gray-500 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-denali-cyan text-denali-black font-medium rounded-lg text-sm hover:bg-denali-cyan/90 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-denali-gray-800 text-denali-gray-300 font-medium rounded-lg text-sm hover:bg-denali-gray-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
