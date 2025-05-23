"use client";
import { ReactNode, useState } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { Toaster } from "sonner";

interface LayoutProps {
  children: ReactNode;
}

export default function DashLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <Toaster expand richColors position="top-right" />
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {children}
        </div>
      </div>
    </>
  );
}
