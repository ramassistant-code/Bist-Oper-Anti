"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSigning = pathname.startsWith("/sign");

  if (isSigning) {
    return <main className="min-h-screen bg-slate-950 p-4 md:p-8">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <div className="flex flex-col min-h-screen">
        <Topbar />
        <main className="mr-64 p-8 flex-1">{children}</main>
      </div>
    </>
  );
}
