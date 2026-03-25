"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-denali-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-denali-cyan tracking-tight">DENALI</h1>
          <p className="text-sm text-denali-gray-500 mt-2">Recruiting Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-8">
          <h2 className="text-lg font-semibold text-denali-gray-100 mb-6">Sign In</h2>

          {/* SSO Button (production) */}
          <button
            disabled
            className="w-full py-3 px-4 bg-denali-gray-800 text-denali-gray-500 font-medium rounded-lg border border-denali-gray-700 mb-6 flex items-center justify-center gap-3 cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none"><path d="M10 0H0v10h10V0z" fill="#F25022"/><path d="M21 0H11v10h10V0z" fill="#7FBA00"/><path d="M10 11H0v10h10V11z" fill="#00A4EF"/><path d="M21 11H11v10h10V11z" fill="#FFB900"/></svg>
            Sign in with Microsoft
            <span className="text-xs text-denali-gray-600 ml-auto">(Coming soon)</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-denali-gray-800" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-2 bg-denali-gray-900 text-denali-gray-600">Dev Mode — Quick Access</span></div>
          </div>

          {/* Dev Mode Quick Links */}
          <div className="space-y-3">
            <Link
              href="/recruiter/dashboard"
              className="block w-full py-3 px-4 bg-denali-cyan/10 text-denali-cyan font-medium rounded-lg border border-denali-cyan/20 hover:bg-denali-cyan/20 transition-colors text-center"
            >
              Enter as Recruiter
            </Link>
            <Link
              href="/manager/dashboard"
              className="block w-full py-3 px-4 bg-purple-500/10 text-purple-400 font-medium rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors text-center"
            >
              Enter as Hiring Manager
            </Link>
            <Link
              href="/admin/dashboard"
              className="block w-full py-3 px-4 bg-denali-success/10 text-denali-success font-medium rounded-lg border border-denali-success/20 hover:bg-denali-success/20 transition-colors text-center"
            >
              Enter as Recruiting Manager (Admin)
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-denali-gray-700 mt-6">
          Denali Advanced Integration &middot; Phase 1 Prototype
        </p>
      </div>
    </div>
  );
}
