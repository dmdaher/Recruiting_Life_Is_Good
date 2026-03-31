"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = {
  recruiter: [
    { href: "/recruiter/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/recruiter/pipeline", label: "Pipeline", icon: "🔄" },
    { href: "/recruiter/reqs", label: "Requisitions", icon: "📋" },
    { href: "/recruiter/hires", label: "Hires", icon: "✅" },
    { href: "/recruiter/onboarding", label: "Onboarding", icon: "🚀" },
  ],
  manager: [
    { href: "/manager/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/manager/reqs", label: "My Requisitions", icon: "📋" },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/reports", label: "Reports", icon: "📄" },
    { href: "/admin/financial", label: "Financial", icon: "💰" },
    { href: "/admin/compliance", label: "Compliance", icon: "🛡️" },
    { href: "/admin/onboarding", label: "Onboarding", icon: "🚀" },
    { href: "/admin/import", label: "Import Data", icon: "📥" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
    { href: "/admin/audit-log", label: "Audit Log", icon: "📜" },
  ],
};

export function Sidebar({ role }: { role: "recruiter" | "manager" | "admin" }) {
  const pathname = usePathname();
  const items = navItems[role];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-denali-gray-900 border border-denali-gray-800 rounded-lg"
      >
        <svg className="w-5 h-5 text-denali-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 md:z-auto
          w-64 h-full bg-denali-gray-900 border-r border-denali-gray-800 flex flex-col
          transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-denali-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-denali-cyan tracking-tight">DENALI</h1>
            <p className="text-xs text-denali-gray-500 mt-1">Recruiting Platform</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-denali-gray-500 hover:text-denali-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-denali-cyan/10 text-denali-cyan"
                    : "text-denali-gray-400 hover:text-denali-gray-100 hover:bg-denali-gray-800"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Portal Switcher */}
        <div className="p-4 border-t border-denali-gray-800 space-y-1">
          <p className="text-[10px] text-denali-gray-600 uppercase tracking-wider mb-2">Switch Portal</p>
          {role !== "recruiter" && (
            <Link href="/recruiter/dashboard" onClick={() => setMobileOpen(false)} className="block text-xs text-denali-gray-500 hover:text-denali-cyan py-1">
              Recruiter View
            </Link>
          )}
          {role !== "admin" && (
            <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block text-xs text-denali-gray-500 hover:text-denali-cyan py-1">
              Admin View
            </Link>
          )}
          {role !== "manager" && (
            <Link href="/manager/dashboard" onClick={() => setMobileOpen(false)} className="block text-xs text-denali-gray-500 hover:text-denali-cyan py-1">
              Manager View
            </Link>
          )}
          <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-xs text-denali-gray-600 hover:text-denali-gray-400 py-1 mt-2">
            Sign Out
          </Link>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-denali-gray-800">
          <p className="text-xs text-denali-gray-600">Phase 1 Prototype</p>
        </div>
      </aside>
    </>
  );
}
