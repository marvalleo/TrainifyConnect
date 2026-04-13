import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";

export function AppLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-tc-background transition-all">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen w-full">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 technical-grid overflow-x-hidden">
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
