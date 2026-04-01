"use client";

import { ThemeToggle } from "./ThemeToggle";

export function Header({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  return (
    <header className="h-16 border-b border-denali-gray-800 bg-denali-gray-900 flex items-center justify-between px-6">
      <div>
        <h2 className="text-sm font-medium text-denali-gray-300">
          Good {getGreeting()}, {userName.split(" ")[0]}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <button className="relative p-2 text-denali-gray-400 hover:text-denali-gray-100 transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-denali-cyan rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-denali-cyan/20 flex items-center justify-center">
            <span className="text-xs font-bold text-denali-cyan">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-denali-gray-200">
              {userName}
            </p>
            <p className="text-xs text-denali-gray-500">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
