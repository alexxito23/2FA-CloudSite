import FileContent from "@/components/content";
import Topfiles from "@/components/topfiles";
import { Suspense } from "react";

export default async function Dashboard({
  params,
}: {
  params: { userid: string };
}) {
  const { userid } = await params;
  return (
    <main className="dark:bg-dark-2 h-full">
      <Suspense fallback={<div>Cargando</div>}><div className="m-5"><Topfiles/><FileContent /></div></Suspense>
    </main>
  );
}
