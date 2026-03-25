import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-denali-black">
      <Sidebar role="recruiter" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header userName="Dev Recruiter" role="Recruiter" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
