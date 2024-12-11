'use client'
import FileContent from "@/components/content";
import Topfiles from "@/components/topfiles";
import { redirect, usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function Dashboard() {
  const pathname = usePathname();
  const id = pathname.split('/').pop(); 

  useEffect(() => {
    if (id && isNaN(Number(id))) {
      redirect('/404');
    }
  }, [id]);
  
  return (
    <main className="dark:bg-dark-2 h-full">
      <Suspense fallback={<div>Cargando</div>}><div className="m-5"><Topfiles/><FileContent /></div></Suspense>
    </main>
  );
}
