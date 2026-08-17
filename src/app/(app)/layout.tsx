import { Sidebar } from "@/components/shared/Sidebar";
import { TopBar } from "@/components/shared/TopBar";
import { EdgeCard } from "@/components/shared/EdgeCard";
import { NavTabs } from "@/components/shared/NavTabs";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-6 md:py-7">
          <TopBar />
          <EdgeCard />
          <NavTabs />
          {children}
        </div>
      </div>
    </div>
  );
}
