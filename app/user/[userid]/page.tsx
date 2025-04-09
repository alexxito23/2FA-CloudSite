"use client";
import FileContent from "@/components/content";
import Topfiles from "@/components/topfiles";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id && isNaN(Number(id))) {
      redirect("/404");
    }
  }, [id]);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });
      const data = await response.json();

      if (!data.authenticated) {
        router.push("/"); // Redirigir si no está autenticado
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <main className="h-full p-5 dark:bg-dark-2">
      <Topfiles />
      <FileContent />
    </main>
  );
}
