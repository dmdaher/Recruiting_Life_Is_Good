import { prisma } from "@/lib/db/client";

export default async function SettingsPage() {
  const [departments, locations, sources, agencies, clients, stages, employeeTypes, postingChannels, users] = await Promise.all([
    prisma.department.findMany({ orderBy: { code: "asc" } }),
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.source.findMany({ orderBy: { name: "asc" } }),
    prisma.agency.findMany({ orderBy: { name: "asc" } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.pipelineStage.findMany({ orderBy: { order: "asc" } }),
    prisma.employeeType.findMany({ orderBy: { code: "asc" } }),
    prisma.postingChannel.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  const sections = [
    { title: "Pipeline Stages", count: stages.length, icon: "🔄", items: stages.map((s) => `${s.order}. ${s.name}${s.isTerminal ? " (Terminal)" : ""}`) },
    { title: "Users", count: users.length, icon: "👤", items: users.map((u) => `${u.name} — ${u.role.replace("_", " ")}${!u.isActive ? " (Inactive)" : ""}`) },
    { title: "Departments", count: departments.length, icon: "🏢", items: departments.map((d) => `${d.code} — ${d.name}`) },
    { title: "Locations", count: locations.length, icon: "📍", items: locations.map((l) => `${l.name}, ${l.country}`) },
    { title: "Source Channels", count: sources.length, icon: "📡", items: sources.map((s) => s.name) },
    { title: "Agencies", count: agencies.length, icon: "🤝", items: agencies.map((a) => `${a.name} (${a.feeStructure.toLowerCase()})`) },
    { title: "Clients", count: clients.length, icon: "🏭", items: clients.map((c) => `${c.name}${c.requiresDrugScreen ? " · Drug Screen" : ""}${c.requiresAdditionalBGCheck ? " · Add'l BGC" : ""}`) },
    { title: "Employee Types", count: employeeTypes.length, icon: "📋", items: employeeTypes.map((e) => `Type ${e.code}: ${e.name}${e.isExempt ? " (Exempt)" : ""}`) },
    { title: "Posting Channels", count: postingChannels.length, icon: "📢", items: postingChannels.map((p) => p.name) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-denali-gray-100">Settings</h1>
        <p className="text-sm text-denali-gray-500 mt-1">Manage reference data, pipeline configuration, and users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div key={section.title} className="bg-denali-gray-900 rounded-xl border border-denali-gray-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-denali-gray-200 flex items-center gap-2">
                <span>{section.icon}</span>
                {section.title}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-denali-gray-800 text-denali-gray-400">{section.count}</span>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {section.items.map((item, i) => (
                <p key={i} className="text-xs text-denali-gray-500 py-0.5">{item}</p>
              ))}
            </div>
            <button className="mt-3 w-full py-2 text-xs font-medium text-denali-cyan bg-denali-cyan/10 rounded-lg hover:bg-denali-cyan/20 transition-colors">
              Manage
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
