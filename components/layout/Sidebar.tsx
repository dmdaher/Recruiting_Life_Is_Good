"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = {
  recruiter: [
    { href: "/recruiter/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/recruiter/pipeline", label: "Pipeline", icon: "🔄" },
    { href: "/recruiter/reqs", label: "Requisitions", icon: "📋" },
    { href: "/recruiter/hires", label: "Hires", icon: "✅" },
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
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
    { href: "/admin/audit-log", label: "Audit Log", icon: "📜" },
  ],
};

export function Sidebar({ role }: { role: "recruiter" | "manager" | "admin" }) {
  const pathname = usePathname();
  const items = navItems[role];

  return (
    <aside className="w-64 bg-denali-gray-900 border-r border-denali-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-denali-gray-800">
        <h1 className="text-xl font-bold text-denali-cyan tracking-tight">
          DENALI
        </h1>
        <p className="text-xs text-denali-gray-500 mt-1">Recruiting Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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

      {/* Footer */}
      <div className="p-4 border-t border-denali-gray-800">
        <p className="text-xs text-denali-gray-600">Phase 1 Prototype</p>
      </div>
    </aside>
  );
}
