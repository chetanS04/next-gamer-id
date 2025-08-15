import Sidebar from "@/components/(dashboards)/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-[30px] px-5 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
