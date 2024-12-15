"use client";
import FileContent from "@/components/content";
import Topfiles from "@/components/topfiles";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const pathname = usePathname();
  const id = pathname.split("/").pop();

  useEffect(() => {
    if (id && isNaN(Number(id))) {
      redirect("/404");
    }
  }, [id]);

  return (
    <main className="h-full p-5 dark:bg-dark-2">
      <Topfiles />
      <FileContent />
    </main>
  );
}
