import { TopBar } from "@/components/shared/TopBar";
import { EdgeCard } from "@/components/shared/EdgeCard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-6 md:py-7">
      <TopBar />
      <EdgeCard />
      {children}
    </div>
  );
}
