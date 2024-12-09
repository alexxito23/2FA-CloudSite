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
    <div className="dark:bg-dark-2">
      <Suspense fallback={<div>Cargando</div>}><div><Topfiles/><FileContent /></div></Suspense>
    </div>
  );
}
